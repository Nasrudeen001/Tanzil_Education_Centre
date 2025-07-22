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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Edit, Trash2, UserCheck, Users } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Staff, Student, Class, Subject, CommentRange, Assessment, ClassStaffAssignment } from "@/lib/types"
import { filterStudentsForStaff } from "@/lib/utils"

export default function StaffStudents() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [staffData, setStaffData] = useState<Staff | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [assignedClasses, setAssignedClasses] = useState<Class[]>([])
  const [classStaffAssignments, setClassStaffAssignments] = useState<ClassStaffAssignment[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [commentRanges, setCommentRanges] = useState<CommentRange[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewAssessmentsDialogOpen, setIsViewAssessmentsDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [assessmentData, setAssessmentData] = useState({
    studentId: "",
    subjectId: "",
    term: "",
    assessmentType: "",
    marksObtained: "",
  })

  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [selectedClassStudents, setSelectedClassStudents] = useState<Student[]>([])
  const [selectedClassInfo, setSelectedClassInfo] = useState<Class | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingAssessmentId, setEditingAssessmentId] = useState<string>("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null)
  const [hiddenStudentIds, setHiddenStudentIds] = useState<string[]>([])
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [restoreSearch, setRestoreSearch] = useState("")
  const [restoreError, setRestoreError] = useState("")
  const [restoreResults, setRestoreResults] = useState<Student[]>([])
  const [studentSearch, setStudentSearch] = useState("")
  const [studentSuggestions, setStudentSuggestions] = useState<Student[]>([])
  const studentInputRef = useRef<HTMLInputElement>(null)

  const terms = [
    { value: "Term 1", label: "Term 1" },
    { value: "Term 2", label: "Term 2" },
    { value: "Term 3", label: "Term 3" },
  ]

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

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

      // Also include classes where they are the main teacher (legacy support)
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
      if (myClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(myClasses[0].id)
      }

      // Get subjects created by this staff
      const allSubjects = storage.subjects.getAll()
      const mySubjects = allSubjects.filter((s) => s.teacherId === currentStaff.id)
      setSubjects(mySubjects)

      // Get comment ranges
      const allCommentRanges = storage.commentRanges.getAll()
      setCommentRanges(allCommentRanges)

      // Load assessments
      const allAssessments = storage.assessments.getAll()
      setAssessments(allAssessments)
    }
  }

  useEffect(() => {
    if (selectedClassId && assignedClasses.length > 0) {
      const selectedClass = assignedClasses.find((c) => c.id === selectedClassId)
      setSelectedClassInfo(selectedClass || null)

      if (selectedClass) {
        // Get all students and filter by category based on admission number codes
        const allStudents = storage.students.getAll()
        
        // First filter by category using admission number codes
        const categoryStudents = filterStudentsForStaff(allStudents, [selectedClass], staffData)
        
        // Then filter by class name
        const classStudents = categoryStudents.filter(
          (s) => s.className === selectedClass.className
        )
        
        setSelectedClassStudents(classStudents)
      }
    }
  }, [selectedClassId, assignedClasses])

  // Load hidden students for this staff from localStorage
  useEffect(() => {
    if (staffData) {
      const key = `hidden_students_${staffData.id}`
      const hidden = localStorage.getItem(key)
      setHiddenStudentIds(hidden ? JSON.parse(hidden) : [])
    }
  }, [staffData])

  // Save hidden students to localStorage
  const saveHiddenStudents = (ids: string[]) => {
    if (staffData) {
      const key = `hidden_students_${staffData.id}`
      localStorage.setItem(key, JSON.stringify(ids))
      setHiddenStudentIds(ids)
    }
  }

  // Delete student for this staff only
  const handleDeleteStudent = (studentId: string) => {
    const updated = [...hiddenStudentIds, studentId]
    saveHiddenStudents(updated)
  }

  // Restore student for this staff only
  const handleRestoreStudent = (studentId: string) => {
    const updated = hiddenStudentIds.filter(id => id !== studentId)
    saveHiddenStudents(updated)
  }

  // Search for students to restore
  const handleRestoreSearch = () => {
    setRestoreError("")
    if (!restoreSearch.trim()) {
      setRestoreResults([])
      return
    }
    // Only search in assigned class
    const allStudents = storage.students.getAll()
    const classStudents = selectedClassStudents
    const results = classStudents.filter(s =>
      (s.admissionNumber.toLowerCase().includes(restoreSearch.toLowerCase()) ||
       s.firstName.toLowerCase().includes(restoreSearch.toLowerCase()) ||
       s.lastName.toLowerCase().includes(restoreSearch.toLowerCase())) &&
      hiddenStudentIds.includes(s.id)
    )
    if (results.length === 0) {
      setRestoreError("Student not found in your assigned class or not deleted.")
    }
    setRestoreResults(results)
  }

  const handleAddAssessment = (student?: Student) => {
    if (student) {
      setSelectedStudent(student)
      setAssessmentData({ ...assessmentData, studentId: student.id })
      setStudentSearch(`${student.firstName} ${student.lastName} (${student.admissionNumber})`)
    } else {
      setSelectedStudent(null)
      setAssessmentData({ ...assessmentData, studentId: "" })
      setStudentSearch("")
    }
    setStudentSuggestions([])
    setIsDialogOpen(true)
  }

  const handleViewAssessments = (student: Student) => {
    setSelectedStudent(student)
    setIsViewAssessmentsDialogOpen(true)
  }

  const handleEditAssessment = (assessment: Assessment) => {
    setEditingAssessment(assessment)
    setIsEditDialogOpen(true)
  }

  const reloadAssessments = () => {
    const allAssessments = storage.assessments.getAll()
    setAssessments(allAssessments)
  }

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return
    try {
      await storage.assessments.delete(assessmentId)
      reloadAssessments()
      alert("Assessment deleted successfully")
    } catch (error) {
      console.error("Error deleting assessment:", error)
      alert("Failed to delete assessment")
    }
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

  const getAutoComment = (marksObtained: number) => {
    const ranges = commentRanges.filter((cr) => cr.staffId === staffData?.id && cr.classId === selectedClassId)
    const range = ranges.find((r) => marksObtained >= r.minMarks && marksObtained <= r.maxMarks)
    return range ? range.comment : "Good performance"
  }

  const handleSubmitAssessment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !staffData) return
    const selectedSubject = subjects.find((s) => s.id === assessmentData.subjectId)
    if (!selectedSubject) return
    const marksObtained = Number.parseFloat(assessmentData.marksObtained)
    const grade = calculateGrade(marksObtained, selectedSubject.maximumMarks)
    const autoComment = getAutoComment(marksObtained)
    const updatedAssessment: Assessment = {
      id: isEditing ? editingAssessmentId : Date.now().toString(),
      studentId: selectedStudent.id,
      subjectId: assessmentData.subjectId,
      term: assessmentData.term,
      className: selectedStudent.className,
      subject: selectedSubject.subjectName,
      assessmentType: assessmentData.assessmentType,
      marksObtained: marksObtained,
      totalMarks: selectedSubject.maximumMarks,
      grade: grade,
      comment: autoComment,
      remarks: "",
      assessmentDate: new Date().toISOString(),
      createdBy: staffData.id,
      createdAt: isEditing ? assessments.find(a => a.id === editingAssessmentId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    if (isEditing) {
      storage.assessments.update(editingAssessmentId, updatedAssessment)
    } else {
      storage.assessments.add(updatedAssessment)
    }
    setIsDialogOpen(false)
    resetForm()
    reloadAssessments()
  }

  const resetForm = () => {
    setSelectedStudent(null)
    setAssessmentData({
      studentId: "",
      subjectId: "",
      term: "",
      assessmentType: "",
      marksObtained: "",
    })
    setIsEditing(false)
    setEditingAssessmentId("")
  }

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId)
    return subject ? subject.subjectName : "Unknown Subject"
  }

  const getAvailableSubjects = () => {
    if (!selectedStudent || !staffData) return []

    // Get subjects that this teacher is assigned to teach for the student's class
    const allSubjects = storage.subjects.getAll()
    return allSubjects.filter((subject) => {
      const classItem = storage.classes.getAll().find((c) => c.id === subject.classId)
      // Check if the subject belongs to the student's class AND the current teacher is assigned to teach it
      return classItem?.className === selectedStudent.className && subject.teacherId === staffData.id
    })
  }

  const filteredStudents = selectedClassStudents.filter(
    (student) =>
      !hiddenStudentIds.includes(student.id) &&
      (student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStudentAssessmentCount = (studentId: string) => {
    return assessments.filter((a) => a.studentId === studentId).length
  }

  const getCommentColor = (comment: string) => {
    if (comment.includes("Excellent") || comment.includes("Outstanding")) return "default"
    if (comment.includes("Very good") || comment.includes("Good")) return "secondary"
    if (comment.includes("Fair") || comment.includes("Average")) return "outline"
    return "destructive"
  }

  const handleUpdateAssessment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAssessment || !staffData) return
    const selectedSubject = subjects.find((s) => s.id === editingAssessment.subjectId)
    if (!selectedSubject) return
    const marksObtained = Number.parseFloat(editingAssessment.marksObtained.toString())
    const grade = calculateGrade(marksObtained, selectedSubject.maximumMarks)
    const autoComment = getAutoComment(marksObtained)
    const updatedAssessment: Assessment = {
      ...editingAssessment,
      grade,
      comment: autoComment,
      updatedAt: new Date().toISOString(),
    }
    storage.assessments.update(editingAssessment.id, updatedAssessment)
    setIsEditDialogOpen(false)
    setEditingAssessment(null)
    reloadAssessments()
  }

  const getClassRole = (classId: string) => {
    if (!staffData) return ""
    const assignment = classStaffAssignments.find(a => a.classId === classId && a.staffId === staffData.id)
    return assignment ? assignment.role : ""
  }

  if (!mounted || !user || user.role !== "staff") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user || undefined} onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Student Management</h2>
            <p className="text-muted-foreground">Manage students and assessments for your assigned classes</p>
          </div>
        </div>

        {/* Class Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="classSelect">Class:</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {assignedClasses.map((classItem) => {
                    const role = getClassRole(classItem.id)
                    const isIncharge = role === "incharge"
                    const isSubjectTeacher = role === "subject_teacher"
                    const isMainTeacher = classItem.teacherId === staffData?.id
                    
                    return (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        <div className="flex flex-col">
                          <span>{classItem.className} ({classItem.category})</span>
                          <span className="text-xs text-muted-foreground">
                            {isIncharge ? "Class Incharge" : 
                             isSubjectTeacher ? "Subject Teacher" :
                             isMainTeacher ? "Main Teacher" : "Assigned"}
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {selectedClassInfo && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {selectedClassStudents.length} students
                  </Badge>
                  <Badge variant="secondary">
                    {getClassRole(selectedClassInfo.id) === "incharge" ? "Class Incharge" : "Subject Teacher"}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedClassInfo && (
          <>
            {/* Search */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name, admission number, or parent name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {/* Students Table */}
            <Card>
              <CardHeader>
                <CardTitle>Students - {selectedClassInfo.className}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Admission Number</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Assessments</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.admissionNumber}</TableCell>
                        <TableCell>{student.parentName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getStudentAssessmentCount(student.id)} assessments
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleAddAssessment(student)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleViewAssessments(student)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteStudent(student.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? "No students found matching your search." : "No students in this class."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Add Assessment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Assessment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitAssessment} className="space-y-4">
              <div style={{ position: 'relative' }}>
                <Label htmlFor="studentSearch">Student</Label>
                <Input
                  id="studentSearch"
                  ref={studentInputRef}
                  placeholder="Type student name or admission number"
                  value={studentSearch}
                  onChange={e => {
                    setStudentSearch(e.target.value)
                    setAssessmentData({ ...assessmentData, studentId: "" })
                    setSelectedStudent(null)
                    if (e.target.value.length > 0) {
                      setStudentSuggestions(selectedClassStudents.filter(s =>
                        (s.firstName + " " + s.lastName).toLowerCase().includes(e.target.value.toLowerCase()) ||
                        s.admissionNumber.toLowerCase().includes(e.target.value.toLowerCase())
                      ))
                    } else {
                      setStudentSuggestions([])
                    }
                  }}
                  autoComplete="off"
                />
                {studentSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setStudentSearch("")
                      setStudentSuggestions([])
                      setSelectedStudent(null)
                      setAssessmentData({ ...assessmentData, studentId: "" })
                      studentInputRef.current?.focus()
                    }}
                    style={{ position: 'absolute', right: 8, top: 32, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
                    aria-label="Clear"
                  >
                    ×
                  </button>
                )}
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
                    {getAvailableSubjects().map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.subjectName} (Max: {subject.maximumMarks})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="term">Term</Label>
                <Select
                  value={assessmentData.term}
                  onValueChange={(value) => setAssessmentData({ ...assessmentData, term: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.value} value={term.value}>
                        {term.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assessmentType">Assessment Type</Label>
                <Select
                  value={assessmentData.assessmentType}
                  onValueChange={(value) => setAssessmentData({ ...assessmentData, assessmentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open-Term Exam">Open-Term Exam</SelectItem>
                    <SelectItem value="Mid-Term Exam">Mid-Term Exam</SelectItem>
                    <SelectItem value="End-Term Exam">End-Term Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="marksObtained">Marks Obtained</Label>
                <Input
                  id="marksObtained"
                  type="number"
                  step="0.01"
                  value={assessmentData.marksObtained}
                  onChange={(e) => setAssessmentData({ ...assessmentData, marksObtained: e.target.value })}
                  placeholder="Enter marks"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Add Assessment
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Assessments Dialog */}
        <Dialog open={isViewAssessmentsDialogOpen} onOpenChange={setIsViewAssessmentsDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Assessments - {selectedStudent?.firstName} {selectedStudent?.lastName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments
                    .filter((a) => a.studentId === selectedStudent?.id)
                    .map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>{assessment.subject}</TableCell>
                        <TableCell>{assessment.term}</TableCell>
                        <TableCell>{assessment.assessmentType}</TableCell>
                        <TableCell>
                          {assessment.marksObtained}/{assessment.totalMarks}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{assessment.grade}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getCommentColor(assessment.comment) as any}>
                            {assessment.comment}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(assessment.assessmentDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditAssessment(assessment)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAssessment(assessment.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {assessments.filter((a) => a.studentId === selectedStudent?.id).length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No assessments found for this student.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Assessment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Assessment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateAssessment} className="space-y-4">
              <div>
                <Label htmlFor="editMarksObtained">Marks Obtained</Label>
                <Input
                  id="editMarksObtained"
                  type="number"
                  step="0.01"
                  value={editingAssessment?.marksObtained || ""}
                  onChange={(e) =>
                    setEditingAssessment(
                      editingAssessment
                        ? { ...editingAssessment, marksObtained: Number.parseFloat(e.target.value) }
                        : null,
                    )
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="editGrade">Grade</Label>
                <Input
                  id="editGrade"
                  value={editingAssessment?.grade || ""}
                  onChange={(e) =>
                    setEditingAssessment(
                      editingAssessment ? { ...editingAssessment, grade: e.target.value } : null,
                    )
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="editRemarks">Remarks</Label>
                <Input
                  id="editRemarks"
                  value={editingAssessment?.remarks || ""}
                  onChange={(e) =>
                    setEditingAssessment(
                      editingAssessment ? { ...editingAssessment, remarks: e.target.value } : null,
                    )
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                Update Assessment
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Restore Student Dialog */}
        <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Restore Student</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Search by admission number or name"
              value={restoreSearch}
              onChange={e => setRestoreSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRestoreSearch() }}
            />
            <Button onClick={handleRestoreSearch}>Search</Button>
            {restoreError && <div className="text-red-500 mt-2">{restoreError}</div>}
            <ul>
              {restoreResults.map(student => (
                <li key={student.id} className="flex items-center justify-between mt-2">
                  <span>{student.firstName} {student.lastName} ({student.admissionNumber})</span>
                  <Button size="sm" onClick={() => handleRestoreStudent(student.id)}>Restore</Button>
                </li>
              ))}
            </ul>
          </DialogContent>
        </Dialog>

        {/* Add Student Button */}
        <Button onClick={() => setIsRestoreDialogOpen(true)}>
          Add Student
        </Button>
      </div>
    </DashboardLayout>
  )
}
