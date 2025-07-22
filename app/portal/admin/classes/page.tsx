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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  GraduationCap,
  DollarSign,
  Bell,
  BookOpen,
  User,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Pen,
  UserCheck,
} from "lucide-react"
import { storage } from "@/lib/storage"
import type { Class, Staff, ClassStaffAssignment } from "@/lib/types"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function ClassManagement() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [classStaffAssignments, setClassStaffAssignments] = useState<ClassStaffAssignment[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isStaffAssignmentDialogOpen, setIsStaffAssignmentDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [formData, setFormData] = useState({
    className: "",
    category: "tahfidh" as "tahfidh" | "integrated" | "talim",
    academicYear: new Date().getFullYear().toString(),
  })
  const [staffAssignmentData, setStaffAssignmentData] = useState({
    staffId: "",
    role: "subject_teacher" as "incharge" | "subject_teacher",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (!user || user.role !== "admin") {
        router.push("/login")
        return
      }
      loadClasses()
      loadStaff()
      loadClassStaffAssignments()
    }
  }, [user, router, mounted])

  const loadClasses = () => {
    const allClasses = storage.classes.getAll()
    setClasses(allClasses)
  }

  const loadStaff = () => {
    const allStaff = storage.staff.getAll()
    const teachingStaff = allStaff.filter((s) => s.category === "teaching" && s.status === "active")
    setStaff(teachingStaff)
  }

  const loadClassStaffAssignments = () => {
    const allAssignments = storage.classStaffAssignments.getAll()
    setClassStaffAssignments(allAssignments)
  }

  // Add category filter to class filtering
  const filteredClasses = classes.filter(
    (classItem) => {
      const matchesSearch =
        classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getTeacherName(classItem.teacherId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.academicYear.includes(searchTerm)
      const matchesCategory = filterCategory === "all" ? true : classItem.category === filterCategory
      return matchesSearch && matchesCategory
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingClass) {
      storage.classes.update(editingClass.id, {
        className: formData.className,
        category: formData.category,
        academicYear: formData.academicYear,
      })
    } else {
      const newClass: Class = {
        id: Date.now().toString(),
        className: formData.className,
        category: formData.category,
        academicYear: formData.academicYear,
        createdAt: new Date().toISOString(),
      }
      storage.classes.add(newClass)
    }

    setIsDialogOpen(false)
    resetForm()
    loadClasses()
  }

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem)
    setFormData({
      className: classItem.className,
      category: classItem.category,
      academicYear: classItem.academicYear,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (classItem: Class) => {
    if (confirm("Are you sure you want to delete this class? This will also remove all staff assignments.")) {
      // Delete class staff assignments first
      const assignmentsToDelete = classStaffAssignments.filter(a => a.classId === classItem.id)
      assignmentsToDelete.forEach(assignment => {
        storage.classStaffAssignments.delete(assignment.id)
      })
      
      // Delete the class
      storage.classes.delete(classItem.id)
      loadClasses()
      loadClassStaffAssignments()
    }
  }

  const resetForm = () => {
    setEditingClass(null)
    setFormData({
      className: "",
      category: "tahfidh",
      academicYear: new Date().getFullYear().toString(),
    })
  }

  const handleManageStaff = (classItem: Class) => {
    setSelectedClass(classItem)
    setStaffAssignmentData({
      staffId: "",
      role: "subject_teacher",
    })
    setIsStaffAssignmentDialogOpen(true)
  }

  const handleAddStaffAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass) return

    // Check if trying to assign incharge and one already exists
    if (staffAssignmentData.role === "incharge") {
      const existingIncharge = classStaffAssignments.find(
        a => a.classId === selectedClass.id && a.role === "incharge"
      )
      if (existingIncharge) {
        alert("This class already has an incharge. Please remove the existing incharge first.")
        return
      }
    }

    const newAssignment: ClassStaffAssignment = {
      id: Date.now().toString(),
      classId: selectedClass.id,
      staffId: staffAssignmentData.staffId,
      role: staffAssignmentData.role,
      assignedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    storage.classStaffAssignments.add(newAssignment)

    // If assigned as incharge, update the class's teacherId
    if (staffAssignmentData.role === "incharge") {
      storage.classes.update(selectedClass.id, {
        ...selectedClass,
        teacherId: staffAssignmentData.staffId,
      })
      loadClasses()
    }

    loadClassStaffAssignments()
    setStaffAssignmentData({
      staffId: "",
      role: "subject_teacher",
    })
  }

  const handleRemoveStaffAssignment = (assignmentId: string) => {
    if (confirm("Are you sure you want to remove this staff assignment?")) {
      const assignment = classStaffAssignments.find(a => a.id === assignmentId)
      storage.classStaffAssignments.delete(assignmentId)
      // If the removed assignment was incharge, clear teacherId in class
      if (assignment && assignment.role === "incharge") {
        storage.classes.update(assignment.classId, { teacherId: undefined })
        loadClasses()
      }
      loadClassStaffAssignments()
    }
  }

  const downloadClassPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" })
    let y = 10
    // Add Tanzil Logo at the top center
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 35;
    const logoHeight = 35;
    const logoX = (pageWidth - logoWidth) / 2;
    // Load logo as base64 and add to PDF
    const logoUrl = "/Tanzil Logo.jpeg";
    const img = new window.Image();
    img.src = logoUrl;
    img.onload = function() {
      doc.addImage(img, 'JPEG', logoX, y, logoWidth, logoHeight);
      y += logoHeight + 8;
      doc.setFontSize(18)
      doc.text("Class List", doc.internal.pageSize.getWidth() / 2, y, { align: 'center' })
      y += 10
      const tableColumns = [
        "Class Name", "Category", "Main Teacher", "Academic Year", "Staff Assignments"
      ]
      const tableRows = classes.map((classItem) => {
        const assignments = classStaffAssignments.filter(a => a.classId === classItem.id)
        const assignmentText = assignments.map(a => {
          const staffMember = staff.find(s => s.id === a.staffId)
          const staffName = staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : "Unknown"
          return `${staffName} (${a.role})`
        }).join("; ")
        return [
          classItem.className,
          classItem.category.charAt(0).toUpperCase() + classItem.category.slice(1),
          getTeacherName(classItem.teacherId),
          classItem.academicYear,
          assignmentText || "No assignments",
        ]
      })
      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: y + 10,
        styles: { fontSize: 10 },
        margin: { left: 10, right: 10 }
      })
      doc.save(`classes_data_${new Date().toISOString().split("T")[0]}.pdf`)
    }
    // If image is cached, onload may not fire, so check if already complete
    if (img.complete) {
      if (typeof img.onload === 'function') {
        img.onload(undefined as unknown as Event);
      }
    }
  }

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return "Not Assigned"
    const teacher = staff.find((s) => s.id === teacherId)
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : "Not Found"
  }

  const getClassStaffAssignments = (classId: string) => {
    return classStaffAssignments.filter(a => a.classId === classId)
  }

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId)
    return staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : "Unknown"
  }

  // Generate academic year options (current year and next few years)
  const generateAcademicYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let year = currentYear - 1; year <= currentYear + 5; year++) {
      years.push(year.toString())
    }
    return years
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Class Management</h2>
            <p className="text-muted-foreground">Manage classes and assign multiple staff members</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={downloadClassPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingClass ? "Edit Class" : "Add New Class"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="className">Class Name</Label>
                    <Input
                      id="className"
                      value={formData.className}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                      placeholder="e.g., Grade 1, Grade 2, etc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: "tahfidh" | "integrated" | "talim") =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tahfidh">Tahfidh</SelectItem>
                        <SelectItem value="integrated">Integrated</SelectItem>
                        <SelectItem value="talim">Ta'lim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Select
                      value={formData.academicYear}
                      onValueChange={(value) => setFormData({ ...formData, academicYear: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateAcademicYearOptions().map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingClass ? "Update Class" : "Add Class"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Filter by Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="tahfidh">Tahfidh</SelectItem>
              <SelectItem value="integrated">Integrated</SelectItem>
              <SelectItem value="talim">Ta'lim</SelectItem>
            </SelectContent>
          </Select>
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes by name, category, teacher, or academic year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Main Teacher</TableHead>
                  <TableHead>Staff Assignments</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((classItem) => {
                  const assignments = getClassStaffAssignments(classItem.id)
                  const incharge = assignments.find(a => a.role === "incharge")
                  const subjectTeachers = assignments.filter(a => a.role === "subject_teacher")
                  
                  return (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">{classItem.className}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            classItem.category === "tahfidh"
                              ? "default"
                              : classItem.category === "integrated"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {classItem.category.charAt(0).toUpperCase() + classItem.category.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getTeacherName(classItem.teacherId)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {incharge && (
                            <div className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3 text-green-600" />
                              <span className="text-xs font-medium text-green-600">
                                Incharge: {getStaffName(incharge.staffId)}
                              </span>
                            </div>
                          )}
                          {subjectTeachers.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-blue-600" />
                              <span className="text-xs text-blue-600">
                                {subjectTeachers.length} subject teacher{subjectTeachers.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {assignments.length === 0 && (
                            <span className="text-xs text-muted-foreground">No assignments</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{classItem.academicYear}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleManageStaff(classItem)}>
                            <Users className="h-4 w-4 mr-1" />
                            Manage Staff
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(classItem)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(classItem)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {classes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No classes found. Add your first class to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Staff Assignment Dialog */}
        <Dialog open={isStaffAssignmentDialogOpen} onOpenChange={setIsStaffAssignmentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Manage Staff Assignments - {selectedClass?.className}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Current Assignments */}
              <div>
                <h3 className="text-lg font-medium mb-3">Current Assignments</h3>
                {selectedClass && (
                  <div className="space-y-2">
                    {getClassStaffAssignments(selectedClass.id).map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant={assignment.role === "incharge" ? "default" : "secondary"}>
                            {assignment.role === "incharge" ? "Incharge" : "Subject Teacher"}
                          </Badge>
                          <span>{getStaffName(assignment.staffId)}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveStaffAssignment(assignment.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    {getClassStaffAssignments(selectedClass.id).length === 0 && (
                      <p className="text-muted-foreground text-sm">No staff assignments yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Add New Assignment */}
              <div>
                <h3 className="text-lg font-medium mb-3">Add New Assignment</h3>
                <form onSubmit={handleAddStaffAssignment} className="space-y-4">
                  <div>
                    <Label htmlFor="staffId">Select Staff Member</Label>
                    <Select
                      value={staffAssignmentData.staffId}
                      onValueChange={(value) => setStaffAssignmentData({ ...staffAssignmentData, staffId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.filter(staffMember =>
                          selectedClass && !getClassStaffAssignments(selectedClass.id).some(a => a.staffId === staffMember.id)
                        ).map((staffMember) => (
                          <SelectItem key={staffMember.id} value={staffMember.id}>
                            {staffMember.firstName} {staffMember.lastName} - {staffMember.subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={staffAssignmentData.role}
                      onValueChange={(value: "incharge" | "subject_teacher") => 
                        setStaffAssignmentData({ ...staffAssignmentData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="incharge">Class Incharge (Main Teacher)</SelectItem>
                        <SelectItem value="subject_teacher">Subject Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Add Assignment
                  </Button>
                </form>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
