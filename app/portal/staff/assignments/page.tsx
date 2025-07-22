"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Link, 
  FileText,
  Users,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import { formatFileSize, validateFile } from "@/lib/file-utils"
import { storage } from "@/lib/storage"
import type { Staff, Student, Class, Assignment, ClassStaffAssignment } from "@/lib/types"
import { filterStudentsForStaff } from "@/lib/utils"



export default function StaffAssignments() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [staffData, setStaffData] = useState<Staff | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [assignmentData, setAssignmentData] = useState({
    title: "",
    description: "",
    classId: "",
    linkUrl: "",
  })
  const [filterClass, setFilterClass] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  // Add a useEffect to log filterClass whenever it changes
  useEffect(() => {
    console.log('filterClass value:', filterClass, 'type:', typeof filterClass)
  }, [filterClass])

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
      const myClassAssignments = allClassStaffAssignments.filter((a) => a.staffId === currentStaff.id)

      // Get assigned classes based on staff assignments
      const allClasses = storage.classes.getAll()
      let assignedClasses: Class[] = []

      // Get classes where this staff is assigned (either as incharge or subject teacher)
      myClassAssignments.forEach((assignment) => {
        const classItem = allClasses.find((c) => c.id === assignment.classId)
        if (classItem && !assignedClasses.find((ac) => ac.id === classItem.id)) {
          assignedClasses.push(classItem)
        }
      })

      // Also include classes where they are the main teacher (admin assignment via Class.teacherId)
      const teachingClasses = allClasses.filter((c) => c.teacherId === currentStaff.id)
      teachingClasses.forEach((classItem) => {
        if (!assignedClasses.find((ac) => ac.id === classItem.id)) {
          assignedClasses.push(classItem)
        }
      })

      // If they have a specific class assigned (legacy support), include it
      if (currentStaff.classAssigned) {
        const assignedClass = allClasses.find((c) => c.className === currentStaff.classAssigned)
        if (assignedClass && !assignedClasses.find((ac) => ac.id === assignedClass.id)) {
          assignedClasses.push(assignedClass)
        }
      }

      // Set only the assigned classes for assignment creation
      setClasses(assignedClasses)

      // Get assignments created by this staff
      const allAssignments = storage.assignments.getAll()
      const myAssignments = allAssignments.filter((a) => a.createdBy === currentStaff.id)
      setAssignments(myAssignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))

      // Get all students for name lookup
      const allStudents = storage.students.getAll()
      setStudents(allStudents)
    }
  }

  const getClassName = (classId: string) => {
    const classItem = classes.find((c) => c.id === classId)
    return classItem ? classItem.className : "Unknown Class"
  }

  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    return student ? `${student.firstName} ${student.lastName}` : "Unknown"
  }

  const handleCreateAssignment = async () => {
    if (!staffData || !assignmentData.title || !assignmentData.description || !assignmentData.classId) {
      alert("Please fill in all required fields")
      return
    }

    // Validate file upload for non-link assignments
    if (assignmentData.linkUrl === "") {
      alert("Please provide a link URL for this assignment type")
      return
    }

    const selectedClass = classes.find((c) => c.id === assignmentData.classId)
    if (!selectedClass) return

    const newAssignment: Assignment = {
      id: Date.now().toString(),
      title: assignmentData.title,
      description: assignmentData.description,
      classId: assignmentData.classId,
      className: selectedClass.className,
      category: selectedClass.category,
      linkUrl: assignmentData.linkUrl,
      createdBy: staffData.id,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignmentType: "link", // Ensure assignmentType is set
    }

    storage.assignments.add(newAssignment)
    setAssignments([newAssignment, ...assignments])
    setAssignmentData({
      title: "",
      description: "",
      classId: "",
      linkUrl: "",
    })
    setIsCreateDialogOpen(false)
  }



  const handleDeleteAssignment = (assignmentId: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      // Delete assignment
      storage.assignments.delete(assignmentId)
      setAssignments(assignments.filter((a) => a.id !== assignmentId))
    }
  }



  // Filtered assignments based on dropdown
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesClass = filterClass !== "all" ? assignment.classId === filterClass : true
    const matchesCategory = filterCategory !== "all" ? assignment.category === filterCategory : true
    return matchesClass && matchesCategory
  })

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
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <Select value={String(filterClass)} onValueChange={(val) => setFilterClass(val)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Filter by Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.className}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Filter by Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="tahfidh">Tahfidh</SelectItem>
              <SelectItem value="integrated">Integrated</SelectItem>
              <SelectItem value="talim">Ta'lim</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
            <p className="text-muted-foreground">Create and manage assignments for your students</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={assignmentData.title}
                    onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                    placeholder="Enter assignment title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={assignmentData.description}
                    onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                    placeholder="Enter assignment description"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="class">Category/Class *</Label>
                  <Select
                    value={assignmentData.classId}
                    onValueChange={(value) => setAssignmentData({ ...assignmentData, classId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your assigned class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.length > 0 ? (
                        classes.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{classItem.className}</span>
                              <span className="text-sm text-muted-foreground">
                                {classItem.category.charAt(0).toUpperCase() + classItem.category.slice(1)} • Academic Year: {classItem.academicYear}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
                          No classes assigned to you. Please contact the administrator.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                  <div>
                    <Label htmlFor="linkUrl">Link URL *</Label>
                    <Input
                      id="linkUrl"
                      value={assignmentData.linkUrl}
                      onChange={(e) => setAssignmentData({ ...assignmentData, linkUrl: e.target.value })}
                      placeholder="https://example.com"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      This link will be clickable for students to access the assignment
                    </p>
                  </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAssignment}>
                    Create Assignment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="assignments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assignments">My Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Created Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredAssignments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssignments.map((assignment) => {
                        // Remove all code that references 'submissions' or 'assignmentSubmissions' on Assignment objects
                        // Remove any code that tries to display or manipulate submissions
                        // Ensure assignment creation includes assignmentType: 'link'
                        // Only display assignment link and details, not submissions
                        return (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">{assignment.title}</TableCell>
                            <TableCell>{assignment.className}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                <Link className="h-3 w-3 mr-1" />
                                Link
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAssignment(assignment)
                                    setIsViewDialogOpen(true)
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No assignments created yet.</p>
                    <p className="text-sm text-muted-foreground">Create your first assignment to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Assignment Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Assignment Details</DialogTitle>
            </DialogHeader>
            {selectedAssignment && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedAssignment.title}</h3>
                  <p className="text-muted-foreground">{selectedAssignment.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Class</Label>
                    <p>{selectedAssignment.className}</p>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <p>Link</p>
                  </div>
                </div>
                  <div>
                    <Label>Link</Label>
                    <a 
                      href={selectedAssignment.linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedAssignment.linkUrl}
                    </a>
                  </div>
                <div>
                  <Label>Assignment Link</Label>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      Students can access this assignment through the provided link.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>


      </div>
    </DashboardLayout>
  )
} 