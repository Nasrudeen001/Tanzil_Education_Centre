"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Users, GraduationCap, User, BookOpen, Plus, Edit, Trash2, UserCheck } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Staff, Class, Subject, CommentRange, ClassTermDates, ClassStaffAssignment, AcademicCommentRange } from "@/lib/types"
import { filterStudentsForStaff } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default function StaffSubjects() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [staffData, setStaffData] = useState<Staff | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignedClasses, setAssignedClasses] = useState<Class[]>([])
  const [classStaffAssignments, setClassStaffAssignments] = useState<ClassStaffAssignment[]>([])
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [subjectData, setSubjectData] = useState({
    subjectName: "",
    classId: "",
    maximumMarks: "",
    term: "",
  })
  const [classTermDates, setClassTermDates] = useState<ClassTermDates[]>([])
  const [dateEdit, setDateEdit] = useState({
    classId: "",
    term: "",
    openingDate: "",
    closingDate: "",
    editId: "",
  })
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false)
  const [commentData, setCommentData] = useState({
    minMarks: "",
    maxMarks: "",
    comment: "",
  })
  const [commentRanges, setCommentRanges] = useState<CommentRange[]>([])
  const [selectedCommentClassId, setSelectedCommentClassId] = useState<string>("")
  const [editingCommentRange, setEditingCommentRange] = useState<CommentRange | null>(null)
  const [isAcademicDialogOpen, setIsAcademicDialogOpen] = useState(false)
  const [academicCommentData, setAcademicCommentData] = useState({
    minAverage: "",
    maxAverage: "",
    classTeacherComment: "",
    principalComment: "",
  })
  const [academicCommentRanges, setAcademicCommentRanges] = useState<AcademicCommentRange[]>([])
  const [editingAcademicComment, setEditingAcademicComment] = useState<AcademicCommentRange | null>(null)
  const [selectedManagementClassId, setSelectedManagementClassId] = useState<string>("");

  // Move getClassRole above its first use
  const getClassRole = (classId: string) => {
    if (!staffData) return ""
    const assignment = classStaffAssignments.find(a => a.classId === classId && a.staffId === staffData.id)
    return assignment ? assignment.role : ""
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

  useEffect(() => {
    // Set default selected management class if not set
    if (assignedClasses.length > 0 && !selectedManagementClassId) {
      setSelectedManagementClassId(assignedClasses[0].id)
    }
  }, [assignedClasses, selectedManagementClassId])

  // Filter subjects and comments by selectedManagementClassId
  const filteredSubjects = subjects.filter(s => s.classId === selectedManagementClassId)
  const filteredCommentRanges = commentRanges.filter(cr => cr.classId === selectedManagementClassId)
  const filteredAcademicCommentRanges = academicCommentRanges.filter(cr => cr.classId === selectedManagementClassId)

  // Helper: is staff main/incharge for selected class?
  const isMainOrInchargeForSelected = selectedManagementClassId && (
    getClassRole(selectedManagementClassId) === "incharge" ||
    assignedClasses.find(c => c.id === selectedManagementClassId)?.teacherId === staffData?.id
  )

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

      // Get subjects created by this staff
      const allSubjects = storage.subjects.getAll()
      const mySubjects = allSubjects.filter((s) => s.teacherId === currentStaff.id)
      setSubjects(mySubjects)

      // Set default selected class for comment ranges
      if (myClasses.length > 0 && !selectedCommentClassId) {
        setSelectedCommentClassId(myClasses[0].id)
      }

      // Get comment ranges for this staff and selected class
      const allCommentRanges = storage.commentRanges.getAll()
      const myCommentRanges = allCommentRanges.filter(
        (cr) => cr.staffId === currentStaff.id && cr.classId === (selectedCommentClassId || (myClasses[0]?.id ?? ""))
      )
      setCommentRanges(myCommentRanges)

      // Get academic comment ranges for this staff and selected class
      const allAcademicCommentRanges = storage.academicCommentRanges.getAll()
      const myAcademicCommentRanges = allAcademicCommentRanges.filter(
        (cr) => cr.classId === (selectedCommentClassId || (myClasses[0]?.id ?? ""))
      )
      setAcademicCommentRanges(myAcademicCommentRanges)
    }
  }

  const handleAddSubject = () => {
    setSelectedSubject(null)
    setSubjectData({
      subjectName: "",
      classId: "",
      maximumMarks: "",
      term: "",
    })
    setIsSubjectDialogOpen(true)
  }

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject)
    setSubjectData({
      subjectName: subject.subjectName,
      classId: subject.classId,
      maximumMarks: subject.maximumMarks.toString(),
      term: subject.term,
    })
    setIsSubjectDialogOpen(true)
  }

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      storage.subjects.delete(subjectId)
      loadData()
    }
  }

  const handleSubmitSubject = (e: React.FormEvent) => {
    e.preventDefault()

    if (!staffData) return

    if (selectedSubject) {
      // Update existing subject
      storage.subjects.update(selectedSubject.id, {
        subjectName: subjectData.subjectName,
        classId: subjectData.classId,
        maximumMarks: Number.parseInt(subjectData.maximumMarks),
        term: subjectData.term,
      })
    } else {
      // Create new subject
      const newSubject: Subject = {
        id: Date.now().toString(),
        subjectName: subjectData.subjectName,
        classId: subjectData.classId,
        teacherId: staffData.id,
        maximumMarks: Number.parseInt(subjectData.maximumMarks),
        term: subjectData.term,
        createdAt: new Date().toISOString(),
      }
      storage.subjects.add(newSubject)
    }

    setIsSubjectDialogOpen(false)
    loadData()
  }

  const handleAddCommentRange = () => {
    setCommentData({
      minMarks: "",
      maxMarks: "",
      comment: "",
    })
    setIsDateDialogOpen(true)
  }

  const handleEditCommentRange = (range: CommentRange) => {
    setEditingCommentRange(range)
    setCommentData({
      minMarks: range.minMarks.toString(),
      maxMarks: range.maxMarks.toString(),
      comment: range.comment,
    })
    setIsDateDialogOpen(true)
  }

  const handleSubmitCommentRange = (e: React.FormEvent) => {
    e.preventDefault()
    if (!staffData || !selectedCommentClassId) return
    if (editingCommentRange) {
      // Update existing
      storage.commentRanges.update(editingCommentRange.id, {
        minMarks: Number.parseFloat(commentData.minMarks),
        maxMarks: Number.parseFloat(commentData.maxMarks),
        comment: commentData.comment,
      })
    } else {
      // Add new
      const newRange: CommentRange = {
        id: Date.now().toString(),
        minMarks: Number.parseFloat(commentData.minMarks),
        maxMarks: Number.parseFloat(commentData.maxMarks),
        comment: commentData.comment,
        staffId: staffData.id,
        classId: selectedCommentClassId,
        createdAt: new Date().toISOString(),
      }
      storage.commentRanges.add(newRange)
    }
    setIsDateDialogOpen(false)
    setEditingCommentRange(null)
    setCommentData({ minMarks: "", maxMarks: "", comment: "" })
    loadData()
  }

  const handleAddAcademicComment = () => {
    setEditingAcademicComment(null)
    setAcademicCommentData({
      minAverage: "",
      maxAverage: "",
      classTeacherComment: "",
      principalComment: "",
    })
    setIsAcademicDialogOpen(true)
  }

  const handleEditAcademicComment = (range: AcademicCommentRange) => {
    setEditingAcademicComment(range)
    setAcademicCommentData({
      minAverage: range.minAverage.toString(),
      maxAverage: range.maxAverage.toString(),
      classTeacherComment: range.classTeacherComment,
      principalComment: range.principalComment,
    })
    setIsAcademicDialogOpen(true)
  }

  const handleSubmitAcademicComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCommentClassId || !user) return
    const minAverage = Number.parseFloat(academicCommentData.minAverage)
    const maxAverage = Number.parseFloat(academicCommentData.maxAverage)
    if (editingAcademicComment) {
      storage.academicCommentRanges.update(editingAcademicComment.id, {
        minAverage,
        maxAverage,
        classTeacherComment: academicCommentData.classTeacherComment,
        principalComment: academicCommentData.principalComment,
      })
    } else {
      const newRange: AcademicCommentRange = {
        id: Date.now().toString(),
        classId: selectedCommentClassId,
        minAverage,
        maxAverage,
        classTeacherComment: academicCommentData.classTeacherComment,
        principalComment: academicCommentData.principalComment,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      }
      storage.academicCommentRanges.add(newRange)
    }
    setIsAcademicDialogOpen(false)
    setEditingAcademicComment(null)
    setAcademicCommentData({
      minAverage: "",
      maxAverage: "",
      classTeacherComment: "",
      principalComment: "",
    })
    loadData()
  }

  const getClassName = (classId: string) => {
    const classItem = assignedClasses.find((c) => c.id === classId)
    return classItem ? classItem.className : "Unknown Class"
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
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
            <h2 className="text-3xl font-bold tracking-tight">Subjects and Comments Management</h2>
            <p className="text-muted-foreground">Manage subjects and comments for your assigned classes</p>
          </div>
          <Button onClick={handleAddSubject}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>

        {/* Class Switch Dropdown for staff with multiple classes */}
        {assignedClasses.length > 1 && (
          <div className="mb-4">
            <Label htmlFor="managementClass">Select Class:</Label>
            <Select
              value={selectedManagementClassId}
              onValueChange={value => setSelectedManagementClassId(value)}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select class to manage" />
              </SelectTrigger>
              <SelectContent>
                {assignedClasses.map(classItem => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.className} ({classItem.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Assigned Classes Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Assigned Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignedClasses.map((classItem) => {
                const role = getClassRole(classItem.id)
                const isIncharge = role === "incharge"
                const isSubjectTeacher = role === "subject_teacher"
                const isMainTeacher = classItem.teacherId === staffData?.id
                
                return (
                  <div key={classItem.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{classItem.className}</h3>
                      <div className="flex gap-1">
                        {isIncharge && (
                          <Badge variant="default" className="text-xs">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Incharge
                          </Badge>
                        )}
                        {isSubjectTeacher && (
                          <Badge variant="secondary" className="text-xs">
                            Subject Teacher
                          </Badge>
                        )}
                        {isMainTeacher && !isIncharge && (
                          <Badge variant="outline" className="text-xs">
                            Main Teacher
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {classItem.category.charAt(0).toUpperCase() + classItem.category.slice(1)} • {classItem.academicYear}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isIncharge ? "You are the class incharge and can manage all subjects" : 
                       isSubjectTeacher ? "You can create subjects for this class" :
                       "You are the main teacher for this class"}
                    </p>
                  </div>
                )
              })}
              {assignedClasses.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Classes Assigned</h3>
                  <p className="text-muted-foreground">
                    You haven't been assigned to any classes yet. Please contact the administrator.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subjects for selected class */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Subjects for {assignedClasses.find(c => c.id === selectedManagementClassId)?.className || "-"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {filteredSubjects.map((subject) => (
                <Card key={subject.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{subject.subjectName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {assignedClasses.find(c => c.id === subject.classId)?.className} • {subject.term} Term • Max: {subject.maximumMarks} marks
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getClassRole(subject.classId) === "incharge" ? "Class Incharge" : "Subject Teacher"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditSubject(subject)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSubject(subject.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
              {filteredSubjects.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Subjects Created for this Class</h3>
                    <p className="text-muted-foreground mb-4">
                      Create subjects for your selected class to start managing assessments.
                    </p>
                    <Button onClick={handleAddSubject}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Subject
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comment and Academic Comment Management - Only for Main Teacher/Incharge of the selected class */}
        {selectedManagementClassId && isMainOrInchargeForSelected && (
          <>
            {/* Comment Range Area */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Performance Comments by Marks</CardTitle>
                {/* ... keep the class dropdown here if you want, or remove since we have the main switch above ... */}
                <p className="text-muted-foreground text-sm mt-1">
                  These comments will be used for all subjects and for overall performance in reports for the selected class.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={handleAddCommentRange} className="mb-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Comment Range
                  </Button>
                  <div className="grid gap-4">
                    {filteredCommentRanges.map((range) => (
                      <div key={range.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{range.minMarks} - {range.maxMarks} marks</span>
                          <p className="text-sm text-muted-foreground">{range.comment}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCommentRange(range)}
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this comment range?")) {
                                storage.commentRanges.delete(range.id)
                                loadData()
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredCommentRanges.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No comment ranges defined for this class.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Comment Area */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Academic Comments by Average Marks</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  These comments are based on the average marks obtained by a student in all assessed subjects for the selected class.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={handleAddAcademicComment} className="mb-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Academic Comment
                  </Button>
                  <div className="grid gap-4">
                    {filteredAcademicCommentRanges.map((range) => (
                      <div key={range.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{range.minAverage} - {range.maxAverage} average marks</span>
                          <p className="text-sm text-muted-foreground">Class Teacher: {range.classTeacherComment}</p>
                          <p className="text-sm text-muted-foreground">Principal: {range.principalComment}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAcademicComment(range)}
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this academic comment range?")) {
                                storage.academicCommentRanges.delete(range.id)
                                loadData()
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredAcademicCommentRanges.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No academic comment ranges defined for this class.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Comment Dialog */}
            <Dialog open={isAcademicDialogOpen} onOpenChange={(open) => { setIsAcademicDialogOpen(open); if (!open) { setEditingAcademicComment(null); setAcademicCommentData({ minAverage: "", maxAverage: "", classTeacherComment: "", principalComment: "" }); } }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAcademicComment ? "Edit Academic Comment" : "Add Academic Comment"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitAcademicComment} className="space-y-4">
                  <div>
                    <Label htmlFor="minAverage">Minimum Average Marks</Label>
                    <Input
                      id="minAverage"
                      type="number"
                      value={academicCommentData.minAverage}
                      onChange={(e) => setAcademicCommentData({ ...academicCommentData, minAverage: e.target.value })}
                      placeholder="e.g., 0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAverage">Maximum Average Marks</Label>
                    <Input
                      id="maxAverage"
                      type="number"
                      value={academicCommentData.maxAverage}
                      onChange={(e) => setAcademicCommentData({ ...academicCommentData, maxAverage: e.target.value })}
                      placeholder="e.g., 50"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="classTeacherComment">Class Teacher's Comment</Label>
                    <Textarea
                      id="classTeacherComment"
                      value={academicCommentData.classTeacherComment}
                      onChange={(e) => setAcademicCommentData({ ...academicCommentData, classTeacherComment: e.target.value })}
                      placeholder="e.g., Excellent academic progress"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="principalComment">Principal's Comment</Label>
                    <Textarea
                      id="principalComment"
                      value={academicCommentData.principalComment}
                      onChange={(e) => setAcademicCommentData({ ...academicCommentData, principalComment: e.target.value })}
                      placeholder="e.g., Keep up the good work"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingAcademicComment ? "Update Academic Comment" : "Add Academic Comment"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Add/Edit Subject Dialog */}
        <Dialog open={isSubjectDialogOpen} onOpenChange={(open) => { setIsSubjectDialogOpen(open); if (!open) { setSelectedSubject(null); setSubjectData({ subjectName: "", classId: "", maximumMarks: "", term: "" }); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedSubject ? "Edit Subject" : "Add Subject"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitSubject} className="space-y-4">
              <div>
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input
                  id="subjectName"
                  value={subjectData.subjectName}
                  onChange={(e) => setSubjectData({ ...subjectData, subjectName: e.target.value })}
                  placeholder="e.g., Mathematics, English, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="classId">Class</Label>
                <Select
                  value={subjectData.classId}
                  onValueChange={(value) => setSubjectData({ ...subjectData, classId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedClasses.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.className} ({classItem.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maximumMarks">Maximum Marks</Label>
                <Input
                  id="maximumMarks"
                  type="number"
                  value={subjectData.maximumMarks}
                  onChange={(e) => setSubjectData({ ...subjectData, maximumMarks: e.target.value })}
                  placeholder="e.g., 100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="term">Term</Label>
                <Select
                  value={subjectData.term}
                  onValueChange={(value) => setSubjectData({ ...subjectData, term: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {selectedSubject ? "Update Subject" : "Add Subject"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Comment Range Dialog */}
        <Dialog open={isDateDialogOpen} onOpenChange={(open) => { setIsDateDialogOpen(open); if (!open) { setEditingCommentRange(null); setCommentData({ minMarks: "", maxMarks: "", comment: "" }); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCommentRange ? "Edit Comment Range" : "Add Comment Range"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitCommentRange} className="space-y-4">
              <div>
                <Label htmlFor="minMarks">Minimum Marks</Label>
                <Input
                  id="minMarks"
                  type="number"
                  value={commentData.minMarks}
                  onChange={(e) => setCommentData({ ...commentData, minMarks: e.target.value })}
                  placeholder="e.g., 0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxMarks">Maximum Marks</Label>
                <Input
                  id="maxMarks"
                  type="number"
                  value={commentData.maxMarks}
                  onChange={(e) => setCommentData({ ...commentData, maxMarks: e.target.value })}
                  placeholder="e.g., 50"
                  required
                />
              </div>
              <div>
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={commentData.comment}
                  onChange={(e) => setCommentData({ ...commentData, comment: e.target.value })}
                  placeholder="e.g., Needs improvement"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingCommentRange ? "Update Comment Range" : "Add Comment Range"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
