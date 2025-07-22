"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, DollarSign, User, Download, FileText, CreditCard } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Student, Fee, Assessment, Announcement } from "@/lib/types"
import jsPDF from "jspdf"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { generateAverageCollectionAssessments } from "@/lib/utils"

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [studentData, setStudentData] = useState<Student | null>(null)
  const [feeData, setFeeData] = useState<Fee | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [averageAssessments, setAverageAssessments] = useState<any[]>([])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (!user || user.role !== "student") {
        router.push("/login")
        return
      }
      loadStudentData()
    }
  }, [user, router, mounted])

  const loadStudentData = () => {
    if (!user) return

    // Get student data
    const allStudents = storage.students.getAll()
    const currentStudent = allStudents.find((s) => s.userId === user.id)
    setStudentData(currentStudent || null)

    if (currentStudent) {
      // Get all fee data for this student across all periods
      const allFees = storage.fees.getAll()
      const studentFees = allFees.filter((f) => f.studentId === currentStudent.id)
      
      if (studentFees.length > 0) {
        // Calculate totals across all periods
        const totalBilled = studentFees.reduce((sum, fee) => sum + (fee.totalBilled || 0), 0)
        const totalPaid = studentFees.reduce((sum, fee) => sum + (fee.totalPaid || 0), 0)
        const balance = totalBilled - totalPaid
        
        // Create aggregated fee data object
        const aggregatedFeeData: Fee = {
          id: 'aggregated',
          studentId: currentStudent.id,
          term: 'All Periods',
          totalBilled,
          totalPaid,
          balance,
          status: totalPaid > totalBilled ? "overpayment" : totalPaid === totalBilled && totalBilled > 0 ? "paid" : totalPaid > 0 ? "partial" : "pending",
          createdAt: new Date().toISOString(),
        }
        
        setFeeData(aggregatedFeeData)
      } else {
        setFeeData(null)
      }

      // Get assessments - only FINALIZED ones
      const allAssessments = storage.assessments.getAll()
      const allMyAssessments = storage.myAssessments.getAll()
      
      // Filter assessments for this student - only include FINALIZED assessments
      const studentAssessments = allAssessments.filter((a) => a.studentId === currentStudent.id && a.finalized)
      
      // Convert MyAssessments to Assessment format for consistency - only FINALIZED ones
      const myAssessmentsAsAssessments = allMyAssessments
        .filter((a) => a.studentId === currentStudent.id && a.finalized)
        .map((a) => ({
          id: a.id,
          studentId: a.studentId,
          subjectId: a.subjectId,
          term: a.term,
          className: a.className,
          subject: a.subjectName,
          assessmentType: a.assessmentType,
          totalMarks: a.totalMarks,
          marksObtained: a.marksObtained,
          grade: a.grade,
          comment: "",
          remarks: a.remarks,
          assessmentDate: a.assessmentDate,
          createdBy: a.createdBy,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          finalized: a.finalized,
          finalizedAt: a.finalizedAt,
          finalizedBy: a.finalizedBy
        }))

      // Combine finalized assessments only
      const combinedAssessments = [...studentAssessments, ...myAssessmentsAsAssessments]
      
      setAssessments(combinedAssessments.slice(0, 5)) // Show latest 5 finalized assessments

      // Calculate average assessments using ALL finalized assessments for the class (not just current student's)
      const allClassAssessmentsData = storage.assessments.getAll()
      const allClassMyAssessmentsData = storage.myAssessments.getAll()
      
      // Filter for finalized assessments for this class
      const classAssessments = allClassAssessmentsData.filter(a => 
        a.className === currentStudent.className && 
        a.finalized
      )
      
      // Convert MyAssessments to Assessment format and filter for finalized ones
      const classMyAssessments = allClassMyAssessmentsData
        .filter(a => 
          a.className === currentStudent.className && 
          a.finalized
        )
        .map(a => ({
          id: a.id,
          studentId: a.studentId,
          subjectId: a.subjectId,
          term: a.term,
          className: a.className,
          subject: a.subjectName,
          assessmentType: a.assessmentType,
          totalMarks: a.totalMarks,
          marksObtained: a.marksObtained,
          grade: a.grade,
          comment: "",
          remarks: a.remarks,
          assessmentDate: a.assessmentDate,
          createdBy: a.createdBy,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          finalized: a.finalized,
          finalizedAt: a.finalizedAt,
          finalizedBy: a.finalizedBy
        }))
      
      // Use ALL finalized assessments for the class
      const allClassAssessments = [...classAssessments, ...classMyAssessments]
      
      const averageData = generateAverageCollectionAssessments(
        allClassAssessments,
        allStudents,
        currentStudent.className,
        ["Open-Term Exam", "Mid-Term Exam", "End-Term Exam"]
      )
      // Find this student's average assessment
      const myAverage = averageData.find((a) => a.studentId === currentStudent.id)
      setAverageAssessments(myAverage ? [myAverage] : [])

      // Get relevant announcements
      const allAnnouncements = storage.announcements.getAll()
      const relevantAnnouncements = allAnnouncements.filter(
        (a) =>
          a.isActive &&
          (a.targetAudience === "all" ||
            a.targetAudience === "students" ||
            a.targetAudience === currentStudent.category),
      )
      setAnnouncements(relevantAnnouncements.slice(0, 5))
    }
  }

  const downloadReport = () => {
    if (!studentData || !assessments.length) return

    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text("ACADEMIC REPORT", 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.text(`Student: ${studentData?.firstName ?? ''} ${studentData?.lastName ?? ''}`, 20, 40)
    doc.text(`Admission Number: ${studentData?.admissionNumber ?? ''}`, 20, 48)
    doc.text(`Class: ${studentData?.className ?? ''}`, 20, 56)
    doc.text(`Category: ${studentData?.category ? studentData.category.charAt(0).toUpperCase() + studentData.category.slice(1) : ''}`, 20, 64)

    let y = 80
    doc.setFontSize(14)
    doc.text("FINALIZED ASSESSMENTS", 20, y)
    y += 8
    doc.setFontSize(10)
    // assessments array is already filtered for finalized assessments only
    assessments.forEach((assessment, index) => {
      doc.text(`${index + 1}. ${assessment?.subject ?? ''} - ${assessment?.assessmentType ?? ''}`, 20, y)
      y += 6
      doc.text(`Date: ${assessment?.assessmentDate ?? ''}`, 25, y)
      y += 6
      doc.text(`Marks: ${(assessment?.marksObtained ?? 0).toString()} / ${(assessment?.totalMarks ?? 0).toString()}`, 25, y)
      y += 6
      if (assessment?.remarks) {
        doc.text(`Remarks: ${assessment.remarks}`, 25, y)
        y += 6
      }
      y += 2
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    })
    doc.save(`${studentData.admissionNumber}_academic_report.pdf`)
  }

  if (!mounted || !user || user.role !== "student") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back, {studentData?.firstName} {studentData?.lastName}!
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admission Number</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{studentData?.admissionNumber}</div>
              <p className="text-xs text-muted-foreground">Your student ID</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentData?.className}</div>
              <p className="text-xs text-muted-foreground">Current class</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fee Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${typeof feeData?.balance === 'number' && !isNaN(feeData?.balance) && feeData?.balance > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {typeof feeData?.balance === 'number' && !isNaN(feeData?.balance) ? feeData.balance.toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">Outstanding balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Category</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge
                  variant={
                    studentData?.category === "tahfidh"
                      ? "default"
                      : studentData?.category === "integrated"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {studentData?.category ? studentData.category.charAt(0).toUpperCase() + studentData.category.slice(1) : ''}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Program category</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              {averageAssessments.length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(averageAssessments[0].subjectMarks).map(([subject, avg]) => (
                    <div key={subject} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">{subject}</div>
                        <div className="text-sm text-muted-foreground">Average Marks</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{Number(avg)}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 border rounded bg-muted">
                    <div className="font-medium">Total Average</div>
                    <div className="font-bold">{averageAssessments[0].totalMarks}</div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No assessments recorded yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-blue-500 pl-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{announcement.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {announcement.content.substring(0, 100)}
                            {announcement.content.length > 100 ? "..." : ""}
                          </p>
                        </div>
                        <Badge
                          variant={
                            announcement.priority === "urgent"
                              ? "destructive"
                              : announcement.priority === "high"
                                ? "default"
                                : "secondary"
                          }
                          className="ml-2"
                        >
                          {announcement.priority}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No announcements available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {feeData && (
          <Card>
            <CardHeader>
              <CardTitle>Fee Summary (All Periods)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{typeof feeData.totalBilled === 'number' && !isNaN(feeData.totalBilled) ? feeData.totalBilled.toFixed(2) : '0.00'}</div>
                  <div className="text-sm text-muted-foreground">Total Billed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{typeof feeData.totalPaid === 'number' && !isNaN(feeData.totalPaid) ? feeData.totalPaid.toFixed(2) : '0.00'}</div>
                  <div className="text-sm text-muted-foreground">Total Paid</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${typeof feeData.balance === 'number' && !isNaN(feeData.balance) && feeData.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                    {typeof feeData.balance === 'number' && !isNaN(feeData.balance) ? feeData.balance.toFixed(2) : '0.00'}
                  </div>
                  <div className="text-sm text-muted-foreground">Balance</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Showing totals across all billing periods
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
