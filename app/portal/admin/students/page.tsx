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
  Power,
} from "lucide-react"
import { storage, generateAdmissionNumber } from "@/lib/storage"
import type { Student, User as UserType, Class, Fee } from "@/lib/types"
import { getCategoryFromAdmissionNumber } from "@/lib/utils"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { getLogoByCategory } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"


export default function StudentManagement() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "Male" as "Male" | "Female",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    category: "tahfidh" as "tahfidh" | "integrated" | "talim",
    className: "",
    admissionDate: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterClass, setFilterClass] = useState<string>("all")
  const [filterGender, setFilterGender] = useState<string>("all")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (!user || user.role !== "admin") {
        router.push("/login")
        return
      }
      loadStudents()
      loadClasses()
    }
  }, [user, router, mounted])

  const loadStudents = () => {
    const allStudents = storage.students.getAll()
    // Fix category/class assignment based on admission number prefix
    const updatedStudents = allStudents.map((student) => {
      const categoryFromAdmission = getCategoryFromAdmissionNumber(student.admissionNumber)
      if (categoryFromAdmission && categoryFromAdmission !== student.category) {
        // Update the student's category based on admission number
        const updatedStudent = { ...student, category: categoryFromAdmission }
        storage.students.update(student.id, updatedStudent)
        return updatedStudent
      }
      return student
    })
    setStudents(updatedStudents)
  }

  const loadClasses = () => {
    const allClasses = storage.classes.getAll()
    setClasses(allClasses)
  }

  const filteredStudents = students.filter(
    (student) => {
      const matchesSearch =
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.className.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory !== "all" ? student.category === filterCategory : true
      const matchesClass = filterClass !== "all" ? student.className === filterClass : true
      const matchesGender = filterGender !== "all" ? student.gender === filterGender : true
      return matchesSearch && matchesCategory && matchesClass && matchesGender
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingStudent) {
        // Update existing student
        const updatedStudent: Student = {
          ...editingStudent,
          ...formData,
          gender: formData.gender as "Male" | "Female",
        }
        storage.students.update(editingStudent.id, updatedStudent)

        // Update user password if needed
        storage.users.update(editingStudent.userId, {
          username: editingStudent.admissionNumber,
          password: editingStudent.admissionNumber,
        })
      } else {
        // Create new student
        const admissionNumber = generateAdmissionNumber(formData.category)
        const userId = Date.now().toString()

        // Create user account
        const newUser: UserType = {
          id: userId,
          username: admissionNumber,
          password: admissionNumber,
          role: "student",
          createdAt: new Date().toISOString(),
        }
        storage.users.add(newUser)

        // Create student record
        const newStudent: Student = {
          id: Date.now().toString(),
          userId,
          admissionNumber,
          ...formData,
          gender: formData.gender as "Male" | "Female",
          status: "active",
          createdAt: new Date().toISOString(),
        }
        storage.students.add(newStudent)

        // Create initial fee record
        const currentYear = new Date().getFullYear()
        const currentTerm = `Term 1/${currentYear}`
        // Find the latest fee for this category/class/term
        const allFees = storage.fees.getAll()
        const category = newStudent.category
        const className = newStudent.className
        // Find a fee for any student in this category/class/term with a nonzero totalBilled
        const matchingFee = allFees.find(fee => {
          const student = storage.students.getAll().find(s => s.id === fee.studentId)
          return student && student.category === category && student.className === className && fee.term === currentTerm && fee.totalBilled > 0
        })
        const billedAmount = matchingFee ? matchingFee.totalBilled : 0
        const newFee: Fee = {
          id: Date.now().toString() + "_fee",
          studentId: newStudent.id,
          term: currentTerm,
          totalBilled: billedAmount,
          totalPaid: 0,
          balance: billedAmount,
          status: "pending",
          createdAt: new Date().toISOString(),
        }
        storage.fees.add(newFee)
      }

      loadStudents()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving student:", error)
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth || "",
      gender: student.gender || "Male",
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail || "",
      category: student.category,
      className: student.className,
      admissionDate: student.admissionDate,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (student: Student) => {
    if (confirm("Are you sure you want to delete this student?")) {
      storage.students.delete(student.id)
      storage.users.delete(student.userId)
      // Delete associated fees
      const fees = storage.fees.getAll()
      fees.filter((fee) => fee.studentId === student.id).forEach((fee) => storage.fees.delete(fee.id))
      loadStudents()
    }
  }

  const handleToggleStatus = (student: Student) => {
    const newStatus = student.status === "active" ? "inactive" : "active"
    const action = newStatus === "active" ? "activate" : "deactivate"
    
    if (confirm(`Are you sure you want to ${action} ${student.firstName} ${student.lastName}?`)) {
      storage.students.update(student.id, { status: newStatus })
      loadStudents()
    }
  }

  const handleResetPassword = (student: Student) => {
    if (confirm(`Are you sure you want to reset the password for ${student.firstName} ${student.lastName}? This will set the password to their Admission Number.`)) {
      storage.users.update(student.userId, { password: student.admissionNumber })
      if (typeof toast === 'function') {
        toast({ title: "Password Reset", description: `Password reset to Admission Number for ${student.firstName} ${student.lastName}.` })
      } else {
        alert(`Password reset to Admission Number for ${student.firstName} ${student.lastName}.`)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "Male",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      category: "tahfidh",
      className: "",
      admissionDate: "",
    })
    setEditingStudent(null)
  }

  const downloadStudentPDF = async () => {
    // Prepare data
    const doc = new jsPDF({ orientation: "landscape" })
    let y = 10
    // Get logo
    let logoBase64: string | undefined
    let logoCategory: 'integrated' | 'tahfidh' | 'talim' = 'integrated'
    if (["integrated", "tahfidh", "talim"].includes(filterCategory)) logoCategory = filterCategory as typeof logoCategory
    try { logoBase64 = await getLogoByCategory(logoCategory) } catch {}
    const pageWidth = doc.internal.pageSize.getWidth()
    if (typeof logoBase64 === 'string' && logoBase64) {
      doc.addImage(logoBase64, 'JPEG', pageWidth / 2 - 17.5, y, 35, 35)
      y += 40
    }
    doc.setFontSize(18)
    doc.text(
      logoCategory === "integrated" ? "Tanzil Integrated Academy" : "Markaz Tanzil",
      pageWidth / 2,
      y,
      { align: 'center' }
    )
    y += 8
    doc.setFontSize(12)
    doc.text('Knowledge and Value', pageWidth / 2, y, { align: 'center' })
    y += 12
    // Table columns and rows
    const tableColumns = [
      "Admission No.", "Full Name", "Gender", "Date of Birth", "Category", "Class", "Parent/Guardian", "Parent's Phone", "Admission Date", "Status"
    ]
    const tableRows = filteredStudents.map(student => [
      student.admissionNumber,
      `${student.firstName} ${student.lastName}`,
      student.gender,
      student.dateOfBirth || "N/A",
      student.category.charAt(0).toUpperCase() + student.category.slice(1),
      getClassName(student.className),
      student.parentName,
      student.parentPhone || "N/A",
      student.admissionDate,
      student.status
    ])
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: y + 10,
      styles: { fontSize: 10 },
      margin: { left: 10, right: 10 }
    })
    doc.save(`students_${filterCategory !== 'all' ? filterCategory : 'all'}.pdf`)
  }

  const getCategoryClasses = () => {
    return classes.filter((cls) => cls.category === formData.category)
  }

  const getClassName = (classId: string) => {
    const classItem = classes.find((c) => c.className === classId)
    return classItem ? classItem.className : classId
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
            <h2 className="text-3xl font-bold tracking-tight">Student Management</h2>
            <p className="text-muted-foreground">Manage Tahfidh, Integrated, and Ta'lim students</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={downloadStudentPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (open && !editingStudent) {
                  resetForm()
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm()
                    setIsDialogOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value: "Male" | "Female") => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parentName">Parent/Guardian</Label>
                      <Input
                        id="parentName"
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="parentPhone">Parent/Guardian's Phone Number (Optional)</Label>
                      <Input
                        id="parentPhone"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="parentEmail">Parent/Guardian Email (Optional)</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: "tahfidh" | "integrated" | "talim") =>
                          setFormData({ ...formData, category: value, className: "" })
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
                      <Label htmlFor="className">Class</Label>
                      <Select
                        value={formData.className}
                        onValueChange={(value) => setFormData({ ...formData, className: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {getCategoryClasses().map((cls) => (
                            <SelectItem key={cls.id} value={cls.className}>
                              {cls.className}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="admissionDate">Date of Admission</Label>
                    <Input
                      id="admissionDate"
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingStudent ? "Update Student" : "Add Student"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name, admission number, parent/guardian, or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="tahfidh">Tahfidh</SelectItem>
              <SelectItem value="integrated">Integrated</SelectItem>
              <SelectItem value="talim">Ta'lim</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {[...new Set(classes.map((cls) => cls.className))].map((className) => (
                <SelectItem key={className} value={className}>{className}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterGender} onValueChange={setFilterGender}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Parent's Phone</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono">{student.admissionNumber}</TableCell>
                    <TableCell>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>{student.dateOfBirth || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.category === "tahfidh"
                            ? "default"
                            : student.category === "integrated"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {student.category.charAt(0).toUpperCase() + student.category.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getClassName(student.className)}</TableCell>
                    <TableCell>{student.parentName}</TableCell>
                    <TableCell>{student.parentPhone || "N/A"}</TableCell>
                    <TableCell>{student.admissionDate}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === "active" ? "default" : "destructive"}>{student.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={student.status === "active" ? "destructive" : "default"}
                          onClick={() => handleToggleStatus(student)}
                          title={student.status === "active" ? "Deactivate" : "Activate"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(student)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleResetPassword(student)} title="Reset Password">
                          <Power className="h-4 w-4 rotate-90" />
                          <span className="ml-1">Reset Password</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No students found. Add your first student to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
