"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, GraduationCap, User, BookOpen, Edit, FileText, Eye, Search, Plus, Trash2, UserCheck, BarChart3, Download, ChevronDown } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Staff, Assessment, Student, Subject, Class, ClassStaffAssignment, CollectionAssessment, MyAssessment, AcademicCommentRange } from "@/lib/types"
import { filterStudentsForStaff, generateCollectionAssessments, isMainClassTeacher, getStaffSubjectsInClass, generateAverageCollectionAssessments } from "@/lib/utils"
import { downloadFile } from "@/lib/file-utils"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const terms = ["Term 1", "Term 2", "Term 3"]
const collectionTerms = [...terms, "Average"]

const assessmentTypes = ["Open-Term Exam", "Mid-Term Exam", "End-Term Exam"]
const collectionAssessmentTypes = [...assessmentTypes, "Average"]

// Helper to calculate average marks for a student/subject/assessment type in the selected term
function getAverageMarksForAssessment(
  myAssessments: MyAssessment[],
  studentId: string,
  subjectName: string,
  assessmentType: string
): string {
  const filtered = myAssessments.filter((a: MyAssessment) => a.studentId === studentId && a.subjectName === subjectName && a.assessmentType === assessmentType)
  if (filtered.length === 0) return "0"
  const total = filtered.reduce((sum: number, a: MyAssessment) => sum + a.marksObtained, 0)
  return (total / filtered.length).toFixed(2)
}

// Helper to get the set of subjects assessed for a given assessment type and term
function getAssessedSubjects(collectionAssessments: CollectionAssessment[]): string[] {
  if (!collectionAssessments.length) return []
  // Get all unique subjects that have marks for at least one student
  const subjectSet = new Set<string>()
  collectionAssessments.forEach(assessment => {
    Object.entries(assessment.subjectMarks).forEach(([subject, mark]) => {
      if (mark > 0) subjectSet.add(subject)
    })
  })
  return Array.from(subjectSet)
}

// Utility to get performance comment for a mark, subject, and class
function getPerformanceComment(marksObtained: number, subjectId: string, classId: string | undefined): string {
  // CommentRange does not have subjectId, so only filter by classId
  // TODO: If subject-level comment ranges are needed, extend CommentRange type and update here
  const commentRanges = storage.commentRanges.getAll().filter(r => r.classId === classId)
  // Find the range for this subject and marks
  const range = commentRanges.find(r => marksObtained >= r.minMarks && marksObtained <= r.maxMarks)
  return range ? range.comment : ""
}

export default function StaffAssessments() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [staffData, setStaffData] = useState<Staff | null>(null)
  const [assignedClasses, setAssignedClasses] = useState<Class[]>([])
  const [classStaffAssignments, setClassStaffAssignments] = useState<ClassStaffAssignment[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [collectionAssessments, setCollectionAssessments] = useState<CollectionAssessment[]>([])
  const [myAssessments, setMyAssessments] = useState<MyAssessment[]>([])
  
  // UI State
  const [selectedMyClass, setSelectedMyClass] = useState<Class | null>(null)
  const [selectedCollectionAssessmentType, setSelectedCollectionAssessmentType] = useState<string>(assessmentTypes[0])
  const [selectedTerm, setSelectedTerm] = useState<string>("Term 1")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState<MyAssessment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Form Data
  const [assessmentData, setAssessmentData] = useState({
    studentId: "",
    subjectId: "",
    assessmentType: "Open-Term Exam",
    marksObtained: "",
    remarks: ""
  })

  // Add state for student search in the Select dropdown
  const [studentSearch, setStudentSearch] = useState("")

  // Only show collection data if there are assessments for the selected type
  const hasCollectionData = (() => {
    if (selectedCollectionAssessmentType === "Average") {
      return collectionAssessments.length > 0 && getAssessedSubjects(collectionAssessments).length > 0;
    }
    // For specific assessment types, check if there are any assessments for this type, class, and term
    if (!selectedMyClass) return false;
    const filtered = assessments.filter(a => a.term === selectedTerm && a.assessmentType === selectedCollectionAssessmentType && a.className === selectedMyClass.className);
    return filtered.length > 0 && collectionAssessments.length > 0 && getAssessedSubjects(collectionAssessments).length > 0;
  })();

  // 1. Add state for viewing student report
  const [viewingStudentReport, setViewingStudentReport] = useState<CollectionAssessment | null>(null)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)

  // Add state for assessment type filter
  const [selectedMyAssessmentType, setSelectedMyAssessmentType] = useState(assessmentTypes[0])

  // Add state for bulk finalize dialog
  const [isBulkFinalizeDialogOpen, setIsBulkFinalizeDialogOpen] = useState(false);
  const [bulkFinalizeClassId, setBulkFinalizeClassId] = useState("");
  const [bulkFinalizeSubjectId, setBulkFinalizeSubjectId] = useState("");
  const [bulkFinalizeAssessmentType, setBulkFinalizeAssessmentType] = useState("");

  // Add state for finalized assessment type filter
  const [finalizedAssessmentTypeFilter, setFinalizedAssessmentTypeFilter] = useState<string>("all");

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (!user || user.role !== "staff") {
        router.push("/login")
        return
      }
      loadData()
    }
  }, [user, router, mounted])

  useEffect(() => {
    if (selectedMyClass && selectedTerm && selectedCollectionAssessmentType) {
      loadAssessments()
    }
  }, [selectedMyClass, selectedTerm, selectedCollectionAssessmentType])

  const loadData = () => {
    if (!user) return

    // Get staff data
    const allStaff = storage.staff.getAll()
    const currentStaff = allStaff.find((s) => s.userId === user.id)
    setStaffData(currentStaff || null)

    if (currentStaff) {
      // Get class staff assignments for this staff member
      const allClassStaffAssignments = storage.classStaffAssignments.getAll()
      const myAssignments = allClassStaffAssignments.filter((a) => a.staffId === currentStaff.id)
      setClassStaffAssignments(myAssignments)

      // Get assigned classes based on staff assignments
      const allClasses = storage.classes.getAll()
      let myClasses: Class[] = []

      // Get classes where this staff is assigned (either as incharge or subject teacher)
      myAssignments.forEach((assignment) => {
        const classItem = allClasses.find((c) => c.id === assignment.classId)
        if (classItem && !myClasses.find((mc) => mc.id === classItem.id)) {
          myClasses.push(classItem)
        }
      })

      // Also include classes where they are the main teacher (admin assignment via Class.teacherId)
      const teachingClasses = allClasses.filter((c) => c.teacherId === currentStaff.id)
      teachingClasses.forEach((classItem) => {
        if (!myClasses.find((mc) => mc.id === classItem.id)) {
          myClasses.push(classItem)
        }
      })

      // If they have a specific class assigned (legacy support), include it
      if (currentStaff.classAssigned) {
        const assignedClass = allClasses.find((c) => c.className === currentStaff.classAssigned)
        if (assignedClass && !myClasses.find((mc) => mc.id === assignedClass.id)) {
          myClasses.push(assignedClass)
        }
      }

      setAssignedClasses(myClasses)

      // Set default selected class if not set
      if (myClasses.length > 0 && !selectedMyClass) {
        setSelectedMyClass(myClasses[0])
      }

      // Get subjects created by this staff
      const allSubjects = storage.subjects.getAll()
      setSubjects(allSubjects)

      // Get all students for name lookup
      const allStudents = storage.students.getAll()
      setStudents(allStudents)

      // Get all assessments
      const allAssessments = storage.assessments.getAll()
      setAssessments(allAssessments)

      // Set default selectedCollectionAssessmentType if not set
      if (!selectedCollectionAssessmentType) {
        setSelectedCollectionAssessmentType(assessmentTypes[0])
      }
    }
  }

  const loadAssessments = () => {
    if (!selectedMyClass || !staffData) return

    // Load my assessments (for subject teachers)
    const myAssessmentData = storage.myAssessments.getByClassAndTerm(selectedMyClass.className, selectedTerm, staffData.id)
    setMyAssessments(myAssessmentData)

    // For main class teachers, automatically generate collection assessments from FINALIZED assessments only
    if (isMainTeacherForSelectedClass()) {
      // Get all FINALIZED my assessments for this class and term (from all staff, not just current staff)
      const allMyAssessments = storage.myAssessments.getAll().filter(a => 
        a.className === selectedMyClass.className && 
        a.term === selectedTerm && 
        a.finalized // Only include finalized assessments
      )
      // Map MyAssessment[] to Assessment[] for aggregation functions
      const allMyAssessmentsAsAssessments = allMyAssessments.map(a => ({
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
        comment: "", // No comment in MyAssessment
        remarks: a.remarks,
        assessmentDate: a.assessmentDate,
        createdBy: a.createdBy,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        finalized: a.finalized,
        finalizedAt: a.finalizedAt,
        finalizedBy: a.finalizedBy
      }))
      if (selectedCollectionAssessmentType === "Average") {
        if (allMyAssessmentsAsAssessments.length === 0) {
          setCollectionAssessments([])
          return
        }
        // Average across all assessment types (only finalized assessments)
        const avgData = generateAverageCollectionAssessments(
          allMyAssessmentsAsAssessments,
          students,
          selectedMyClass.className,
          assessmentTypes
        )
        setCollectionAssessments(avgData)
      } else {
        // Only for the selected assessment type (only finalized assessments)
        const filteredAssessments = allMyAssessmentsAsAssessments.filter(a => a.assessmentType === selectedCollectionAssessmentType)
        if (filteredAssessments.length === 0) {
          setCollectionAssessments([])
          return
        }
        const classStudents = getClassStudents(selectedMyClass.id)
        const collectionData = generateCollectionAssessments(
          filteredAssessments,
          classStudents,
          selectedMyClass.className,
          selectedTerm
        )
        setCollectionAssessments(collectionData)
      }
    } else {
      setCollectionAssessments([])
    }
  }

  const handleCreateAssessment = () => {
    setEditingAssessment(null)
    setAssessmentData({
      studentId: "",
      subjectId: "",
      assessmentType: "Open-Term Exam",
      marksObtained: "",
      remarks: ""
    })
    setIsCreateDialogOpen(true)
  }

  const handleEditAssessment = (assessment: MyAssessment) => {
    setEditingAssessment(assessment)
    setAssessmentData({
      studentId: assessment.studentId,
      subjectId: assessment.subjectId,
      assessmentType: assessment.assessmentType,
      marksObtained: assessment.marksObtained.toString(),
      remarks: assessment.remarks
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm("Are you sure you want to delete this assessment? This will erase all history for this student in this assessment.")) return
    try {
      // Find the assessment to get studentId, subjectId, assessmentType
      const assessment = myAssessments.find(a => a.id === assessmentId)
      if (!assessment) throw new Error("Assessment not found")
      storage.myAssessments.deleteAllForStudentAssessment(assessment.studentId, assessment.subjectId, assessment.assessmentType)
      storage.assessments.deleteAllForStudentAssessment(assessment.studentId, assessment.subjectId, assessment.assessmentType)
      loadAssessments()
      alert("All assessment history for this student in this assessment has been deleted successfully")
    } catch (error) {
      console.error("Error deleting assessment:", error)
      alert("Failed to delete assessment history")
    }
  }

  const handleSubmitAssessment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!staffData || !selectedMyClass) return
    const student = students.find(s => s.id === assessmentData.studentId)
    const subject = subjects.find(s => s.id === assessmentData.subjectId)
    if (!student || !subject) {
      alert("Please select valid student and subject")
      return
    }
    const marksObtained = Number.parseFloat(assessmentData.marksObtained)
    const totalMarks = subject.maximumMarks
    const grade = calculateGrade(marksObtained, totalMarks)
    const newAssessment: MyAssessment = {
      id: editingAssessment?.id || Date.now().toString(),
      studentId: assessmentData.studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      className: selectedMyClass.className,
      subjectId: assessmentData.subjectId,
      subjectName: subject.subjectName,
      term: selectedTerm,
      assessmentType: assessmentData.assessmentType,
      marksObtained,
      totalMarks,
      grade,
      remarks: assessmentData.remarks,
      assessmentDate: new Date().toISOString(),
      createdBy: staffData.id,
      createdAt: editingAssessment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (editingAssessment) {
      storage.myAssessments.update(editingAssessment.id, newAssessment)
    } else {
      storage.myAssessments.add(newAssessment)
    }

    // Also add to the main assessments table for compatibility
    const mainAssessment: Assessment = {
      id: newAssessment.id,
      studentId: newAssessment.studentId,
      subjectId: newAssessment.subjectId,
      term: newAssessment.term,
      className: newAssessment.className,
      subject: newAssessment.subjectName,
      assessmentType: newAssessment.assessmentType,
      totalMarks: newAssessment.totalMarks,
      marksObtained: newAssessment.marksObtained,
      grade: newAssessment.grade,
      comment: "",
      remarks: newAssessment.remarks,
      assessmentDate: newAssessment.assessmentDate,
      createdBy: newAssessment.createdBy,
      createdAt: newAssessment.createdAt,
      updatedAt: newAssessment.updatedAt
    }

    if (editingAssessment) {
      storage.assessments.update(mainAssessment.id, mainAssessment)
    } else {
      storage.assessments.add(mainAssessment)
    }

    // Always reload assessments so UI updates immediately
    loadAssessments()

    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingAssessment(null)
  }

  const calculateGrade = (obtained: number, total: number) => {
    const percentage = (obtained / total) * 100
    if (percentage >= 90) return "A+"
    if (percentage >= 80) return "A"
    if (percentage >= 70) return "B+"
    if (percentage >= 60) return "B"
    if (percentage >= 50) return "C"
    if (percentage >= 40) return "D"
    return "F"
  }

  const getClassStudents = (classId: string) => {
    const classItem = assignedClasses.find(c => c.id === classId)
    if (!classItem) return []
    
    // Filter students by category based on admission number codes
    const allStudents = storage.students.getAll()
    const categoryStudents = filterStudentsForStaff(allStudents, [classItem], staffData)
    
    // Then filter by class name
    return categoryStudents.filter(s => s.className === classItem.className)
  }

  const getStaffSubjectsInSelectedClass = () => {
    if (!selectedMyClass || !staffData) return []
    return getStaffSubjectsInClass(staffData.id, selectedMyClass.id, subjects)
  }

  const isMainTeacherForSelectedClass = () => {
    if (!selectedMyClass || !staffData) return false
    const allClasses = storage.classes.getAll()
    return isMainClassTeacher(staffData.id, selectedMyClass.id, classStaffAssignments, allClasses)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // 2. Add handler to open report dialog
  const handleViewStudentReport = (assessment: CollectionAssessment) => {
    setViewingStudentReport(assessment)
    setIsReportDialogOpen(true)
  }

  // 3. Add handler to download report as PDF
  const handleDownloadReport = async () => {
    if (!viewingStudentReport) return
    // Use portrait layout for individual report
    const doc = new jsPDF()
    // Determine logo based on class category
    let logoUrl = ""
    if (selectedMyClass?.category === "integrated") {
      logoUrl = "/Integraed logo.jpeg"
    } else if (selectedMyClass?.category === "tahfidh" || selectedMyClass?.category === "talim") {
      logoUrl = "/Talim and Tahfidh logo.jpeg"
    }
    // Helper to fetch image as base64
    function getImageBase64(url: string): Promise<string> {
      return fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }))
    }
    // Render PDF after logo is loaded
    const renderPDF = (logoBase64?: string) => {
      let y = 10
      const pageWidth = doc.internal.pageSize.getWidth()
      if (logoBase64) {
        // Add logo at the top center
        doc.addImage(logoBase64, 'JPEG', pageWidth / 2 - 17.5, y, 35, 35)
        y += 40
      }
      // School name by category
      let schoolName = "Tanzil Integrated Academy"
      let schoolMotto = "Knowledge and Value"
      if (selectedMyClass?.category === "tahfidh" || selectedMyClass?.category === "talim") {
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
      doc.text(`Student: ${viewingStudentReport.studentName}`, 14, y)
      doc.text(`Admission Number: ${viewingStudentReport.admissionNumber}`, 14, y + 8)
      doc.text(`Class: ${viewingStudentReport.className}`, 14, y + 16)
      doc.text(`Term: ${viewingStudentReport.term}`, 14, y + 24)
      y += 32
      // Table of subjects, marks, performance
      const tableColumn = ["Subject", "Marks Obtained", "Performance"]
      const tableRows = Object.entries(viewingStudentReport.subjectMarks).map(([subject, mark]) => {
        const subj = subjects.find(s => s.subjectName === subject && s.classId === selectedMyClass?.id)
        const subjectId = subj ? subj.id : ""
        return [subject, mark, getPerformanceComment(mark, subjectId, selectedMyClass?.id)]
      })
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: y,
        styles: { fontSize: 10 }
      })
      // Total and rank
      let tableEndY = (doc as any).lastAutoTable.finalY || y + 10
      // Calculate average marks
      const subjectMarks = Object.values(viewingStudentReport.subjectMarks)
      const totalMarksObtained = subjectMarks.reduce((sum, m) => sum + (typeof m === 'number' ? m : Number(m)), 0)
      const averageMarks = subjectMarks.length > 0 ? totalMarksObtained / subjectMarks.length : 0
      // Fetch academic comment
      const allAcademicCommentRanges = storage.academicCommentRanges.getAll()
      const allStaff = storage.staff.getAll()
      const allClassStaffAssignments = storage.classStaffAssignments.getAll()
      let classTeacherName = ""
      if (selectedMyClass?.id) {
        const inchargeAssignment = allClassStaffAssignments.find(a => a.classId === selectedMyClass.id && a.role === "incharge")
        if (inchargeAssignment) {
          const teacher = allStaff.find(s => s.id === inchargeAssignment.staffId)
          if (teacher) classTeacherName = teacher.firstName + " " + teacher.lastName
        }
      }
      const getAcademicComment = (avg: number): AcademicCommentRange | undefined => {
        return allAcademicCommentRanges.find(
          (cr) => cr.classId === selectedMyClass?.id && avg >= cr.minAverage && avg <= cr.maxAverage
        )
      }
      // Calculate overall performance using class-level comment ranges (CommentRange)
      let overallPerformance = "-";
      if (selectedMyClass?.id) {
        const classId = selectedMyClass.id;
        const allCommentRanges = storage.commentRanges.getAll();
        const commentRange = allCommentRanges.find(
          (cr: any) => cr.classId === classId && averageMarks >= cr.minMarks && averageMarks <= cr.maxMarks
        );
        if (commentRange) overallPerformance = commentRange.comment;
      }
      // Get teacher and principal comments from AcademicCommentRange
      const academicComment = getAcademicComment(averageMarks);
      doc.setFontSize(12)
      doc.setFont('times', 'normal')
      // Horizontal line: Total Marks, Average, Rank (compact spacing)
      let x = 14;
      doc.text(`Total Marks Obtained: ${totalMarksObtained}`, x, tableEndY + 10)
      x += 65;
      doc.text(`Average Marks Obtained: ${averageMarks.toFixed(2)}`, x, tableEndY + 10)
      x += 60;
      doc.text(`Rank: ${viewingStudentReport.rank} / ${viewingStudentReport.totalStudents}`, x, tableEndY + 10)
      // Next line: Overall Performance
      doc.text(`Overall Performance: ${overallPerformance}`, 14, tableEndY + 20)
      // Next line: Teacher's Comment
      doc.text(`Teacher's Comment: ${academicComment?.classTeacherComment || '-'}`, 14, tableEndY + 30)
      // Next line: Principal's Comment
      doc.text(`Principal's Comment: ${academicComment?.principalComment || '-'}`, 14, tableEndY + 40)
      // No stamp or related text at the bottom
      doc.save(`assessment_report_${viewingStudentReport.studentName.replace(/\s+/g, '_')}.pdf`)
    }
    if (logoUrl) {
      getImageBase64(logoUrl).then(renderPDF)
    } else {
      renderPDF()
    }
  }

  // Add the handler for PDF download
  function handleDownloadGrandAssessmentPDF() {
    // Use landscape layout
    const doc = new jsPDF({ orientation: "landscape" })
    // Determine logo based on class category
    let logoUrl = ""
    if (selectedMyClass?.category === "integrated") {
      logoUrl = "/Integraed logo.jpeg"
    } else if (selectedMyClass?.category === "tahfidh" || selectedMyClass?.category === "talim") {
      logoUrl = "/Talim and Tahfidh logo.jpeg"
    }

    // Helper to fetch image as base64
    function getImageBase64(url: string): Promise<string> {
      return fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }))
    }

    // Render PDF after logo is loaded
    const renderPDF = (logoBase64?: string) => {
      let y = 10
      const pageWidth = doc.internal.pageSize.getWidth()
      if (logoBase64) {
        // Add logo at the top center
        doc.addImage(logoBase64, 'JPEG', pageWidth / 2 - 17.5, y, 35, 35)
        y += 40
      }
      // School name by category
      let schoolName = "Tanzil Integrated Academy"
      if (selectedMyClass?.category === "tahfidh" || selectedMyClass?.category === "talim") {
        schoolName = "Markaz Tanzil"
      }
      doc.setFontSize(20)
      doc.text(schoolName, pageWidth / 2, y + 10, { align: "center" })
      // School motto
      doc.setFontSize(12)
      doc.text("Knowledge and Value", pageWidth / 2, y + 20, { align: "center" })
      y += 30
      // Category, class, term, assessment type (left-aligned)
      doc.setFontSize(12)
      doc.text(`Category: ${selectedMyClass?.category ? selectedMyClass.category.charAt(0).toUpperCase() + selectedMyClass.category.slice(1) : ""}`, 14, y + 8)
      doc.text(`Class: ${selectedMyClass?.className || ""}`, 14, y + 16)
      doc.text(`Term: ${selectedTerm}`, 14, y + 24)
      doc.text(`Assessment Type: ${selectedCollectionAssessmentType}`, 14, y + 32)
      y += 38
      // Prepare table data
      const tableColumn = ["Rank", "Student Name", "Admission No.", ...getAssessedSubjects(collectionAssessments).map(subject => subject), "Total Marks"]
      const tableRows = collectionAssessments.map(assessment => [
        assessment.rank,
        assessment.studentName,
        assessment.admissionNumber,
        ...getAssessedSubjects(collectionAssessments).map(subject => assessment.subjectMarks[subject] !== undefined ? assessment.subjectMarks[subject] : ""),
        assessment.totalMarks
      ])
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: y,
        styles: { fontSize: 10 }
      })
      doc.save(`grand_assessment_${selectedMyClass?.className || ""}_${selectedTerm}.pdf`)
    }

    if (logoUrl) {
      getImageBase64(logoUrl).then(renderPDF)
    } else {
      renderPDF()
    }
  }

  // Add the following helper functions and handlers:
  // getFinalizedSubjectsForClass, handleFinalizeAssessment, handleUnfinalize
  const getFinalizedSubjectsForClass = () => {
    if (!selectedMyClass) return [];
    const finalizedSets: {
      className: string;
      category: string;
      subjectId: string;
      subjectName: string;
      teacherId: string;
      teacherName: string;
      assessmentType: string;
    }[] = [];
    const seen = new Set<string>();
    const allMyAssessments = storage.myAssessments.getAll();
    const allSubjects = storage.subjects.getAll();
    const allStaff = storage.staff.getAll();
    // Only consider assessments for the selected class and term
    allMyAssessments.forEach(myAssessment => {
      if (
        myAssessment.finalized &&
        myAssessment.finalizedBy &&
        myAssessment.className === selectedMyClass.className &&
        myAssessment.term === selectedTerm
      ) {
        const subject = allSubjects.find(s => s.id === myAssessment.subjectId);
        // Try to match both staffId and id for robustness
        const teacher = allStaff.find(s => s.staffId === myAssessment.finalizedBy || s.id === myAssessment.finalizedBy);
        if (subject && teacher) {
          const key = `${myAssessment.className}|${subject.id}|${myAssessment.assessmentType}|${teacher.staffId}`;
          if (!seen.has(key)) {
            finalizedSets.push({
              className: myAssessment.className,
              category: assignedClasses.find(c => c.className === myAssessment.className)?.category || '',
              subjectId: subject.id,
              subjectName: subject.subjectName,
              teacherId: teacher.staffId,
              teacherName: `${teacher.firstName} ${teacher.lastName}`,
              assessmentType: myAssessment.assessmentType
            });
            seen.add(key);
          }
        }
      }
    });
    return finalizedSets;
  };

  const handleFinalizeAssessment = async (assessment: MyAssessment) => {
    if (!confirm("Are you sure you want to finalize this assessment? This action cannot be undone.")) return;
    try {
      const updatedAssessment = { ...assessment, finalized: true };
      storage.myAssessments.update(assessment.id, updatedAssessment);
      loadAssessments(); // Reload to update UI
      alert("Assessment finalized successfully!");
    } catch (error) {
      console.error("Error finalizing assessment:", error);
      alert("Failed to finalize assessment.");
    }
  };

  const handleUnfinalizeAssessment = async (assessment: MyAssessment) => {
    if (!confirm("Are you sure you want to unfinalize this assessment? This action cannot be undone.")) return;
    try {
      const updatedAssessment = { ...assessment, finalized: false };
      storage.myAssessments.update(assessment.id, updatedAssessment);
      loadAssessments(); // Reload to update UI
      alert("Assessment unfinalized successfully!");
    } catch (error) {
      console.error("Error unfinalizing assessment:", error);
      alert("Failed to unfinalize assessment.");
    }
  };

  const handleUnfinalize = async (item: {
    className: string;
    category: string;
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    assessmentType: string;
  }) => {
    if (!confirm("Are you sure you want to unfinalize this assessment? This will remove it from the grand assessment and allow editing, deleting, or re-finalizing by the subject staff.")) return;
    // Find the staff object for this teacherId
    const teacher = storage.staff.getAll().find(s => s.staffId === item.teacherId || s.id === item.teacherId);
    if (!teacher) {
      alert("Teacher not found for this assessment.");
      return;
    }
    // Unfinalize all relevant assessments for this subject/teacher/assessmentType/class/term
    // Match both staffId and id for robustness
    const assessments = storage.myAssessments.getAll().filter(a =>
      a.className === item.className &&
      a.subjectId === item.subjectId &&
      a.assessmentType === item.assessmentType &&
      (a.createdBy === teacher.staffId || a.createdBy === teacher.id) &&
      a.finalized
    );
    if (assessments.length > 0) {
      assessments.forEach(a => {
        storage.myAssessments.update(a.id, { ...a, finalized: false });
      });
      loadAssessments();
      alert("Assessments unfinalized successfully!\nThey are now removed from the grand assessment and can be edited, deleted, or finalized again by the subject staff.");
    } else {
      alert("No finalized assessments found for unfinalization.");
    }
  };

  const handleBulkFinalize = () => {
    if (!bulkFinalizeClassId || !bulkFinalizeSubjectId || !bulkFinalizeAssessmentType || !staffData) return;
    const assessments = storage.myAssessments.getAll().filter(a =>
      a.className === assignedClasses.find(c => c.id === bulkFinalizeClassId)?.className &&
      a.subjectId === bulkFinalizeSubjectId &&
      a.assessmentType === bulkFinalizeAssessmentType &&
      a.createdBy === staffData.id &&
      !a.finalized
    );
    if (assessments.length === 0) {
      alert("No matching assessments to finalize.");
      return;
    }
    assessments.forEach(a => {
      storage.myAssessments.update(a.id, {
        ...a,
        finalized: true,
        finalizedBy: staffData.id,
        finalizedAt: new Date().toISOString()
      });
    });
    setIsBulkFinalizeDialogOpen(false);
    setBulkFinalizeClassId("");
    setBulkFinalizeSubjectId("");
    setBulkFinalizeAssessmentType("");
    loadAssessments();
    alert("Assessments finalized successfully!");
  };

  if (!mounted || !user || user.role !== "staff") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
          <div>
          <h2 className="text-3xl font-bold tracking-tight">Assessments</h2>
          <p className="text-muted-foreground">Manage student assessments and view performance</p>
        </div>

        {/* Class and Term Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Class and Term</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="class">Class</Label>
                <Select 
                  value={selectedMyClass?.id || ""} 
                  onValueChange={(value) => {
                    const classItem = assignedClasses.find(c => c.id === value)
                    setSelectedMyClass(classItem || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {(assignedClasses || []).map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.className} ({classItem.category})
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="term">Term</Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedMyClass && (
          <Tabs defaultValue="my_assessments" className="space-y-4">
            <TabsList>
              <TabsTrigger value="my_assessments">My Assessments</TabsTrigger>
              {isMainTeacherForSelectedClass() && (
                <TabsTrigger value="finalized_assessments">Finalized Assessments</TabsTrigger>
              )}
              {isMainTeacherForSelectedClass() && (
                <TabsTrigger value="grand_assessments">Grand Assessment</TabsTrigger>
              )}
            </TabsList>

            {/* My Assessments Tab - For Subject Teachers */}
            <TabsContent value="my_assessments" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>My Assessments</CardTitle>
                  <div className="flex gap-2">
                    <Label htmlFor="my-class-select">Class</Label>
                    <Select
                      value={selectedMyClass?.id || ""}
                      onValueChange={value => {
                        const classItem = assignedClasses.find(c => c.id === value)
                        setSelectedMyClass(classItem || null)
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {(assignedClasses || []).map(classItem => (
                          <SelectItem key={classItem.id} value={classItem.id}>{classItem.className} ({classItem.category})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Assessment Type Dropdown */}
                    <Label htmlFor="my-assessment-type-select">Assessment Type</Label>
                    <Select
                      value={selectedMyAssessmentType}
                      onValueChange={value => setSelectedMyAssessmentType(value)}
                    >
                      <SelectTrigger><SelectValue placeholder="Select assessment type" /></SelectTrigger>
                      <SelectContent>
                        {(assessmentTypes || []).map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCreateAssessment}>
                      <Plus className="mr-2 h-4 w-4" /> Add Assessment
                    </Button>
                    <Button
                      onClick={() => setIsBulkFinalizeDialogOpen(true)}
                      style={{ border: '2px solid #22c55e', color: '#22c55e' }}
                      variant="outline"
                    >
                      Finalize Assessments
                    </Button>
                    <Dialog open={isBulkFinalizeDialogOpen} onOpenChange={setIsBulkFinalizeDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Finalize Assessments</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Label>Class</Label>
                          <Select value={bulkFinalizeClassId} onValueChange={setBulkFinalizeClassId}>
                            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                            <SelectContent>
                              {(assignedClasses || []).map(classItem => (
                                <SelectItem key={classItem.id} value={classItem.id}>{classItem.className} ({classItem.category})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Label>Subject</Label>
                          <Select value={bulkFinalizeSubjectId} onValueChange={setBulkFinalizeSubjectId}>
                            <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                            <SelectContent>
                              {(getStaffSubjectsInClass(staffData?.id || '', bulkFinalizeClassId, subjects) || []).map(subject => (
                                <SelectItem key={subject.id} value={subject.id}>{subject.subjectName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Label>Assessment Type</Label>
                          <Select value={bulkFinalizeAssessmentType} onValueChange={setBulkFinalizeAssessmentType}>
                            <SelectTrigger><SelectValue placeholder="Select assessment type" /></SelectTrigger>
                            <SelectContent>
                              {(assessmentTypes || []).map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button onClick={handleBulkFinalize} disabled={!bulkFinalizeClassId || !bulkFinalizeSubjectId || !bulkFinalizeAssessmentType}>
                            Finalize
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {getStaffSubjectsInSelectedClass().length === 0 ? (
                    <p className="text-muted-foreground">You are not assigned to teach any subjects in this class.</p>
                  ) : myAssessments.length === 0 ? (
                    <p className="text-muted-foreground">No assessments found. Click "Add Assessment" to create one.</p>
                  ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                          <TableHead>Student Name</TableHead>
                        <TableHead>Admission No.</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Assessment Type</TableHead>
                          <TableHead>Marks</TableHead>
                          <TableHead>Average Marks</TableHead>
                          <TableHead>Performance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {myAssessments
                          .filter(a => a.assessmentType === selectedMyAssessmentType)
                          .map((assessment) => (
                            <TableRow key={assessment.id}>
                              <TableCell className="font-medium">{assessment.studentName}</TableCell>
                              <TableCell className="font-mono">{assessment.admissionNumber}</TableCell>
                              <TableCell>{assessment.subjectName}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{assessment.assessmentType}</Badge>
                              </TableCell>
                              <TableCell className="font-mono">
                                {assessment.marksObtained}/{assessment.totalMarks}
                              </TableCell>
                              <TableCell className="font-mono">
                                {getAverageMarksForAssessment(myAssessments, assessment.studentId, assessment.subjectName, assessment.assessmentType)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{getPerformanceComment(assessment.marksObtained, assessment.subjectId, selectedMyClass?.id)}</Badge>
                              </TableCell>
                              <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleEditAssessment(assessment)}
                                  disabled={assessment.finalized}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleDeleteAssessment(assessment.id)}
                                  disabled={assessment.finalized}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Finalized Assessments Tab - For Main Class Teachers */}
            {isMainTeacherForSelectedClass() && (
              <TabsContent value="finalized_assessments" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Finalized Assessments</CardTitle>
                    {/* Assessment Type Filter Dropdown */}
                    <div className="flex gap-2 items-center">
                      <Label htmlFor="finalized-assessment-type-filter">Assessment Type</Label>
                      <Select
                        value={finalizedAssessmentTypeFilter}
                        onValueChange={value => setFinalizedAssessmentTypeFilter(value)}
                      >
                        <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All types</SelectItem>
                          {(assessmentTypes || []).map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {getFinalizedSubjectsForClass().length === 0 ? (
                      <p className="text-muted-foreground">No assessments have been finalized yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Subject</TableHead>
                              <TableHead>Teacher's Name</TableHead>
                              <TableHead>Class/Category</TableHead>
                              <TableHead>Assessment Type</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getFinalizedSubjectsForClass()
                              .filter(item => finalizedAssessmentTypeFilter === "all" || item.assessmentType === finalizedAssessmentTypeFilter)
                              .map(item => (
                                <TableRow key={`${item.className}|${item.subjectId}|${item.assessmentType}|${item.teacherId}`}>
                                  <TableCell>{item.subjectName}</TableCell>
                                  <TableCell>{item.teacherName}</TableCell>
                                  <TableCell>{item.className} / {item.category}</TableCell>
                                  <TableCell>{item.assessmentType}</TableCell>
                                  <TableCell>
                                    <Badge variant="default">Finalized</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button size="sm" variant="outline" onClick={() => handleUnfinalize(item)}>
                                      Unfinalize
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Grand Assessment Tab - For Main Class Teachers */}
            {isMainTeacherForSelectedClass() && (
              <TabsContent value="grand_assessments" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Grand Assessment</CardTitle>
                    <div className="flex gap-2">
                      <Label htmlFor="grand-assessment-type-select">Assessment Type</Label>
                      <Select
                        value={selectedCollectionAssessmentType}
                        onValueChange={value => setSelectedCollectionAssessmentType(value)}
                      >
                        <SelectTrigger><SelectValue placeholder="Select assessment type" /></SelectTrigger>
                        <SelectContent>
                          {collectionAssessmentTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* Download PDF Button */}
                      <Button onClick={handleDownloadGrandAssessmentPDF} variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!hasCollectionData ? (
                      <p className="text-muted-foreground">
                        No grand assessment data available for the selected assessment type. Data will be automatically generated when assessments are entered.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Rank</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Admission No.</TableHead>
                              {getAssessedSubjects(collectionAssessments).map((subject) => {
                                const subjObj = subjects.find(s => s.subjectName === subject && s.classId === selectedMyClass?.id)
                                const subjectId = subjObj ? subjObj.id : ""
                                return (
                                  <TableHead key={subject}>{subject}</TableHead>
                                )
                              })}
                              <TableHead>Total Marks</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(collectionAssessments
                              .filter(assessment => {
                                // Only include if all subject marks are from finalized assessments
                                return Object.keys(assessment.subjectMarks).every(subjectName => {
                                  const subjObj = subjects.find(s => s.subjectName === subjectName && s.classId === selectedMyClass?.id)
                                  if (!subjObj) return false;
                                  // Find any assessment for this subject/student/assessmentType that is not finalized
                                  const myAssessmentsForSubject = storage.myAssessments.getAll().filter(a =>
                                    a.studentId === assessment.studentId &&
                                    a.subjectId === subjObj.id &&
                                    a.assessmentType === selectedCollectionAssessmentType &&
                                    a.className === selectedMyClass?.className
                                  );
                                  return myAssessmentsForSubject.every(a => a.finalized);
                                });
                              })
                            ).map((assessment) => (
                                <TableRow key={assessment.id}>
                                  <TableCell>
                                    <Badge variant={assessment.rank === 1 ? "default" : assessment.rank <= 3 ? "secondary" : "outline"}>
                                      {assessment.rank}/{assessment.totalStudents}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-medium">{assessment.studentName}</TableCell>
                                  <TableCell className="font-mono">{assessment.admissionNumber}</TableCell>
                                  {getAssessedSubjects(collectionAssessments).map((subject) => {
                                    const subjObj = subjects.find(s => s.subjectName === subject && s.classId === selectedMyClass?.id)
                                    const subjectId = subjObj ? subjObj.id : ""
                                    return (
                                      <TableCell key={subject} className="font-mono">
                                        {assessment.subjectMarks[subject] !== undefined ? (
                                          <>
                                            {assessment.subjectMarks[subject]}
                                            <br />
                                            <span className="text-xs text-muted-foreground">
                                              {getPerformanceComment(assessment.subjectMarks[subject], subjectId, selectedMyClass?.id)}
                                            </span>
                                          </>
                                        ) : ""}
                                      </TableCell>
                                    )
                                  })}
                                  <TableCell className="font-mono">{assessment.totalMarks}</TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button size="sm" variant="outline" onClick={() => handleViewStudentReport(assessment)}>
                                        <Eye className="h-4 w-4" /> View
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        )}

        {/* Create/Edit Assessment Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setIsEditDialogOpen(false)
            setEditingAssessment(null)
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAssessment ? "Edit Assessment" : "Create New Assessment"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitAssessment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentId">Student</Label>
                  {/* Searchable Select Dropdown for Students */}
                  <Select
                    value={assessmentData.studentId}
                    onValueChange={(value) => setAssessmentData({ ...assessmentData, studentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Search input at the top of the dropdown */}
                      <div className="px-2 py-1 sticky top-0 z-10 bg-popover">
                        <input
                          type="text"
                          placeholder="Search student..."
                          className="w-full px-2 py-1 border rounded text-sm"
                          value={studentSearch || ""}
                          onChange={e => setStudentSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      {getClassStudents(selectedMyClass?.id || "")
                        .filter(student => {
                          if (!studentSearch) return true;
                          const search = studentSearch.toLowerCase();
                          return (
                            student.firstName.toLowerCase().includes(search) ||
                            student.lastName.toLowerCase().includes(search) ||
                            student.admissionNumber.toLowerCase().includes(search)
                          );
                        })
                        .map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.firstName} {student.lastName} ({student.admissionNumber})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subjectId">Subject</Label>
                                <Select
                    value={assessmentData.subjectId}
                    onValueChange={(value) => setAssessmentData({ ...assessmentData, subjectId: value })}
                                >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                                  </SelectTrigger>
                                  <SelectContent>
                      {getStaffSubjectsInSelectedClass().map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.subjectName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assessmentType">Assessment Type</Label>
                                <Select
                    value={assessmentData.assessmentType}
                    onValueChange={(value) => setAssessmentData({ ...assessmentData, assessmentType: value })}
                                >
                    <SelectTrigger>
                      <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {assessmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                </div>
                <div>
                <Label htmlFor="marksObtained">Marks Obtained</Label>
                  <Input
                  id="marksObtained"
                  type="number"
                  step="0.01"
                  value={assessmentData.marksObtained}
                  onChange={(e) => setAssessmentData({ ...assessmentData, marksObtained: e.target.value })}
                    required
                  />
                </div>
                <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={assessmentData.remarks}
                  onChange={(e) => setAssessmentData({ ...assessmentData, remarks: e.target.value })}
                  placeholder="Optional remarks about the assessment"
                  />
                </div>
              <Button type="submit" className="w-full">
                {editingAssessment ? "Update Assessment" : "Create Assessment"}
                </Button>
              </form>
          </DialogContent>
        </Dialog>

        {/* Report Dialog */}
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assessment Report</DialogTitle>
            </DialogHeader>
            {viewingStudentReport && (
              <div>
                <h3 className="font-bold mb-2">{viewingStudentReport.studentName} ({viewingStudentReport.admissionNumber})</h3>
                <p>Class: {viewingStudentReport.className}</p>
                <p>Term: {viewingStudentReport.term}</p>
                <Table className="my-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Marks Obtained</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(viewingStudentReport.subjectMarks).map(([subject, mark]) => {
                      // Find subjectId for this subject in the class
                      const subj = subjects.find(s => s.subjectName === subject && s.classId === selectedMyClass?.id)
                      const subjectId = subj ? subj.id : ""
                      return (
                        <TableRow key={subject}>
                          <TableCell>{subject}</TableCell>
                          <TableCell>{mark}</TableCell>
                          <TableCell>{getPerformanceComment(mark, subjectId, selectedMyClass?.id)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <p><b>Total Marks:</b> {viewingStudentReport.totalMarks}</p>
                <p><b>Rank:</b> {viewingStudentReport.rank} / {viewingStudentReport.totalStudents}</p>
                <Button onClick={handleDownloadReport} className="mt-4">
                  <Download className="mr-2 h-4 w-4" /> Download Report
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
