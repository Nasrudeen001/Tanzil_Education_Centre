"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, User, BookOpen } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Staff, Class, Student } from "@/lib/types"
import { filterStudentsForStaff } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"


export default function StaffClasses() {
  const { user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [staffData, setStaffData] = useState<Staff | null>(null)
  const [assignedClasses, setAssignedClasses] = useState<Class[]>([])
  const [classStudents, setClassStudents] = useState<{ [key: string]: Student[] }>({})
  // Add state for filters and search for each class
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({})
  const [filterGenders, setFilterGenders] = useState<{ [key: string]: string }>({})

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
      // Get assigned classes (both direct assignment and teaching assignment)
      const allClasses = storage.classes.getAll()
      let myClasses: Class[] = []

      // Classes where they are the assigned teacher
      const teachingClasses = allClasses.filter((c) => c.teacherId === currentStaff.id)

      // If they have a specific class assigned, include it
      if (currentStaff.classAssigned) {
        const assignedClass = allClasses.find((c) => c.className === currentStaff.classAssigned)
        if (assignedClass && !teachingClasses.find((tc) => tc.id === assignedClass.id)) {
          myClasses = [...teachingClasses, assignedClass]
        } else {
          myClasses = teachingClasses
        }
      } else {
        myClasses = teachingClasses
      }

      setAssignedClasses(myClasses)

      // Get students for each class - filter by category based on admission number codes
      const allStudents = storage.students.getAll()
      const studentsMap: { [key: string]: Student[] } = {}

      myClasses.forEach((classItem) => {
        const classStudents = filterStudentsForStaff(allStudents, [classItem], currentStaff)
        studentsMap[classItem.id] = classStudents.filter(
          (s) => s.className === classItem.className
        )
      })

      setClassStudents(studentsMap)
    }
  }

  // Handler for search and filter
  const handleSearchChange = (classId: string, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [classId]: value }))
  }
  const handleGenderChange = (classId: string, value: string) => {
    setFilterGenders((prev) => ({ ...prev, [classId]: value }))
  }

  // PDF download for each class
  const downloadStudentPDF = (classItem: Class, students: Student[], searchTerm: string, filterGender: string) => {
    const filtered = students.filter((student) => {
      const matchesSearch =
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGender = filterGender && filterGender !== "all" ? student.gender === filterGender : true
      return matchesSearch && matchesGender
    })
    const doc = new jsPDF({ orientation: "landscape" })
    let y = 10
    // Add logo at the top center depending on class category
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 35;
    const logoHeight = 35;
    const logoX = (pageWidth - logoWidth) / 2;
    let logoUrl = "";
    if (classItem.category === "integrated") {
      logoUrl = "/Integraed logo.jpeg";
    } else if (classItem.category === "tahfidh" || classItem.category === "talim") {
      logoUrl = "/Talim and Tahfidh logo.jpeg";
    }
    if (logoUrl) {
      const img = new window.Image();
      img.src = logoUrl;
      img.onload = function() {
        doc.addImage(img, 'JPEG', logoX, y, logoWidth, logoHeight);
        y += logoHeight + 8;
        doc.setFontSize(18)
        doc.text(`${classItem.className} - Student List`, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' })
        y += 10
        const tableColumns = [
          "Admission No.", "Full Name", "Gender", "Date of Birth", "Class", "Parent/Guardian", "Parent's Phone", "Admission Date", "Status"
        ]
        const tableRows = filtered.map(student => [
          student.admissionNumber,
          `${student.firstName} ${student.lastName}`,
          student.gender,
          student.dateOfBirth || "N/A",
          student.className,
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
        doc.save(`students_${classItem.className}.pdf`)
      }
      if (img.complete) {
        if (typeof img.onload === 'function') {
          img.onload(undefined as unknown as Event);
        }
      }
    } else {
      doc.setFontSize(18)
      doc.text(`${classItem.className} - Student List`, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' })
      y += 10
      const tableColumns = [
        "Admission No.", "Full Name", "Gender", "Date of Birth", "Class", "Parent/Guardian", "Parent's Phone", "Admission Date", "Status"
      ]
      const tableRows = filtered.map(student => [
        student.admissionNumber,
        `${student.firstName} ${student.lastName}`,
        student.gender,
        student.dateOfBirth || "N/A",
        student.className,
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
      doc.save(`students_${classItem.className}.pdf`)
    }
  }

  if (!mounted || !user || user.role !== "staff") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user || undefined} onLogout={() => {}}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Classes</h2>
          <p className="text-muted-foreground">Classes assigned to you</p>
        </div>
        <div className="grid gap-4">
          {assignedClasses.map((classItem) => {
            const students = classStudents[classItem.id] || []
            const searchTerm = searchTerms[classItem.id] || ""
            const filterGender = filterGenders[classItem.id] || "all"
            const filteredStudents = students.filter((student) => {
              const matchesSearch =
                `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.parentName.toLowerCase().includes(searchTerm.toLowerCase())
              const matchesGender = filterGender !== "all" ? student.gender === filterGender : true
              return matchesSearch && matchesGender
            })
            return (
              <Card key={classItem.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{classItem.className}</CardTitle>
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
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Input
                      placeholder="Search students by name, admission number, or parent..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(classItem.id, e.target.value)}
                      className="max-w-sm"
                    />
                    <Select value={filterGender} onValueChange={(value) => handleGenderChange(classItem.id, value)}>
                      <SelectTrigger className="w-36"><SelectValue placeholder="Gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genders</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => downloadStudentPDF(classItem, students, searchTerm, filterGender)}>
                      Download PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Admission No.</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Parent Name</TableHead>
                        <TableHead>Parent's Phone</TableHead>
                        <TableHead>Admission Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono">{student.admissionNumber}</TableCell>
                          <TableCell>{student.firstName} {student.lastName}</TableCell>
                          <TableCell>{student.gender}</TableCell>
                          <TableCell>{student.dateOfBirth || "N/A"}</TableCell>
                          <TableCell>{student.className}</TableCell>
                          <TableCell>{student.parentName}</TableCell>
                          <TableCell>{student.parentPhone || "N/A"}</TableCell>
                          <TableCell>{student.admissionDate}</TableCell>
                          <TableCell>
                            <Badge variant={student.status === "active" ? "default" : "destructive"}>{student.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredStudents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No students found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          })}
          {assignedClasses.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Classes Assigned</h3>
                <p className="text-muted-foreground">
                  You don't have any classes assigned yet. Contact the admin to get classes assigned to you.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
