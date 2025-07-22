"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { BookOpen, DollarSign, User, Download, FileText, TrendingUp, Award } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Student, Assessment, AcademicCommentRange, Staff, ClassStaffAssignment, CollectionAssessment } from "@/lib/types"
import { getLogoByCategory, generateAverageCollectionAssessments, generateCollectionAssessments } from "@/lib/utils"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const assessmentTypes = ["Open-Term Exam", "Mid-Term Exam", "End-Term Exam"]
const collectionAssessmentTypes = [...assessmentTypes, "Average"]

export default function StudentAcademics() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [studentData, setStudentData] = useState<Student | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [averageAssessments, setAverageAssessments] = useState<CollectionAssessment[]>([])
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>(collectionAssessmentTypes[0])
  const [collectionAssessments, setCollectionAssessments] = useState<CollectionAssessment[]>([])
  const [lang, setLang] = useState('en')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (!user || user.role !== "student") {
        router.push("/login")
        return
      }
      loadData()
    }
  }, [user, router, mounted])

  useEffect(() => {
    if (studentData && assessments.length > 0) {
      loadCollectionAssessments()
    }
  }, [selectedAssessmentType, studentData, assessments])

  const loadData = () => {
    if (!user) return

    // Get student data
    const allStudents = storage.students.getAll()
    const currentStudent = allStudents.find((s) => s.userId === user.id)
    setStudentData(currentStudent || null)

    if (currentStudent) {
      // Get all assessments from both regular assessments and myAssessments
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

      // Combine both types of assessments - only finalized ones
      const combinedAssessments = [...studentAssessments, ...myAssessmentsAsAssessments]
      
      // Sort by date (newest first)
      const sortedAssessments = combinedAssessments.sort(
        (a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
      )
      
      setAssessments(sortedAssessments)

      // Generate average assessments for this student's class using only FINALIZED assessments
      if (currentStudent.className) {
        const allStudentsInClass = allStudents.filter(s => s.className === currentStudent.className)
        
        // Get ALL finalized assessments for this class (not just current student's)
        const allAssessments = storage.assessments.getAll()
        const allMyAssessments = storage.myAssessments.getAll()
        
        // Filter for finalized assessments for this class
        const classAssessments = allAssessments.filter(a => 
          a.className === currentStudent.className && 
          a.finalized
        )
        
        // Convert MyAssessments to Assessment format and filter for finalized ones
        const classMyAssessments = allMyAssessments
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
          allStudentsInClass,
          currentStudent.className,
          assessmentTypes
        )
        
        // Find this student's average assessment
        const myAverage = averageData.find((a) => a.studentId === currentStudent.id)
        setAverageAssessments(myAverage ? [myAverage] : [])
      }
    }
  }

  const loadCollectionAssessments = () => {
    if (!studentData || !assessments.length) {
      setCollectionAssessments([])
      return
    }

    const allStudents = storage.students.getAll()
    const classStudents = allStudents.filter(s => s.className === studentData.className)
    
    if (selectedAssessmentType === "Average") {
      // Use the average assessments we already calculated (which are already filtered for finalized assessments)
      setCollectionAssessments(averageAssessments)
    } else {
      // Get ALL finalized assessments for this class and assessment type (not just current student's)
      const allAssessments = storage.assessments.getAll()
      const allMyAssessments = storage.myAssessments.getAll()
      
      // Filter for finalized assessments for this class and assessment type
      const classAssessments = allAssessments.filter(a => 
        a.className === studentData.className && 
        a.assessmentType === selectedAssessmentType && 
        a.finalized
      )
      
      // Convert MyAssessments to Assessment format and filter for finalized ones
      const classMyAssessments = allMyAssessments
        .filter(a => 
          a.className === studentData.className && 
          a.assessmentType === selectedAssessmentType && 
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
      
      // Combine all finalized assessments for the class
      const allClassAssessments = [...classAssessments, ...classMyAssessments]
      
      if (allClassAssessments.length === 0) {
        setCollectionAssessments([])
        return
      }

      // Get the term from the first assessment
      const term = allClassAssessments[0].term || "Term 1"
      
      // Generate collection data using ALL finalized assessments for the class
      const collectionData = generateCollectionAssessments(
        allClassAssessments,
        classStudents,
        studentData.className,
        term
      )
      
      // Find this student's collection assessment
      const myCollection = collectionData.find((a) => a.studentId === studentData.id)
      setCollectionAssessments(myCollection ? [myCollection] : [])
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-green-100 text-green-800"
      case "B": return "bg-blue-100 text-blue-800"
      case "C": return "bg-yellow-100 text-yellow-800"
      case "D": return "bg-orange-100 text-orange-800"
      case "F": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Function to get image as base64 (for logo)
  function getImageBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = function() {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL("image/jpeg");
          resolve(dataURL);
        } else {
          reject(new Error("Could not get canvas context"));
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // Individual download function for selected assessment type
  async function handleDownloadIndividualReport() {
    if (!studentData || collectionAssessments.length === 0) return

    const assessment = collectionAssessments[0]
    const allClasses = storage.classes.getAll()
    const allSubjects = storage.subjects.getAll()
    const allCommentRanges = storage.commentRanges.getAll()
    const allAcademicCommentRanges = storage.academicCommentRanges.getAll()
    const allStaff = storage.staff.getAll()
    const allClassStaffAssignments = storage.classStaffAssignments.getAll()
    
    const studentClass = allClasses.find(c => c.className === assessment.className)
    const classId = studentClass?.id
    
    // Find class incharge (main teacher)
    let classTeacherName = ""
    if (classId) {
      const inchargeAssignment = allClassStaffAssignments.find(a => a.classId === classId && a.role === "incharge")
      if (inchargeAssignment) {
        const teacher = allStaff.find(s => s.id === inchargeAssignment.staffId)
        if (teacher) classTeacherName = teacher.firstName + " " + teacher.lastName
      }
    }
    
    // Calculate average marks
    const subjectMarks = Object.values(assessment.subjectMarks)
    const totalMarksObtained = subjectMarks.reduce((sum, m) => sum + (typeof m === 'number' ? m : Number(m)), 0)
    const averageMarks: number = subjectMarks.length > 0 ? totalMarksObtained / subjectMarks.length : 0
    
    // Helper to get performance comment for a subject (from global comment ranges)
    const getAutoComment = (marksObtained: number): string => {
      const matchingComment = allCommentRanges.find((c) => marksObtained >= c.minMarks && marksObtained <= c.maxMarks)
      return matchingComment ? matchingComment.comment : "-"
    }
    
    // Helper to get overall performance comment based on average marks and academic comment ranges
    const getAcademicComment = (avg: number): AcademicCommentRange | undefined => {
      return allAcademicCommentRanges.find(
        (cr) => cr.classId === classId && avg >= cr.minAverage && avg <= cr.maxAverage
      )
    }
    
    const doc = new jsPDF()
    
    // Logo
    const validCategories = ["tahfidh", "integrated", "talim"]
    const classCategory = validCategories.includes(studentData.category as string) ? studentData.category as "tahfidh" | "integrated" | "talim" : "integrated"
    const logoUrl = getLogoByCategory(classCategory)
    let logoBase64 = undefined
    if (logoUrl) {
      try { 
        logoBase64 = await getImageBase64(logoUrl) 
      } catch {}
    }
    
    let y = 10
    const pageWidth = doc.internal.pageSize.getWidth()
    
    if (logoBase64) {
      doc.addImage(logoBase64, 'JPEG', pageWidth / 2 - 17.5, y, 35, 35)
      y += 40
    }
    
    // School name by category
    let schoolName = "Tanzil Education Centre"
    let schoolMotto = "Knowledge and Value"
    if (studentData.category === "integrated") schoolName = "Tanzil Integrated Academy"
    if (studentData.category === "tahfidh" || studentData.category === "talim") {
      schoolName = "Markaz Tanzil"
      schoolMotto = "Knowledge and Values"
    }
    
    doc.setFontSize(16)
    doc.text(schoolName, pageWidth / 2, y + 10, { align: "center" })
    doc.setFontSize(10)
    doc.text(schoolMotto, pageWidth / 2, y + 18, { align: "center" })
    y += 28
    
    // Student and report details
    doc.setFontSize(12)
    doc.text(`Student: ${assessment.studentName}`, 14, y)
    doc.text(`Admission Number: ${assessment.admissionNumber}`, 14, y + 8)
    doc.text(`Class: ${assessment.className}`, 14, y + 16)
    doc.text(`Assessment Type: ${selectedAssessmentType}`, 14, y + 24)
    doc.text(`Term: ${assessment.term || ''}`, 14, y + 32)
    y += 40
    
    // Table of subjects, marks, performance
    const tableColumn = ["Subject", "Marks Obtained", "Performance"]
    const tableRows = Object.entries(assessment.subjectMarks).map(([subject, mark]) => [
      subject, 
      mark, 
      getAutoComment(Number(mark))
    ])
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: y,
      styles: { fontSize: 10 }
    })
    
    let tableEndY = (doc as any).lastAutoTable.finalY || y + 10
    
    // Calculate overall performance using class-level comment ranges (CommentRange)
    let overallPerformance = "-"
    if (classId) {
      const commentRange = allCommentRanges.find(
        (cr: any) => cr.classId === classId && averageMarks >= cr.minMarks && averageMarks <= cr.maxMarks
      )
      if (commentRange) overallPerformance = commentRange.comment
    }
    
    // Get teacher and principal comments from AcademicCommentRange
    const academicComment = getAcademicComment(averageMarks)
    
    doc.setFontSize(12)
    doc.setFont('times', 'normal')
    // Horizontal line: Total Marks, Average, Rank (compact spacing)
    let x = 14
    doc.text(`Total Marks Obtained: ${totalMarksObtained}`, x, tableEndY + 10)
    x += 65
    doc.text(`Average Marks Obtained: ${averageMarks.toFixed(2)}`, x, tableEndY + 10)
    x += 60
    doc.text(`Rank: ${assessment.rank} / ${assessment.totalStudents}`, x, tableEndY + 10)
    // Next line: Overall Performance
    doc.text(`Overall Performance: ${overallPerformance}`, 14, tableEndY + 20)
    // Next line: Teacher's Comment
    doc.text(`Teacher's Comment: ${academicComment?.classTeacherComment || '-'}`, 14, tableEndY + 30)
    // Next line: Principal's Comment
    doc.text(`Principal's Comment: ${academicComment?.principalComment || '-'}`, 14, tableEndY + 40)
    // No stamp or related text at the bottom
    
    doc.save(`${selectedAssessmentType.toLowerCase().replace(/\s+/g, '_')}_report_${assessment.studentName.replace(/\s+/g, '_')}.pdf`)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
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
            <h2 className="text-3xl font-bold tracking-tight">Academic Records</h2>
            <p className="text-muted-foreground">Your assessment history and academic performance</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessments.length}</div>
              <p className="text-xs text-muted-foreground">Finalized assessments by main teacher</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageAssessments.length > 0 ? averageAssessments[0].totalMarks.toFixed(1) : '0.0'}
              </div>
              <p className="text-xs text-muted-foreground">Overall average marks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageAssessments.length > 0 ? `${averageAssessments[0].rank}/${averageAssessments[0].totalStudents}` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Your position in class</p>
            </CardContent>
          </Card>

        </div>

        {/* Assessment Type Selection and Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label className="text-sm font-medium">Select Assessment Type:</Label>
                <Select value={selectedAssessmentType} onValueChange={setSelectedAssessmentType}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Choose assessment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {collectionAssessmentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {collectionAssessments.length > 0 && (
                  <Button onClick={handleDownloadIndividualReport} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                )}
              </div>

              {collectionAssessments.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(collectionAssessments[0].subjectMarks).map(([subject, marks]) => (
                      <div key={subject} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <div className="font-medium">{subject}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedAssessmentType === "Average" ? "Average Marks" : "Marks Obtained"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{Number(marks)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center p-4 border rounded bg-muted">
                    <div className="font-medium">Total {selectedAssessmentType === "Average" ? "Average" : "Marks"}</div>
                    <div className="font-bold text-lg">{collectionAssessments[0].totalMarks}</div>
                  </div>

                  <div className="flex justify-between items-center p-3 border rounded">
                    <div className="font-medium">Class Rank</div>
                    <div className="font-bold">{collectionAssessments[0].rank}/{collectionAssessments[0].totalStudents}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedAssessmentType === "Average" 
                    ? "No average assessment data available for this class."
                    : `No ${selectedAssessmentType} assessments recorded yet.`
                  }
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Average Performance by Subject */}
        {averageAssessments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Average Performance by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
