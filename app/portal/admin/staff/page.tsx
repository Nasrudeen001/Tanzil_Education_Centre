"use client"

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
import { storage, generateStaffId } from "@/lib/storage"
import type { Staff, User as UserType } from "@/lib/types"
import { Calendar } from "@/components/ui/calendar"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { toast } from "@/hooks/use-toast"


export default function StaffManagement() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [staff, setStaff] = useState<Staff[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    email: "",
    phone: "",
    gender: "Male",
    category: "teaching" as "teaching" | "non_teaching",
    hireDate: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [isRecommendationDialogOpen, setIsRecommendationDialogOpen] = useState(false)
  const [recommendationForm, setRecommendationForm] = useState({
    dateOfIssuance: "",
    staffName: "",
    hiredDate: "",
    contractTerminationDate: "",
    gender: "Male",
  })
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [genderFilter, setGenderFilter] = useState<string>("all")


  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (!user || user.role !== "admin") {
        router.push("/login")
        return
      }
      loadStaff()
    }
  }, [user, router, mounted])

  const loadStaff = () => {
    const allStaff = storage.staff.getAll()
    setStaff(allStaff)
  }

  const filteredStaff = staff.filter(
    (staffMember) => {
      const matchesSearch =
        `${staffMember.firstName} ${staffMember.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staffMember.nationalId && staffMember.nationalId.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = categoryFilter !== "all" ? staffMember.category === categoryFilter : true
      const matchesGender = genderFilter !== "all" ? staffMember.gender === genderFilter : true
      return matchesSearch && matchesCategory && matchesGender
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingStaff) {
      // Update existing staff
      const updatedStaff: Staff = {
        ...editingStaff,
        ...formData,
        gender: (formData.gender === "Male" || formData.gender === "Female") ? formData.gender : "Male",
      }
      storage.staff.update(editingStaff.id, updatedStaff)

      // Update user password if needed
      storage.users.update(editingStaff.userId, {
        username: editingStaff.staffId,
        password: editingStaff.staffId,
      })
    } else {
      // Create new staff
      const staffId = generateStaffId(formData.category)
      const userId = Date.now().toString()

      // Create user account
      const newUser: UserType = {
        id: userId,
        username: staffId,
        password: staffId,
        role: "staff",
        createdAt: new Date().toISOString(),
      }
      storage.users.add(newUser)

      // Create staff record
      const newStaff: Staff = {
        id: Date.now().toString(),
        userId,
        staffId,
        ...formData,
        gender: (formData.gender === "Male" || formData.gender === "Female") ? formData.gender : "Male",
        status: "active",
        createdAt: new Date().toISOString(),
      }
      storage.staff.add(newStaff)
    }

    loadStaff()
    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff)
    setFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      nationalId: staff.nationalId || "",
      email: staff.email,
      phone: staff.phone,
      gender: staff.gender || "Male",
      category: staff.category,
      hireDate: staff.hireDate,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (staff: Staff) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      storage.staff.delete(staff.id)
      storage.users.delete(staff.userId)
      loadStaff()
    }
  }

  const handleToggleStatus = (staff: Staff) => {
    const newStatus = staff.status === "active" ? "inactive" : "active"
    const action = newStatus === "active" ? "activate" : "deactivate"
    
    if (confirm(`Are you sure you want to ${action} ${staff.firstName} ${staff.lastName}?`)) {
      storage.staff.update(staff.id, { status: newStatus })
      loadStaff()
    }
  }

  const handleResetPassword = (staff: Staff) => {
    if (confirm(`Are you sure you want to reset the password for ${staff.firstName} ${staff.lastName}? This will set the password to their Staff ID.`)) {
      storage.users.update(staff.userId, { password: staff.staffId })
      if (typeof toast === 'function') {
        toast({ title: "Password Reset", description: `Password reset to Staff ID for ${staff.firstName} ${staff.lastName}.` })
      } else {
        alert(`Password reset to Staff ID for ${staff.firstName} ${staff.lastName}.`)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      nationalId: "",
      email: "",
      phone: "",
      gender: "Male",
      category: "teaching",
      hireDate: "",
    })
    setEditingStaff(null)
  }

  const downloadStaffData = () => {
    const csvContent = [
      ["Staff ID", "Full Name", "National ID", "Category", "Email", "Phone", "Status", "Hire Date"].join(","),
      ...staff.map((staffMember) =>
        [
          staffMember.staffId,
          `${staffMember.firstName} ${staffMember.lastName}`,
          staffMember.nationalId || "N/A",
          staffMember.category === "teaching" ? "Teaching" : "Non-Teaching",
          staffMember.email,
          staffMember.phone,
          staffMember.status,
          staffMember.hireDate,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `staff_data_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadStaffPDF = async () => {
    const doc = new jsPDF({ orientation: "landscape" })
    // Logo
    const logoUrl = "/Tanzil Logo.jpeg"
    const img = new Image()
    img.src = logoUrl
    await new Promise(resolve => { img.onload = resolve })
    // Calculate center for landscape (A4 width 297mm)
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoSize = 35;
    const logoX = (pageWidth - logoSize) / 2;
    const logoY = 10;
    doc.addImage(img, "JPEG", logoX, logoY, logoSize, logoSize);
    // School name below logo
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("TANZIL EDUCATION CENTRE", pageWidth / 2, logoY + logoSize + 8, { align: "center" });
    // Title below school name
    doc.setFontSize(14);
    doc.setFont(undefined, "normal");
    doc.text("Staff List", pageWidth / 2, logoY + logoSize + 20, { align: "center" });
    // Table
    autoTable(doc, {
      startY: logoY + logoSize + 28,
      head: [[
        "Staff ID",
        "Full Name",
        "National ID",
        "Category",
        "Email",
        "Phone",
        "Gender",
        "Status",
        "Hire Date"
      ]],
      body: filteredStaff.map(staffMember => [
        staffMember.staffId,
        `${staffMember.firstName} ${staffMember.lastName}`,
        staffMember.nationalId || "N/A",
        staffMember.category === "teaching" ? "Teaching" : "Non-Teaching",
        staffMember.email,
        staffMember.phone,
        staffMember.gender,
        staffMember.status,
        staffMember.hireDate
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
    });
    // Motto at the bottom center
    doc.setFontSize(12);
    doc.setFont(undefined, "italic");
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.text("Knowledge and Values", pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.save(`staff_list_${new Date().toISOString().split("T")[0]}.pdf`);
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

  const getPronoun = (gender: string) => gender === "Male" ? "He" : "She"
  const getPossessivePronoun = (gender: string) => gender === "Male" ? "his" : "her"

  // Format date to dd/mm/yyyy
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const handleGenerateRecommendationPDF = async () => {
    const doc = new jsPDF({ orientation: "portrait" })
    // Load the Integrated logo
    const logoUrl = "/Tanzil Logo.jpeg"
    const img = new Image()
    img.src = logoUrl
    await new Promise(resolve => { img.onload = resolve })
    // Add logo (perfectly circular, slightly smaller, centered)
    const logoSize = 35;
    const logoX = (210 - logoSize) / 2; // Centered for A4 width 210mm
    const logoY = 15;
    doc.addImage(img, "JPEG", logoX, logoY, logoSize, logoSize);
    // Add extra space below logo
    const afterLogoY = logoY + logoSize + 10;
    // Add TANZIL EDUCATION CENTRE (centered, bold)
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text(String('TANZIL EDUCATION CENTRE'), 105, afterLogoY, { align: 'center' });
    // Add motto (centered, italic)
    doc.setFontSize(11);
    doc.setFont(undefined, "italic");
    doc.text(String('Knowledge and Values'), 105, afterLogoY + 7, { align: 'center' });

    // Calculate 1.5x line height for spacing
    const lineHeight = doc.getLineHeight();
    // Add a line of spacing after the motto before the date (1.5x line height)
    const afterMottoY = afterLogoY + 7 + 1.5 * lineHeight;

    // Set font to Times New Roman, size 12
    doc.setFont("times", "")
    doc.setFontSize(12)

    // Date of Issuance (top right, bold, formatted)
    doc.setFont(undefined, "bold");
    doc.text(String(formatDate(recommendationForm.dateOfIssuance || '')), 200, afterMottoY, { align: "right" });

    // Title (centered, Times New Roman, size 12)
    doc.setFont("times", "bold")
    doc.setFontSize(12)
    // 1.5x line height below date
    const titleY = afterMottoY + 1.5 * lineHeight;
    doc.text("TO WHOM IT MAY CONCERN", 105, titleY, { align: "center" })

    // RE: (centered, bold, uppercase, underlined)
    doc.setFontSize(12)
    doc.setFont("times", "bold")
    const reText = `RE: ${String((recommendationForm.staffName || '').toUpperCase())}`
    // 1.5x line height below title
    const reY = titleY + 1.5 * lineHeight;
    doc.text(reText, 105, reY, { align: "center" })
    // Underline centered RE:
    const reTextWidth = doc.getTextWidth(reText)
    doc.setLineWidth(0.5)
    doc.line(105 - reTextWidth / 2, reY + 2, 105 + reTextWidth / 2, reY + 2)

    // Body paragraphs (plain, 1.5 line spacing, skip line between paragraphs)
    doc.setFont(undefined, "normal")
    // In the body, use formatDate for hiredDate and contractTerminationDate
    const hiredDate = formatDate(recommendationForm.hiredDate || '');
    const contractTerminationDate = formatDate(recommendationForm.contractTerminationDate || '');
    const pronoun = getPronoun(recommendationForm.gender)
    const possessivePronoun = getPossessivePronoun(recommendationForm.gender)
    const bodyParagraphs = [
      `The above-mentioned person has been a teacher in our school from ${hiredDate} to ${contractTerminationDate}.`,
      `${pronoun} has been a very committed, hardworking and diligent teacher.`,
      `${pronoun} also maintained excellent communication with the administration, teachers, parents and students. We highly recommend ${possessivePronoun} employment in any learning institution. For any information regarding ${possessivePronoun} employment and contributions do not hesitate to contact us. Thank you.`
    ]
    let y = reY + 8 // start body a bit below underline
    const paraSpacing = doc.getLineHeight() // single line spacing for paragraphs
    bodyParagraphs.forEach(paragraph => {
      doc.text(String(paragraph), 20, y, { maxWidth: 170 })
      y += paraSpacing
    })

    // Closing (Yours Faithfully, then signature, with spacing)
    y += 4
    doc.setFont(undefined, "normal")
    doc.text(String('Yours faithfully,'), 20, y)
    y += 1.5 * doc.getLineHeight() // 1.5x line height between Yours Faithfully and Sheikh Ahmad Abeid
    doc.setFont(undefined, "bold")
    doc.text(String('Sheikh Ahmad Abeid'), 20, y)
    y += 8
    doc.textWithLink(String('PRINCIPAL'), 20, y, '')
    const principalWidth = doc.getTextWidth(String('PRINCIPAL'))
    doc.setLineWidth(0.5)
    doc.line(20, y + 2, 20 + principalWidth, y + 2)

    // Footer (logo watermark and contact info)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(String('"Knowledge and Values"'), 105, 250, { align: "center" })
    doc.setFontSize(9)
    doc.text(String("P.O. Box 83947 – 80100, Mombasa. Email: tanzileducationcenter@gmail.com"), 105, 258, { align: "center" })
    doc.text(String("Tel: +254 726 376 569; +254 769 199 301"), 105, 264, { align: "center" })

    doc.save(String(`recommendation_letter_${String(recommendationForm.staffName || '').replace(/\s+/g, '_')}.pdf`))
  }

  return (
    <DashboardLayout user={user || undefined} onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
            <p className="text-muted-foreground">Manage teaching and non-teaching staff members</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownloadStaffPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingStaff ? "Edit Staff" : "Add New Staff"}</DialogTitle>
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
                  <div>
                    <Label htmlFor="nationalId">National ID Number</Label>
                    <Input
                      id="nationalId"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={value => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: "teaching" | "non_teaching") =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teaching">Teaching</SelectItem>
                        <SelectItem value="non_teaching">Non-Teaching</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="hireDate">Hire Date</Label>
                    <Input
                      id="hireDate"
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingStaff ? "Update Staff" : "Add Staff"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff by name, ID, email, or national ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="teaching">Teaching</SelectItem>
              <SelectItem value="non_teaching">Non-Teaching</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={genderFilter}
            onValueChange={setGenderFilter}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Genders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>National ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staffMember) => (
                  <TableRow key={staffMember.id}>
                    <TableCell className="font-mono">{staffMember.staffId}</TableCell>
                    <TableCell>
                      {staffMember.firstName} {staffMember.lastName}
                    </TableCell>
                    <TableCell className="font-mono">{staffMember.nationalId || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={staffMember.category === "teaching" ? "default" : "secondary"}>
                        {staffMember.category === "teaching" ? "Teaching" : "Non-Teaching"}
                      </Badge>
                    </TableCell>
                    <TableCell>{staffMember.email}</TableCell>
                    <TableCell>{staffMember.phone}</TableCell>
                    <TableCell>
                      <Badge variant={staffMember.status === "active" ? "default" : "destructive"}>
                        {staffMember.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(staffMember)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={staffMember.status === "active" ? "destructive" : "default"}
                          onClick={() => handleToggleStatus(staffMember)}
                          title={staffMember.status === "active" ? "Deactivate" : "Activate"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(staffMember)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleResetPassword(staffMember)} title="Reset Password">
                          <Power className="h-4 w-4 rotate-90" />
                          <span className="ml-1">Reset Password</span>
                        </Button>
                        {staffMember.category === "teaching" && (
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedStaff(staffMember)
                            setRecommendationForm({
                              dateOfIssuance: new Date().toISOString().split("T")[0],
                              staffName: `${staffMember.firstName} ${staffMember.lastName}`,
                              hiredDate: staffMember.hireDate || "",
                              contractTerminationDate: "",
                              gender: staffMember.gender || "Male",
                            })
                            setIsRecommendationDialogOpen(true)
                          }}>
                            <Pen className="h-4 w-4" />
                            <span className="ml-1">Generate Recommendation</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {staff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No staff members found. Add your first staff member to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isRecommendationDialogOpen} onOpenChange={setIsRecommendationDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Recommendation Letter</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div>
              <Label htmlFor="dateOfIssuance">Date of Issuance</Label>
              <Input
                id="dateOfIssuance"
                type="date"
                value={recommendationForm.dateOfIssuance}
                onChange={e => setRecommendationForm({ ...recommendationForm, dateOfIssuance: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="staffName">Staff Name</Label>
              <Input
                id="staffName"
                value={recommendationForm.staffName}
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="hiredDate">Hired Date</Label>
              <Input
                id="hiredDate"
                type="date"
                value={recommendationForm.hiredDate}
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="contractTerminationDate">Contract Termination Date</Label>
              <Input
                id="contractTerminationDate"
                type="date"
                value={recommendationForm.contractTerminationDate}
                onChange={e => setRecommendationForm({ ...recommendationForm, contractTerminationDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={recommendationForm.gender}
                onValueChange={value => setRecommendationForm({ ...recommendationForm, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="button" className="w-full" onClick={handleGenerateRecommendationPDF}>
              Generate Letter
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
