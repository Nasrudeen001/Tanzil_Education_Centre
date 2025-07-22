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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Eye, 
  Users,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Link,
  TrendingUp,
  BarChart3,
  Download,
  Trash2
} from "lucide-react"
import { formatFileSize } from "@/lib/file-utils"
import { storage } from "@/lib/storage"
import type { Assignment, AssignmentSubmission, Staff, Student, Class } from "@/lib/types"
import { Label } from "@/components/ui/label"



export default function AdminAssignments() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterClass, setFilterClass] = useState<string>("all")
  // Removed filterStatus

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
      if (!user || user.role !== "admin") {
        router.push("/login")
        return
      }
      loadData()
    }
  }, [user, router, mounted])

  const loadData = () => {
    if (!user) return

    // Get all data
    const allAssignments = storage.assignments.getAll()
    const allStaff = storage.staff.getAll()
    const allStudents = storage.students.getAll()
    const allClasses = storage.classes.getAll()

    setAssignments(allAssignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    setStaff(allStaff)
    setStudents(allStudents)
    setClasses(allClasses)
  }

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find((s) => s.id === staffId)
    return staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : "Unknown"
  }

  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    return student ? `${student.firstName} ${student.lastName}` : "Unknown"
  }

  const getFilteredAssignments = () => {
    let filtered = assignments

    if (filterCategory !== "all") {
      filtered = filtered.filter((a) => a.category === filterCategory)
    }

    if (filterClass !== "all") {
      filtered = filtered.filter((a) => a.className === filterClass)
    }

    // Removed status filter logic

    return filtered
  }

  // Remove getStatusBadge and all its usages

  const getStatistics = () => {
    const totalAssignments = assignments.length
    const totalSubmissions = 0 // No longer tracking submissions
    const gradedSubmissions = 0 // No longer tracking submissions
    const lateSubmissions = 0 // No longer tracking submissions
    // Removed activeAssignments and overdueAssignments
    return {
      totalAssignments,
      totalSubmissions,
      gradedSubmissions,
      lateSubmissions,
      // Removed activeAssignments and overdueAssignments
      submissionRate: totalAssignments > 0 ? "0" : "0" // No longer calculating submission rate
    }
  }

  const stats = getStatistics()

  const handleDeleteAssignment = (assignmentId: string) => {
    if (confirm("Are you sure you want to delete this assignment? This action will remove the assignment from all portals (Admin, Staff, and Students).")) {
      // Delete assignment
      storage.assignments.delete(assignmentId)
      // Reload data to reflect changes
      loadData()
    }
  }

  if (!mounted || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user || undefined} onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assignments Overview</h2>
          <p className="text-muted-foreground">Monitor all assignments across the school</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="tahfidh">Tahfidh</SelectItem>
              <SelectItem value="integrated">Integrated</SelectItem>
              <SelectItem value="talim">Talim</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(filterClass)} onValueChange={val => setFilterClass(val)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes
                .filter(classItem => filterCategory === 'all' || classItem.category === filterCategory)
                .map(classItem => (
                  <SelectItem key={classItem.id} value={classItem.className}>
                    {classItem.className}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assignment Monitoring Table */}
        <div className="overflow-x-auto mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredAssignments().map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.title}</TableCell>
                  <TableCell>{getStaffName(assignment.createdBy)}</TableCell>
                  <TableCell>{assignment.className}</TableCell>
                  <TableCell>{assignment.assignmentType}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedAssignment(assignment); setIsViewDialogOpen(true); }}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteAssignment(assignment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {getFilteredAssignments().length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No assignments found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
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
                    <Label>Created By</Label>
                    <p>{getStaffName(selectedAssignment.createdBy)}</p>
                  </div>
                  <div>
                    <Label>Class</Label>
                    <p>{selectedAssignment.className}</p>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <p>{selectedAssignment.assignmentType}</p>
                  </div>
                  {/* Removed Due Date and Status display */}
                </div>
                {selectedAssignment.linkUrl && (
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
                )}
                {/* Removed file type handling */}
                <div>
                  <Label>Submissions (0)</Label>
                  <div className="mt-2 space-y-2">
                    {/* Removed all submission mapping */}
                    <div className="border p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">No submissions yet.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      handleDeleteAssignment(selectedAssignment.id)
                      setIsViewDialogOpen(false)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Assignment
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
} 