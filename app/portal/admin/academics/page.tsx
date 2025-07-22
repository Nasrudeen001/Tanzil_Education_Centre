"use client"

import { useEffect, useState } from "react"
import { GraduationCap, Download, FileText } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Class, Student, Assessment, CollectionAssessment, AcademicCommentRange, Staff, ClassStaffAssignment } from "@/lib/types"
import { getLogoByCategory, generateCollectionAssessments, generateAverageCollectionAssessments } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const assessmentTypes = ["Open-Term Exam", "Mid-Term Exam", "End-Term Exam"]
const collectionAssessmentTypes = [...assessmentTypes, "Average"]

export default function AdminAcademics() {
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>(collectionAssessmentTypes[0])
  const [collectionAssessments, setCollectionAssessments] = useState<CollectionAssessment[]>([])

  useEffect(() => {
    setClasses(storage.classes.getAll())
    setStudents(storage.students.getAll())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      const classStudents = students.filter(s => s.className === classes.find(c => c.id === selectedClassId)?.className)
      
      // Get all FINALIZED assessments for this class
      const allAssessments = storage.assessments.getAll().filter(a => a.finalized)
      const allMyAssessments = storage.myAssessments.getAll().filter(a => a.finalized)
      
      // Convert MyAssessments to Assessment format for consistency
      const myAssessmentsAsAssessments = allMyAssessments.map(a => ({
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
      
      // Combine all finalized assessments
      const combinedAssessments = [...allAssessments, ...myAssessmentsAsAssessments]
      
      // Filter for students in the selected class
      const filtered = combinedAssessments.filter(a => classStudents.some(s => s.id === a.studentId))
      setAssessments(filtered)
    } else {
      setAssessments([])
    }
  }, [selectedClassId, students, classes])

  useEffect(() => {
    if (!selectedClassId) {
      setCollectionAssessments([])
      return
    }
    const selectedClass = classes.find(c => c.id === selectedClassId)
    if (!selectedClass) {
      setCollectionAssessments([])
      return
    }
    // Only include students whose admission number prefix matches the class category
    const filteredStudents = students.filter(s => {
      const cat = require('@/lib/utils').getCategoryFromAdmissionNumber(s.admissionNumber);
      return cat === selectedClass.category;
    });
    
    // Get all FINALIZED assessments for this class
    const allAssessments = storage.assessments.getAll().filter(a => a.className === selectedClass.className && a.finalized)
    const allMyAssessments = storage.myAssessments.getAll().filter(a => a.className === selectedClass.className && a.finalized)
    
    // Convert MyAssessments to Assessment format for consistency
    const myAssessmentsAsAssessments = allMyAssessments.map(a => ({
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
    
    // Combine all finalized assessments
    const combinedAssessments = [...allAssessments, ...myAssessmentsAsAssessments]
    
    if (selectedAssessmentType === "Average") {
      setCollectionAssessments(
        generateAverageCollectionAssessments(
          combinedAssessments,
          filteredStudents,
          selectedClass.className,
          assessmentTypes
        )
      )
    } else {
      const filtered = combinedAssessments.filter(a => a.assessmentType === selectedAssessmentType)
      setCollectionAssessments(
        generateCollectionAssessments(
          filtered,
          filteredStudents,
          selectedClass.className,
          filtered[0]?.term || ""
        )
      )
    }
  }, [selectedClassId, selectedAssessmentType, students, classes])

  const handleDownloadStudentPDF = (student: Student) => {
    const studentAssessments = assessments.filter(a => a.studentId === student.id)
    if (!studentAssessments.length) return
    // Get all data from storage
    const allSubjects = storage.subjects.getAll()
    const allCommentRanges = storage.commentRanges.getAll()
    // Calculate totals
    const totalMarksObtained = studentAssessments.reduce((sum, a) => sum + a.marksObtained, 0)
    const totalMaxMarks = studentAssessments.reduce((sum, a) => sum + a.totalMarks, 0)
    const averageMarks = studentAssessments.length > 0 ? (totalMarksObtained / studentAssessments.length).toFixed(2) : "0.00"
    // Helper to get performance comment for a subject (from global comment ranges)
    const getAutoComment = (marksObtained: number): string => {
      const matchingComment = allCommentRanges.find((c) => marksObtained >= c.minMarks && marksObtained <= c.maxMarks)
      return matchingComment ? matchingComment.comment : "-"
    }
    // Helper to get badge color (simple logic for now)
    const getPerformanceBadge = (comment: string): string => {
      if (comment.toLowerCase().includes("exceed")) return "#ef4444" // red
      if (comment.toLowerCase().includes("meet")) return "#f59e42" // orange
      if (comment.toLowerCase().includes("need")) return "#3b82f6" // blue
      return "#22c55e" // green
    }
    // Helper to get overall performance comment based on average percentage and global comment ranges
    const getAverageComment = (studentAssessments: Array<Assessment>): string => {
      if (studentAssessments.length === 0) return "No assessments"
      const totalPercentage = studentAssessments.reduce((sum: number, assessment: Assessment) => {
        const marksObtained = assessment.marksObtained || 0
        const totalMarks = assessment.totalMarks || 0
        return sum + (totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0)
      }, 0)
      const averagePercentage = totalPercentage / studentAssessments.length
      const matchingComment = allCommentRanges.find(cr => averagePercentage >= cr.minMarks && averagePercentage <= cr.maxMarks)
      return matchingComment ? matchingComment.comment : "Good effort"
    }
    // Prepare PDF
    const doc = new jsPDF({ orientation: 'landscape' })
    // Detect global language
    let lang = 'en';
    if (typeof window !== 'undefined') {
      lang = localStorage.getItem('lang') || 'en';
    }
    // Add logo to top left based on student category
    const validCategories = ["tahfidh", "integrated", "talim"];
    const classCategory = validCategories.includes(selectedClass?.category as string) ? selectedClass?.category as "tahfidh" | "integrated" | "talim" : "integrated";
    const logoUrl = getLogoByCategory(classCategory);
    // Load image asynchronously
    const img = new Image();
    img.src = logoUrl;
    img.onload = function() {
      // Centered logo at the top
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 35;
      const logoHeight = 35;
      const logoX = (pageWidth - logoWidth) / 2;
      let y = 7;
      doc.addImage(img, 'JPEG', logoX, y, logoWidth, logoHeight); // Top center
      y += logoHeight + 8; // Equal space between logo and institution name
      doc.setFontSize(18);
      doc.text(lang === 'ar' ? 'مركز تنزيل التعليمي' : 'Tanzil Education Centre', pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.setFontSize(12);
      doc.text(lang === 'ar' ? 'المعرفة والقيم' : 'Knowledge and Values', pageWidth / 2, y, { align: 'center' });
      y += 12; // Extra space before content
      // Term as 'Term X/YYYY' from the subject's assigned term
      let reportTerm = '';
      if (studentAssessments.length > 0) {
        reportTerm = studentAssessments[0].term || '-';
      }
      doc.setFontSize(12)
      if (lang === 'ar') {
        doc.text(`\u0627\u0644\u0641\u0635\u0644: ${reportTerm}`, 270, y, {align: 'right'})
        doc.text(`\u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628: ${student.firstName} ${student.lastName}`, 270, y + 8, {align: 'right'})
        doc.text(`\u0631\u0642\u0645 \u0627\u0644\u0642\u064a\u062f: ${student.admissionNumber}`, 120, y + 8, {align: 'right'})
        doc.text(`\u0627\u0644\u0635\u0641: ${student.className}`, 270, y + 16, {align: 'right'})
      } else {
        doc.text(`Term: ${reportTerm}`, 15, y)
        doc.text(`Student Name: ${student.firstName} ${student.lastName}`, 15, y + 8)
        doc.text(`Admission Number: ${student.admissionNumber}`, 15, y + 16)
        doc.text(`Class: ${student.className}`, 15, y + 24)
      }
      // Subject Performance Table
      let tableY = y + 28;
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text("Subject", 20, tableY)
      doc.text("Total Marks", 90, tableY)
      doc.text("Marks Obtained", 130, tableY)
      doc.text("Percentage", 170, tableY)
      doc.text("Performance", 210, tableY)
      doc.setFont('helvetica', 'normal')
      tableY += 10
      doc.setLineWidth(0.1)
      doc.line(15, tableY, 270, tableY)
      tableY += 8
      const renderTableHeader = () => {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text("Subject", 20, tableY)
        doc.text("Total Marks", 90, tableY)
        doc.text("Marks Obtained", 130, tableY)
        doc.text("Percentage", 170, tableY)
        doc.text("Performance", 210, tableY)
        doc.setFont('helvetica', 'normal')
        tableY += 10
        doc.setLineWidth(0.1)
        doc.line(15, tableY, 270, tableY)
        tableY += 8
      }
      studentAssessments.forEach((a, idx) => {
        const classId = classes.find(c => c.className === student.className && c.category === student.category)?.id
        const subjectObj = allSubjects.find(s => s.subjectName === a.subject && s.classId === classId && s.term === a.term)
        let subjectName = a.subject
        const comment = getAutoComment(a.marksObtained)
        const percent = a.totalMarks > 0 ? ((a.marksObtained / a.totalMarks) * 100).toFixed(1) + "%" : "0.0%"
        const subjectLines = doc.splitTextToSize(subjectName, 55)
        let performanceText = comment.length > 32 ? comment.slice(0, 29) + '...' : comment
        const rowHeight = subjectLines.length * 5
        doc.setFontSize(10)
        doc.text(subjectLines, 20, tableY)
        doc.text(String(a.totalMarks), 90, tableY)
        doc.text(String(a.marksObtained), 130, tableY)
        doc.text(percent, 170, tableY)
        doc.text(performanceText, 210, tableY)
        tableY += rowHeight + 0.5
        if (tableY > 185 && idx < studentAssessments.length - 1) {
          doc.addPage()
          tableY = 20
          renderTableHeader()
        }
      })
      tableY += 2
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`Total Assessments: ${studentAssessments.length}`, 20, tableY)
      tableY += 10
      doc.setLineWidth(0.1)
      doc.line(15, tableY, 270, tableY)
      tableY += 10
      doc.setFontSize(12)
      doc.setFont('times', 'normal')
      // Horizontal line: Total Marks, Average, Rank (compact spacing)
      let x = 15;
      doc.text(`Total Marks: ${totalMarksObtained} / ${totalMaxMarks}`, x, tableY)
      x += 65;
      doc.text(`Average Marks: ${averageMarks}`, x, tableY)
      x += 55;
      doc.text(`Rank: ${studentAssessments.length} of ${studentAssessments.length}`, x, tableY)
      // Next line: Overall Performance
      // Calculate overall performance using class-level comment ranges
      let overallPerformance = "-";
      if (selectedClass) {
        const classId = selectedClass.id;
        const commentRange = allCommentRanges.find(
          (cr) => cr.classId === classId && Number(averageMarks) >= cr.minMarks && Number(averageMarks) <= cr.maxMarks
        );
        if (commentRange) overallPerformance = commentRange.comment;
      }
      doc.setFontSize(12)
      doc.setFont('times', 'normal')
      doc.text(`Overall Performance: ${overallPerformance}`, 15, tableY + 10)
      // Next line: Teacher's Comment
      doc.text(`Teacher's Comment: ${getAverageComment(studentAssessments)}`, 15, tableY + 20)
      // Next line: Principal's Comment
      doc.text(`Principal's Comment: ${getAverageComment(studentAssessments)}`, 15, tableY + 30)
      // No stamp or related text at the bottom
      doc.save(`${student.admissionNumber}_academic_report.pdf`)
    }
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

  const handleDownloadGrandAssessmentPDF = async () => {
    if (collectionAssessments.length === 0) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 10;
    // Determine category from first student's admission number
    let headerCategory: 'tahfidh' | 'integrated' | 'talim' = 'integrated';
    if (collectionAssessments.length > 0) {
      const firstAdmission = collectionAssessments[0].admissionNumber;
      const cat = require('@/lib/utils').getCategoryFromAdmissionNumber(firstAdmission);
      if (cat) headerCategory = cat;
    }
    const logoUrl = getLogoByCategory(headerCategory);
    let logoBase64 = undefined;
    if (logoUrl) {
      try { logoBase64 = await getImageBase64(logoUrl); } catch {}
    }
    if (logoBase64) {
      doc.addImage(logoBase64, 'JPEG', pageWidth / 2 - 17.5, y, 35, 35);
      y += 40;
    }
    // School name by category
    let schoolName = "Tanzil Integrated Academy";
    if (headerCategory === "tahfidh" || headerCategory === "talim") schoolName = "Markaz Tanzil";
    doc.setFontSize(20);
    doc.text(schoolName, pageWidth / 2, y + 10, { align: 'center' });
    // School motto
    doc.setFontSize(12);
    doc.text("Knowledge and Value", pageWidth / 2, y + 20, { align: 'center' });
    y += 32;
    // Category, Class, Term, Assessment type (left-aligned, at the bottom of the header block)
    doc.setFontSize(12);
    doc.text(`Category: ${headerCategory.charAt(0).toUpperCase() + headerCategory.slice(1)}`, 15, y);
    doc.text(`Class: ${selectedClass?.className || ''}`, 70, y);
    doc.text(`Term: ${collectionAssessments[0]?.term || ''}`, 130, y);
    doc.text(`Assessment Type: ${selectedAssessmentType}`, 200, y);
    y += 12;
    // Table header and body
    const subjects = Object.keys(collectionAssessments[0]?.subjectMarks || {});
    const tableColumn = ['Rank', 'Name', 'Admission No.', ...subjects, 'Total Marks'];
    const tableRows = collectionAssessments.map(assessment => [
      `${assessment.rank}/${assessment.totalStudents}`,
      assessment.studentName,
      assessment.admissionNumber,
      ...subjects.map(subject => assessment.subjectMarks[subject] ?? ''),
      assessment.totalMarks
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: y,
      styles: { fontSize: 10 }
    });
    doc.save(`grand_assessment_${selectedClass?.className || ''}_${selectedAssessmentType}.pdf`);
  }

  const classOptions = classes.map(c => ({
    value: c.id,
    label: `${c.category.charAt(0).toUpperCase() + c.category.slice(1)}/${c.className}`
  }))
  const selectedClass = classes.find(c => c.id === selectedClassId)
  const classStudents = students.filter(s => s.className === selectedClass?.className)

  // Download individual student report (matching staff portal)
  async function handleDownloadStudentReportPDF(student: Student, assessment: CollectionAssessment) {
    const allClasses = storage.classes.getAll();
    const allSubjects = storage.subjects.getAll();
    const allCommentRanges = storage.commentRanges.getAll();
    const allAcademicCommentRanges = storage.academicCommentRanges.getAll();
    const allStaff = storage.staff.getAll();
    const allClassStaffAssignments = storage.classStaffAssignments.getAll();
    const studentClass = allClasses.find(c => c.className === assessment.className && c.category === selectedClass?.category);
    const classId = studentClass?.id;
    // Find class incharge (main teacher)
    let classTeacherName = "";
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
    const doc = new jsPDF();
    // Logo
    const validCategories = ["tahfidh", "integrated", "talim"];
    const classCategory = validCategories.includes(selectedClass?.category as string) ? selectedClass?.category as "tahfidh" | "integrated" | "talim" : "integrated";
    const logoUrl = getLogoByCategory(classCategory);
    let logoBase64 = undefined;
    if (logoUrl) {
      try { logoBase64 = await getImageBase64(logoUrl); } catch {}
    }
    let y = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    if (logoBase64) {
      doc.addImage(logoBase64, 'JPEG', pageWidth / 2 - 17.5, y, 35, 35);
      y += 40;
    }
    // School name by category
    let schoolName = "Tanzil Education Centre";
    let schoolMotto = "Knowledge and Value";
    if (selectedClass?.category === "integrated") schoolName = "Tanzil Integrated Academy";
    if (selectedClass?.category === "tahfidh" || selectedClass?.category === "talim") {
      schoolName = "Markaz Tanzil";
      schoolMotto = "Knowledge and Values";
    }
    doc.setFontSize(16);
    doc.text(schoolName, pageWidth / 2, y + 10, { align: "center" });
    doc.setFontSize(10);
    doc.text(schoolMotto, pageWidth / 2, y + 18, { align: "center" });
    y += 28;
    // Student and report details
    doc.setFontSize(12);
    doc.text(`Student: ${assessment.studentName}`, 14, y);
    doc.text(`Admission Number: ${assessment.admissionNumber}`, 14, y + 8);
    doc.text(`Class: ${assessment.className || selectedClass?.className}`, 14, y + 16);
    doc.text(`Assessment Type: ${selectedAssessmentType}`, 14, y + 24);
    doc.text(`Term: ${assessment.term || ''}`, 14, y + 32);
    y += 40;
    // Table of subjects, marks, performance
    const tableColumn = ["Subject", "Marks Obtained", "Performance"];
    const tableRows = Object.entries(assessment.subjectMarks).map(([subject, mark]) => [subject, mark, getAutoComment(Number(mark))]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: y,
      styles: { fontSize: 10 }
    });
    let tableEndY = (doc as any).lastAutoTable.finalY || y + 10;
    
    // Calculate overall performance using class-level comment ranges (CommentRange)
    let overallPerformance = "-";
    if (classId) {
      const commentRange = allCommentRanges.find(
        (cr: any) => cr.classId === classId && Number(averageMarks) >= cr.minMarks && Number(averageMarks) <= cr.maxMarks
      );
      if (commentRange) overallPerformance = commentRange.comment;
    }
    
    // Get teacher and principal comments from AcademicCommentRange
    const academicComment = getAcademicComment(averageMarks);
    
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    // Horizontal line: Total Marks, Average, Rank (compact spacing)
    let x = 14;
    doc.text(`Total Marks Obtained: ${totalMarksObtained}`, x, tableEndY + 10);
    x += 65;
    doc.text(`Average Marks Obtained: ${averageMarks.toFixed(2)}`, x, tableEndY + 10);
    x += 60;
    doc.text(`Rank: ${assessment.rank} / ${assessment.totalStudents}`, x, tableEndY + 10);
    // Next line: Overall Performance
    doc.text(`Overall Performance: ${overallPerformance}`, 14, tableEndY + 20);
    // Next line: Teacher's Comment
    doc.text(`Teacher's Comment: ${academicComment?.classTeacherComment || '-'}`, 14, tableEndY + 30);
    // Next line: Principal's Comment
    doc.text(`Principal's Comment: ${academicComment?.principalComment || '-'}`, 14, tableEndY + 40);
    // No stamp or related text at the bottom
    
    doc.save(`assessment_report_${assessment.studentName.replace(/\s+/g, '_')}.pdf`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-emerald-600" /> Academics
        </h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choose a class" />
            </SelectTrigger>
            <SelectContent>
              {classOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {selectedClassId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Grand Assessment for {selectedClass?.className}</CardTitle>
            <div className="flex gap-2 items-center">
              <Select value={selectedAssessmentType} onValueChange={setSelectedAssessmentType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Assessment Type" />
                </SelectTrigger>
                <SelectContent>
                  {collectionAssessmentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleDownloadGrandAssessmentPDF} disabled={collectionAssessments.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {collectionAssessments.length === 0 ? (
              <p className="text-muted-foreground">No grand assessment data available for this class and assessment type.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Admission No.</TableHead>
                    {Object.keys(collectionAssessments[0]?.subjectMarks || {}).map(subject => (
                      <TableHead key={subject}>{subject}</TableHead>
                    ))}
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collectionAssessments.map(assessment => {
                    const student = students.find(s => s.admissionNumber === assessment.admissionNumber);
                    return (
                      <TableRow key={assessment.id}>
                        <TableCell>{assessment.rank}/{assessment.totalStudents}</TableCell>
                        <TableCell>{assessment.studentName}</TableCell>
                        <TableCell>{assessment.admissionNumber}</TableCell>
                        {Object.keys(assessment.subjectMarks).map(subject => (
                          <TableCell key={subject}>{assessment.subjectMarks[subject]}</TableCell>
                        ))}
                        <TableCell>{assessment.totalMarks}</TableCell>
                        <TableCell>
                          {student && (
                            <Button size="sm" variant="outline" onClick={() => handleDownloadStudentReportPDF(student, assessment)}>
                              <FileText className="h-4 w-4 mr-1" /> Download Report
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 