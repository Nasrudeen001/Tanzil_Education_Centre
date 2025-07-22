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
  Download, 
  Upload, 
  Link, 
  FileText,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Send,
  DollarSign,
  User
} from "lucide-react"
import { storage } from "@/lib/storage"
import type { Student, Assignment, AssignmentSubmission, Staff } from "@/lib/types"



export default function StudentAssignments() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [studentData, setStudentData] = useState<Student | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissionData, setSubmissionData] = useState({
    submissionType: "file" as "file" | "link" | "text",
    linkUrl: "",
    textAnswer: "",
    file: null as File | null
  })

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
      loadData()
    }
  }, [user, router, mounted])

  const loadData = () => {
    if (!user) return

    // Get student data
    const allStudents = storage.students.getAll()
    const currentStudent = allStudents.find((s) => s.userId === user.id)
    setStudentData(currentStudent || null)

    // Get all staff data for teacher name lookup
    const allStaff = storage.staff.getAll()
    setStaff(allStaff)

    // Clean up the default "Fruits" assignment if it exists
    cleanupDefaultAssignment()

    if (currentStudent) {
      // Get assignments for this student's class and category
      const allAssignments = storage.assignments.getAll()
      const relevantAssignments = allAssignments.filter((a) => 
        a.className === currentStudent.className && 
        a.category === currentStudent.category &&
        a.isActive
      )
      setAssignments(relevantAssignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }
  }

  const cleanupDefaultAssignment = () => {
    const allAssignments = storage.assignments.getAll()
    const fruitsAssignment = allAssignments.find(a => a.title === "Fruits")
    if (fruitsAssignment) {
      storage.assignments.delete(fruitsAssignment.id)
      console.log("Cleaned up default 'Fruits' assignment")
    }
  }

  const getTeacherName = (staffId: string) => {
    const teacher = staff.find((s) => s.id === staffId)
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown Teacher"
  }

  const getMySubmission = (assignmentId: string) => {
    return null // No longer tracking submissions
  }

  const handleSubmitAssignment = () => {
    // No longer submitting assignments
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // No longer handling file uploads
  }

  const getSubmissionStatusBadge = (submission: AssignmentSubmission) => {
    switch (submission.status) {
      case "submitted":
        return <Badge variant="default">Submitted</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
          <p className="text-muted-foreground">View Assignments</p>
        </div>

        <Tabs defaultValue="available" className="space-y-4">
          <TabsList>
            <TabsTrigger value="available">Available Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {assignments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => {
                        const mySubmission = getMySubmission(assignment.id)
                        
                        return (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">{assignment.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{getTeacherName(assignment.createdBy)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                <Link className="h-3 w-3 mr-1" />
                                {assignment.assignmentType}
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
                    <p className="text-muted-foreground">No assignments available.</p>
                    <p className="text-sm text-muted-foreground">Your teachers will post assignments here.</p>
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
                    <Label>Teacher</Label>
                    <p>{getTeacherName(selectedAssignment.createdBy)}</p>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <p>{selectedAssignment.assignmentType}</p>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <p>{new Date(selectedAssignment.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p>Active</p>
                  </div>
                  <div>
                    <Label>Maximum Grade</Label>
                    <p>{selectedAssignment.maxGrade || 100}</p>
                  </div>
                </div>
                {selectedAssignment.linkUrl && (
                  <div>
                    <Label>Assignment Link</Label>
                    <a 
                      href={selectedAssignment.linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block"
                    >
                      {selectedAssignment.linkUrl}
                    </a>
                  </div>
                )}
                {/* No My Submission section as submissions are removed */}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Submit Assignment Dialog */}
        {/* This dialog is no longer needed as submissions are removed */}
      </div>
    </DashboardLayout>
  )
} 