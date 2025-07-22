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
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  GraduationCap,
  DollarSign,
  Bell,
  BookOpen,
  User,
  Plus,
  CreditCard,
  Search,
  Download,
  Pen,
  Edit,
} from "lucide-react"
import { storage } from "@/lib/storage"
import type { Student, Fee, FeePayment, Class } from "@/lib/types"
import { getLogoByCategory } from "@/lib/utils"
import jsPDF from "jspdf"
import { getFromStorage, setToStorage } from "@/lib/storage"
import { addMonths, format } from "date-fns"
import autoTable from "jspdf-autotable"



export default function FeeManagement() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null)
  const [formData, setFormData] = useState({
    categoryClass: "",
    term: "",
    totalBilled: "",
  })
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentDate: "",
    paymentMethod: "cash",
    referenceNumber: "",
    notes: "",
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFee, setEditFee] = useState<Fee | null>(null)
  const [editAmount, setEditAmount] = useState("")
  const [editAmountPaid, setEditAmountPaid] = useState("")
  const [filterCategoryClass, setFilterCategoryClass] = useState("")
  const [filterTerm, setFilterTerm] = useState("")
  const [filterMonth, setFilterMonth] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

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
      loadFees()
    }
  }, [user, router, mounted])

  const loadStudents = () => {
    const allStudents = storage.students.getAll()
    setStudents(allStudents.filter((s) => s.status === "active"))
  }

  const loadClasses = () => {
    const allClasses = storage.classes.getAll()
    setClasses(allClasses)
  }

  const loadFees = () => {
    const allFees = storage.fees.getAll()
    setFees(allFees)
  }

  const calculateFeeStatus = (totalBilled: number, totalPaid: number): Fee["status"] => {
    if (totalPaid > totalBilled) return "overpayment"
    if (totalPaid === totalBilled && totalBilled > 0) return "paid"
    if (totalPaid > 0) return "partial"
    return "pending"
  }

  // Helper: Get all fee records for a student, sorted chronologically by term/month
  function getSortedFeesForStudent(studentId: string, category: string, allFees: Fee[]): Fee[] {
    // For integrated: sort by year/term number; for others: sort by date
    const studentFees = allFees.filter(f => f.studentId === studentId)
    if (category === "integrated") {
      // term format: "Term X/YYYY"
      return studentFees.sort((a, b) => {
        const [_, aTerm, aYear] = a.term.match(/Term (\d+)[/\\](\d+)/) || ["", "0", "0"]
        const [__, bTerm, bYear] = b.term.match(/Term (\d+)[/\\](\d+)/) || ["", "0", "0"]
        if (aYear !== bYear) return Number(aYear) - Number(bYear)
        return Number(aTerm) - Number(bTerm)
      })
    } else {
      // month format: "MMMM yyyy"
      return studentFees.sort((a, b) => {
        const aDate = new Date(a.term + " 01")
        const bDate = new Date(b.term + " 01")
        return aDate.getTime() - bDate.getTime()
      })
    }
  }

  // Helper: Recalculate balances for all subsequent fees for a student
  function recalculateCarryForward(student: Student, allFees: Fee[]) {
    const sortedFees = getSortedFeesForStudent(student.id, student.category, allFees)
    let carry = 0
    for (let i = 0; i < sortedFees.length; i++) {
      const fee = sortedFees[i]
      // Add carry forward to totalBilled for underpayment, or as credit for overpayment
      let effectiveBilled = fee.totalBilled + carry
      let balance = effectiveBilled - fee.totalPaid
      // Update fee
      const updatedFee: Fee = {
        ...fee,
        totalBilled: fee.totalBilled, // keep original billed for display
        balance,
        status: calculateFeeStatus(effectiveBilled, fee.totalPaid),
      }
      storage.fees.update(fee.id, updatedFee)
      carry = balance // carry forward to next
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const [category, className] = formData.categoryClass.split("/")
    const totalBilled = Number.parseFloat(formData.totalBilled)
    
    // Only proceed if there is a billed amount
    if (totalBilled <= 0) {
      alert("Please enter a valid billed amount greater than 0.")
      return
    }
    
    // Find all students in the selected category/class
    const studentsInClass = students.filter(
      (student) => student.category === category.toLowerCase() && student.className === className,
    )
    // Create or update fee records for all students in the class
    studentsInClass.forEach((student) => {
      const existingFee = fees.find((fee) => fee.studentId === student.id && fee.term === formData.term)
      if (existingFee) {
        // Update existing fee with new billed amount
        const newTotalBilled = totalBilled;
        // Don't recalc balance here, will do in recalc
        const updatedFee: Fee = {
          ...existingFee,
          totalBilled: newTotalBilled,
        }
        storage.fees.update(existingFee.id, updatedFee)
      } else {
        // Create new fee only if there is a billed amount
        const newFee: Fee = {
          id: `${Date.now()}_${student.id}`,
          studentId: student.id,
          term: formData.term,
          totalBilled,
          totalPaid: 0,
          balance: totalBilled,
          status: "pending",
          createdAt: new Date().toISOString(),
        }
        storage.fees.add(newFee)
      }
      // After add/update, recalc carry forward for this student
      recalculateCarryForward(student, storage.fees.getAll())
    })
    loadFees()
    resetForm()
    setIsDialogOpen(false)
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFee) return
    const paymentAmount = Number.parseFloat(paymentData.amount)
    // Create payment record
    const newPayment: FeePayment = {
      id: Date.now().toString(),
      feeId: selectedFee.id,
      amount: paymentAmount,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      referenceNumber: paymentData.referenceNumber,
      notes: paymentData.notes,
      createdAt: new Date().toISOString(),
    }
    // Add payment to storage
    const payments = getFromStorage<FeePayment[]>("schoolmanagementsystem_fee_payments", [])
    payments.push(newPayment)
    setToStorage("schoolmanagementsystem_fee_payments", payments)
    // Update fee record
    const newTotalPaid = selectedFee.totalPaid + paymentAmount
    // Don't recalc balance here, will do in recalc
    const updatedFee: Fee = {
      ...selectedFee,
      totalPaid: newTotalPaid,
    }
    storage.fees.update(selectedFee.id, updatedFee)
    // After payment, recalc carry forward for this student
    const student = students.find(s => s.id === selectedFee.studentId)
    if (student) {
      recalculateCarryForward(student, storage.fees.getAll())
    }
    loadFees()
    resetPaymentForm()
    setIsPaymentDialogOpen(false)
  }

  const resetForm = () => {
    const currentYear = new Date().getFullYear()
    setFormData({
      categoryClass: "",
      term: `Term 1/${currentYear}`,
      totalBilled: "",
    })
  }

  const resetPaymentForm = () => {
    setPaymentData({
      amount: "",
      paymentDate: "",
      paymentMethod: "cash",
      referenceNumber: "",
      notes: "",
    })
    setSelectedFee(null)
  }

  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    return student ? `${student.firstName} ${student.lastName}` : "Unknown"
  }

  const getStudentAdmissionNumber = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    return student ? student.admissionNumber : "Unknown"
  }

  const getStudentCategoryAndClass = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    if (!student) return "Unknown"

    const categoryName = student.category.charAt(0).toUpperCase() + student.category.slice(1)
    return `${categoryName}/${student.className}`
  }

  const openPaymentDialog = (fee: Fee) => {
    setSelectedFee(fee)
    setPaymentData({
      ...paymentData,
      paymentDate: new Date().toISOString().split("T")[0],
    })
    setIsPaymentDialogOpen(true)
  }

  const openEditDialog = (fee: Fee) => {
    setEditFee(fee)
    setEditAmount(fee.totalBilled.toString())
    setEditAmountPaid(fee.totalPaid.toString())
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editFee) return
    const newTotalBilled = Number.parseFloat(editAmount)
    const newTotalPaid = Number.parseFloat(editAmountPaid)
    // Don't recalc balance here, will do in recalc
    const updatedFee: Fee = {
      ...editFee,
      totalBilled: newTotalBilled,
      totalPaid: newTotalPaid,
    }
    storage.fees.update(editFee.id, updatedFee)
    // After edit, recalc carry forward for this student
    const student = students.find(s => s.id === editFee.studentId)
    if (student) {
      recalculateCarryForward(student, storage.fees.getAll())
    }
    loadFees()
    setIsEditDialogOpen(false)
    setEditFee(null)
    setEditAmount("")
    setEditAmountPaid("")
  }

  const getStatusBadge = (status: Fee["status"]) => {
    switch (status) {
      case "paid":
        return <Badge variant="default">Paid</Badge>
      case "partial":
        return <Badge variant="secondary">Partial</Badge>
      case "overpayment":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Overpayment</Badge>
      case "pending":
      default:
        return <Badge variant="destructive">Pending</Badge>
    }
  }

  // Get unique category/class combinations
  const getCategoryClassOptions = () => {
    const uniqueCombinations = new Set<string>()

    classes.forEach((classItem) => {
      const categoryName = classItem.category.charAt(0).toUpperCase() + classItem.category.slice(1)
      uniqueCombinations.add(`${categoryName}/${classItem.className}`)
    })

    return Array.from(uniqueCombinations).sort()
  }

  // Generate term options (from Term 1/2025 onwards)
  const generateTermOptions = () => {
    const terms = []
    for (let year = 2025; year <= new Date().getFullYear() + 2; year++) {
      for (let term = 1; term <= 3; term++) {
        terms.push(`Term ${term}/${year}`)
      }
    }
    return terms
  }

  // Helper to generate months from January 2025 onwards up to now + 11 months
  function generateLast12Months() {
    const months = []
    const now = new Date()
    const start = new Date(2025, 0, 1) // January 2025
    let d = new Date(now.getFullYear(), now.getMonth(), 1)
    for (let i = 0; i < 12; i++) {
      if (d < start) break
      months.push(format(d, "MMMM yyyy"))
      d = addMonths(d, -1)
    }
    return months.reverse() // so earliest is first
  }

  // Helper to get category and class from filter value
  const getCategoryAndClass = (catClass: string) => {
    const [category, className] = catClass.split("/")
    return { category: category?.toLowerCase() || "", className: className || "" }
  }

  // Determine selected category
  const selectedCategory = filterCategoryClass && filterCategoryClass !== "all" ? filterCategoryClass.split("/")[0].toLowerCase() : ""

  // Filtered fees based on filters - only show billed fees
  const filteredFees = fees.filter((fee) => {
    // Only show fees that have been billed (totalBilled > 0)
    if (typeof fee.totalBilled !== 'number' || fee.totalBilled <= 0) {
      return false
    }
    
    const student = students.find((s) => s.id === fee.studentId)
    if (!student) return false
    // Category/Class filter
    if (filterCategoryClass && filterCategoryClass !== "all") {
      const { category, className } = getCategoryAndClass(filterCategoryClass)
      if (student.category !== category || student.className !== className) return false
    }
    // Term/Month filter
    if (selectedCategory === "integrated" && filterTerm && filterTerm !== "all") {
      if (fee.term !== filterTerm) return false
    }
    if ((selectedCategory === "tahfidh" || selectedCategory === "talim") && filterMonth && filterMonth !== "all") {
      if (fee.term !== filterMonth) return false
    }
    // Status filter
    if (filterStatus && filterStatus !== "all") {
      if (fee.status !== filterStatus) return false
    }
    // Search filter (keep existing logic)
    const studentName = getStudentName(fee.studentId).toLowerCase()
    const admissionNumber = getStudentAdmissionNumber(fee.studentId).toLowerCase()
    const categoryClass = getStudentCategoryAndClass(fee.studentId).toLowerCase()
    const term = fee.term.toLowerCase()
    if (
      searchTerm &&
      !(
        studentName.includes(searchTerm.toLowerCase()) ||
        admissionNumber.includes(searchTerm.toLowerCase()) ||
        categoryClass.includes(searchTerm.toLowerCase()) ||
        term.includes(searchTerm.toLowerCase())
      )
    ) {
      return false
    }
    return true
  })

  // Download fee data
  const downloadFeeData = () => {
    const csvContent = [
      ["Student", "Admission No.", "Category/Class", "Term", "Total Billed", "Total Paid", "Balance", "Status"].join(
        ",",
      ),
      ...fees.map((fee) =>
        [
          getStudentName(fee.studentId),
          getStudentAdmissionNumber(fee.studentId),
          getStudentCategoryAndClass(fee.studentId),
          fee.term,
                  typeof fee.totalBilled === 'number' && !isNaN(fee.totalBilled) ? fee.totalBilled.toFixed(2) : '0.00',
        typeof fee.totalPaid === 'number' && !isNaN(fee.totalPaid) ? fee.totalPaid.toFixed(2) : '0.00',
        typeof fee.balance === 'number' && !isNaN(fee.balance) ? fee.balance.toFixed(2) : '0.00',
          fee.status,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fee_records_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Helper to get all payments for a fee
  const getAllPayments = (feeId: string): FeePayment[] => {
    const payments: FeePayment[] = getFromStorage("schoolmanagementsystem_fee_payments", [])
    return payments.filter((p) => p.feeId === feeId)
  }

  // Helper: Type guard for category
  function isValidCategory(cat: string): cat is 'integrated' | 'tahfidh' | 'talim' {
    return cat === 'integrated' || cat === 'tahfidh' || cat === 'talim';
  }

  // PDF receipt generator (debug: log all payments for the fee)
  const downloadReceipt = (fee: Fee) => {
    if (fee.totalPaid <= 0) {
      // Do nothing if no payment has been made
      return
    }
    const student = students.find((s) => s.id === fee.studentId)
    if (!student) return
    const payments = getAllPayments(fee.id)
    // If no payments, create a single row with totalPaid
    const paymentRows = payments.length > 0 ? payments : [{
      paymentDate: '-',
      amount: fee.totalPaid,
      paymentMethod: '-',
      referenceNumber: '-',
      notes: '-',
    }];
    const doc = new jsPDF();
    // Render PDF after logo is loaded
    const renderPDF = (logoBase64?: string) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 35;
      const logoHeight = 35;
      const logoX = (pageWidth - logoWidth) / 2;
      let y = 7;
      if (logoBase64) {
        doc.addImage(logoBase64, 'JPEG', logoX, y, logoWidth, logoHeight); // Top center
        y += logoHeight + 8;
      }
      doc.setFontSize(18);
      doc.text(student.category === "integrated" ? "Tanzil Integrated Academy" : "Markaz Tanzil", pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.setFontSize(12);
      doc.text('Knowledge and Value', pageWidth / 2, y, { align: 'center' });
      y += 12;
      // Student & Fee Details
      doc.setFontSize(11);
      doc.text(`Student Name: ${student.firstName} ${student.lastName}`, 20, y);
      doc.text(`Admission Number: ${student.admissionNumber}`, 120, y);
      y += 7;
      doc.text(`Class: ${student.className}`, 20, y);
      doc.text(`Term: ${fee.term || '-'}`, 120, y);
      y += 7;
      doc.text(`Receipt Date: ${new Date().toLocaleDateString()}`, 20, y);
      y += 10;
      // Table Header
      doc.setFontSize(12);
      doc.setFont('bold');
      doc.text('Date', 20, y);
      doc.text('Amount', 55, y);
      doc.text('Method', 90, y);
      doc.text('Reference', 125, y);
      doc.text('Notes', 160, y);
      doc.setFont('normal');
      y += 4;
      doc.setLineWidth(0.1);
      doc.line(20, y, 190, y);
      y += 6;
      // Table Rows
      doc.setFontSize(11);
      paymentRows.forEach((p) => {
        doc.text(String(p.paymentDate), 20, y);
        doc.text(Number(p.amount).toFixed(2), 55, y, { align: 'right' });
        doc.text(String(p.paymentMethod), 90, y);
        doc.text(String(p.referenceNumber), 125, y);
        doc.text(String(p.notes), 160, y, { maxWidth: 30 });
        y += 7;
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
      });
      y += 2;
      doc.setLineWidth(0.1);
      doc.line(20, y, 190, y);
      y += 8;
      // Summary (all on one line, compact and safe)
      doc.setFont('bold');
      let x = 20;
      const billed = typeof fee.totalBilled === 'number' && !isNaN(fee.totalBilled) ? fee.totalBilled.toFixed(2) : '0.00';
      const paid = typeof fee.totalPaid === 'number' && !isNaN(fee.totalPaid) ? fee.totalPaid.toFixed(2) : '0.00';
      const balance = typeof fee.balance === 'number' && !isNaN(fee.balance) ? fee.balance.toFixed(2) : '0.00';
      let balanceText = balance;
      if (typeof fee.balance === 'number' && !isNaN(fee.balance) && fee.balance < 0) {
        balanceText += ' (Overpayment Carried forward)';
      }
      doc.text('Amount Billed:', x, y);
      x += 28;
      doc.text(billed, x, y, { align: 'left' });
      x += 18;
      doc.text('Amount Paid:', x, y);
      x += 24;
      doc.text(paid, x, y, { align: 'left' });
      x += 18;
      doc.text('Balance:', x, y);
      x += 16;
      doc.text(balanceText, x, y, { align: 'left' });
      doc.setFont('normal');
      y += 10;
      doc.setFontSize(10);
      doc.text(`Receipt generated on: ${new Date().toLocaleString()}`, 20, y);
      doc.save(`${student.admissionNumber}_fee_receipt.pdf`);
    }
    let logoCategory: 'integrated' | 'tahfidh' | 'talim' = 'integrated';
    if (isValidCategory(student.category)) logoCategory = student.category;
    if (getLogoByCategory(logoCategory)) {
      renderPDF(getLogoByCategory(logoCategory))
    } else {
      renderPDF()
    }
  }

  // Helper: Get previous fee for a student before a given term/month
  function getPreviousFee(fee: Fee, student: Student, allFees: Fee[]): Fee | null {
    const sorted = getSortedFeesForStudent(student.id, student.category, allFees)
    const idx = sorted.findIndex(f => f.id === fee.id)
    if (idx > 0) return sorted[idx - 1]
    return null
  }

  // Helper: Get next fee for a student after a given term/month
  function getNextFee(fee: Fee, student: Student, allFees: Fee[]): Fee | null {
    const sorted = getSortedFeesForStudent(student.id, student.category, allFees)
    const idx = sorted.findIndex(f => f.id === fee.id)
    if (idx >= 0 && idx < sorted.length - 1) return sorted[idx + 1]
    return null
  }

  // Helper: Download PDF statement for current filter
  async function downloadFeeStatementPDF() {
    // Determine selected category and label
    const catClass = filterCategoryClass && filterCategoryClass !== "all" ? filterCategoryClass : null
    const selectedCat = catClass ? catClass.split("/")[0].toLowerCase() : "all"
    const selectedClass = catClass ? catClass.split("/")[1] : null
    // Filtered fees for statement
    const statementFees = filteredFees
    if (!statementFees.length) return
    // Calculate summary
    let totalBilled = 0, totalPaid = 0, totalBalance = 0
    statementFees.forEach(fee => {
      totalBilled += typeof fee.totalBilled === 'number' && !isNaN(fee.totalBilled) ? fee.totalBilled : 0
      totalPaid += typeof fee.totalPaid === 'number' && !isNaN(fee.totalPaid) ? fee.totalPaid : 0
      totalBalance += typeof fee.balance === 'number' && !isNaN(fee.balance) ? fee.balance : 0
    })
    // PDF setup
    const doc = new jsPDF({ orientation: 'landscape' })
    let statementY = 10
    let statementLogoBase64: string | undefined
    let logoCategory: 'integrated' | 'tahfidh' | 'talim' = 'integrated';
    if (isValidCategory(selectedCat)) logoCategory = selectedCat;
    try { statementLogoBase64 = await getLogoByCategory(logoCategory) } catch {}
    const pageWidth = doc.internal.pageSize.getWidth()
    if (typeof statementLogoBase64 === 'string' && statementLogoBase64) {
      doc.addImage(statementLogoBase64, 'JPEG', pageWidth / 2 - 17.5, statementY, 35, 35)
      statementY += 40
    }
    doc.setFontSize(18)
    doc.text(selectedCat === "integrated" ? "Tanzil Integrated Academy" : "Markaz Tanzil", pageWidth / 2, statementY, { align: 'center' })
    statementY += 8
    doc.setFontSize(12)
    doc.text('Knowledge and Value', pageWidth / 2, statementY, { align: 'center' })
    statementY += 12
    // Left-aligned: Category, Term/Month
    doc.setFontSize(12)
    let leftY = statementY
    let leftX = 15
    if (catClass) doc.text(`Category: ${catClass}`, leftX, leftY)
    if (selectedCat === "integrated" && filterTerm && filterTerm !== "all") doc.text(`Term: ${filterTerm}`, leftX, leftY + 8)
    if ((selectedCat === "tahfidh" || selectedCat === "talim") && filterMonth && filterMonth !== "all") doc.text(`Month: ${filterMonth}`, leftX, leftY + 8)
    statementY += 20
    // Table
    const tableColumns = [
      "Student", "Admission No.", "Category/Class", "Term", "Amount Billed", "Amount Paid", "Balance", "Status"
    ]
    const tableRows = statementFees.map(fee => [
      getStudentName(fee.studentId),
      getStudentAdmissionNumber(fee.studentId),
      getStudentCategoryAndClass(fee.studentId),
      fee.term,
      typeof fee.totalBilled === 'number' && !isNaN(fee.totalBilled) ? fee.totalBilled.toFixed(2) : '0.00',
      typeof fee.totalPaid === 'number' && !isNaN(fee.totalPaid) ? fee.totalPaid.toFixed(2) : '0.00',
      typeof fee.balance === 'number' && !isNaN(fee.balance) ? fee.balance.toFixed(2) : '0.00',
      fee.status
    ])
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: statementY,
      styles: { fontSize: 10 },
      margin: { left: 10, right: 10 }
    })
    // Summary at the bottom
    let summaryY = (doc as any).lastAutoTable.finalY || statementY + 10
    doc.setFontSize(12)
    doc.setFont('bold')
    doc.text(`Total Billed: ${totalBilled.toFixed(2)}`, 15, summaryY + 12)
    doc.text(`Total Paid: ${totalPaid.toFixed(2)}`, 80, summaryY + 12)
    doc.text(`Total Balance: ${totalBalance.toFixed(2)}`, 150, summaryY + 12)
    doc.setFont('normal')
    doc.save(`fee_statement_${catClass || 'all'}_${filterTerm || filterMonth || 'all'}.pdf`)
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

  // Add a helper to get the category from the selected categoryClass
  const getSelectedCategory = () => {
    if (!formData.categoryClass) return "";
    return formData.categoryClass.split("/")[0].toLowerCase();
  };

  return (
    <DashboardLayout user={user || undefined} onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Fee Management</h2>
            <p className="text-muted-foreground">Manage student fees and payments by Category/Class</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={downloadFeeStatementPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download Statement (PDF)
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Set Fee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Set Category/Class Fee</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="categoryClass">Category/Class</Label>
                    <Select
                      value={formData.categoryClass}
                      onValueChange={(value) => setFormData({ ...formData, categoryClass: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category/class" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCategoryClassOptions().map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Dynamic period selector based on category */}
                  {getSelectedCategory() === "integrated" ? (
                    <div>
                      <Label htmlFor="term">Term</Label>
                      <Select
                        value={formData.term}
                        onValueChange={(value) => setFormData({ ...formData, term: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTermOptions().map((term) => (
                            <SelectItem key={term} value={term}>
                              {term}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : getSelectedCategory() === "tahfidh" || getSelectedCategory() === "talim" ? (
                    <div>
                      <Label htmlFor="term">Month</Label>
                      <Select
                        value={formData.term}
                        onValueChange={(value) => setFormData({ ...formData, term: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateLast12Months().map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                  <div>
                    <Label htmlFor="totalBilled">Total Billed Amount</Label>
                    <Input
                      id="totalBilled"
                      type="number"
                      step="0.01"
                      value={formData.totalBilled}
                      onChange={(e) => setFormData({ ...formData, totalBilled: e.target.value })}
                      placeholder="Enter amount without currency symbol"
                      required
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    This will set the fee for all students in the selected Category/Class.
                  </div>
                  <Button type="submit" className="w-full">
                    Set Fee for Category/Class
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex flex-wrap gap-4 items-end mb-2">
          <div>
            <Label>Category/Class</Label>
            <Select value={filterCategoryClass} onValueChange={setFilterCategoryClass}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {getCategoryClassOptions().map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Period filter always visible, but disabled if no category selected */}
          <div>
            <Label>{selectedCategory === "integrated" ? "Term" : (selectedCategory === "tahfidh" || selectedCategory === "talim") ? "Month" : "Period"}</Label>
            {selectedCategory === "integrated" ? (
              <Select value={filterTerm} onValueChange={setFilterTerm} disabled={!selectedCategory}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder={!selectedCategory ? "Select category first" : "All"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {generateTermOptions().map((term) => (
                    <SelectItem key={term} value={term}>{term}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (selectedCategory === "tahfidh" || selectedCategory === "talim") ? (
              <Select value={filterMonth} onValueChange={setFilterMonth} disabled={!selectedCategory}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder={!selectedCategory ? "Select category first" : "All"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {generateLast12Months().map((month) => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select disabled>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Select category first" />
                </SelectTrigger>
              </Select>
            )}
          </div>
          {/* Status Filter */}
          <div>
            <Label>Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overpayment">Overpayment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, admission number, category/class, or term..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            {selectedFee && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  <strong>Student:</strong> {getStudentName(selectedFee.studentId)}
                </p>
                <p className="text-sm">
                  <strong>Category/Class:</strong> {getStudentCategoryAndClass(selectedFee.studentId)}
                </p>
                <p className="text-sm">
                  <strong>Current Balance:</strong> {typeof selectedFee.balance === 'number' && !isNaN(selectedFee.balance) ? selectedFee.balance.toFixed(2) : '0.00'}
                  {typeof selectedFee.balance === 'number' && !isNaN(selectedFee.balance) && selectedFee.balance < 0 && " (Overpayment)"}
                </p>
              </div>
            )}
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  placeholder="Enter amount without currency symbol"
                  required
                />
              </div>
              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={paymentData.paymentMethod}
                  onValueChange={(value) => setPaymentData({ ...paymentData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="referenceNumber">Reference Number</Label>
                <Input
                  id="referenceNumber"
                  value={paymentData.referenceNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
              <Button type="submit" className="w-full">
                Record Payment
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Fee Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Fee Amounts</DialogTitle>
            </DialogHeader>
            {editFee && (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <Label>Student</Label>
                  <div className="text-sm font-medium">{getStudentName(editFee.studentId)}</div>
                </div>
                <div>
                  <Label>Term</Label>
                  <div className="text-sm font-medium">{editFee.term}</div>
                </div>
                <div>
                  <Label htmlFor="editAmount">Total Billed Amount</Label>
                  <Input
                    id="editAmount"
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editAmountPaid">Total Paid Amount</Label>
                  <Input
                    id="editAmountPaid"
                    type="number"
                    step="0.01"
                    value={editAmountPaid}
                    onChange={e => setEditAmountPaid(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Save Changes</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Fee Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Category/Class</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount Billed</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.map((fee) => {
                  const student = students.find((s) => s.id === fee.studentId)
                  if (!student) return null
                  let periodLabel = fee.term
                  if (student.category === 'integrated') {
                    periodLabel = fee.term
                  } else if (student.category === 'talim' || student.category === 'tahfidh') {
                    periodLabel = fee.term
                  }
                  const prevFee = getPreviousFee(fee, student, fees)
                  const nextFee = getNextFee(fee, student, fees)
                  const carriedForward = prevFee && typeof prevFee.balance === 'number' && !isNaN(prevFee.balance) && prevFee.balance !== 0
                  let carryMsg = null
                  if (carriedForward && prevFee) {
                    const prevLabel = student.category === 'integrated' ? prevFee.term : prevFee.term
                    carryMsg = `Balance of (${Number(prevFee.balance).toFixed(2)}) carried forward from ${prevLabel}`
                  }
                  let carryToNextMsg = null
                  if (nextFee && typeof fee.balance === 'number' && !isNaN(fee.balance) && fee.balance !== 0) {
                    const nextLabel = student.category === 'integrated' ? nextFee.term : nextFee.term
                    carryToNextMsg = `Balance of (${Number(fee.balance).toFixed(2)}) carried forward to ${nextLabel}`
                  }
                  return (
                    <TableRow key={fee.id}>
                      <TableCell>{getStudentName(fee.studentId)}</TableCell>
                      <TableCell className="font-mono">{getStudentAdmissionNumber(fee.studentId)}</TableCell>
                      <TableCell>{getStudentCategoryAndClass(fee.studentId)}</TableCell>
                      <TableCell>{typeof fee.totalBilled === 'number' && fee.totalBilled > 0 ? periodLabel : ''}</TableCell>
                      <TableCell>{typeof fee.totalBilled === 'number' && !isNaN(fee.totalBilled) ? fee.totalBilled.toFixed(2) : '0.00'}</TableCell>
                      <TableCell>{typeof fee.totalPaid === 'number' && !isNaN(fee.totalPaid) ? fee.totalPaid.toFixed(2) : '0.00'}</TableCell>
                      <TableCell>
                        <span
                          className={
                            typeof fee.balance === 'number' && !isNaN(fee.balance)
                              ? fee.balance > 0
                                ? "text-red-600 font-medium"
                                : fee.balance < 0
                                  ? "text-blue-600 font-medium"
                                  : "text-green-600"
                              : "text-green-600"
                          }
                        >
                          {typeof fee.balance === 'number' && !isNaN(fee.balance) ? fee.balance.toFixed(2) : '0.00'}
                        </span>
                        {carryMsg && (
                          <div className="text-xs text-muted-foreground mt-1">{carryMsg}</div>
                        )}
                        {carryToNextMsg && (
                          <div className="text-xs text-muted-foreground mt-1">{carryToNextMsg}</div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(fee.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => openPaymentDialog(fee)}>
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(fee)}
                            title="Edit Fee"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadReceipt(fee)}
                            title="Download Receipt"
                            disabled={fee.balance > 0}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredFees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {searchTerm
                        ? "No fee records match your search."
                        : "No fee records found. Set fees for Category/Class to get started."}
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
