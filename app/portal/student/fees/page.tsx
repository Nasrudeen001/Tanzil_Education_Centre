"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, DollarSign, User, FileText, CreditCard, Calendar, Download } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Student, Fee, FeePayment } from "@/lib/types"
import { getLogoByCategory } from "@/lib/utils"
import jsPDF from "jspdf"



export default function StudentFees() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [studentData, setStudentData] = useState<Student | null>(null)
  const [feeData, setFeeData] = useState<Fee | null>(null)
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all")
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])

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

    if (currentStudent) {
      // Get all fee data for this student across all periods
      const allFees = storage.fees.getAll()
      const studentFees = allFees.filter((f) => f.studentId === currentStudent.id)
      
      // Extract available periods for dropdown
      const periods = studentFees.map(fee => fee.term).filter((term, index, arr) => arr.indexOf(term) === index)
      setAvailablePeriods(['all', ...periods])
      
      if (studentFees.length > 0) {
        // Calculate totals across all periods
        const totalBilled = studentFees.reduce((sum, fee) => sum + (fee.totalBilled || 0), 0)
        const totalPaid = studentFees.reduce((sum, fee) => sum + (fee.totalPaid || 0), 0)
        const balance = totalBilled - totalPaid
        
        // Create aggregated fee data object
        const aggregatedFeeData: Fee = {
          id: 'aggregated',
          studentId: currentStudent.id,
          term: 'All Periods',
          totalBilled,
          totalPaid,
          balance,
          status: totalPaid > totalBilled ? "overpayment" : totalPaid === totalBilled && totalBilled > 0 ? "paid" : totalPaid > 0 ? "partial" : "pending",
          createdAt: new Date().toISOString(),
        }
        
        setFeeData(aggregatedFeeData)

        // Get payment history from all fee periods
        const allPayments = storage.feePayments.getAll()
        const allStudentPayments = allPayments.filter((p: FeePayment) => 
          studentFees.some(fee => fee.id === p.feeId)
        )
        setPayments(
          allStudentPayments.sort(
            (a: FeePayment, b: FeePayment) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
          ),
        )
      } else {
        setFeeData(null)
        setPayments([])
      }
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return <Badge variant="default">Cash</Badge>
      case "check":
        return <Badge variant="secondary">Check</Badge>
      case "bank_transfer":
        return <Badge variant="outline">Bank Transfer</Badge>
      case "online":
        return <Badge variant="default">Online</Badge>
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  // Function to get fee data for selected period
  const getFeeDataForPeriod = (period: string) => {
    if (!studentData) return null
    
    const allFees = storage.fees.getAll()
    const studentFees = allFees.filter((f) => f.studentId === studentData.id)
    
    if (period === "all") {
      // Return aggregated data
      const totalBilled = studentFees.reduce((sum, fee) => sum + (fee.totalBilled || 0), 0)
      const totalPaid = studentFees.reduce((sum, fee) => sum + (fee.totalPaid || 0), 0)
      const balance = totalBilled - totalPaid
      
      return {
        totalBilled,
        totalPaid,
        balance,
        term: 'All Periods',
        status: totalPaid > totalBilled ? "overpayment" : totalPaid === totalBilled && totalBilled > 0 ? "paid" : totalPaid > 0 ? "partial" : "pending"
      }
    } else {
      // Return data for specific period
      const periodFee = studentFees.find(fee => fee.term === period)
      if (!periodFee) return null
      
      return {
        totalBilled: periodFee.totalBilled,
        totalPaid: periodFee.totalPaid,
        balance: periodFee.balance,
        term: periodFee.term,
        status: periodFee.status
      }
    }
  }

  // Function to get payments for selected period
  const getPaymentsForPeriod = (period: string) => {
    if (!studentData) return []
    
    const allFees = storage.fees.getAll()
    const studentFees = allFees.filter((f) => f.studentId === studentData.id)
    const allPayments = storage.feePayments.getAll()
    
    if (period === "all") {
      // Return all payments
      return allPayments.filter((p: FeePayment) => 
        studentFees.some(fee => fee.id === p.feeId)
      ).sort((a: FeePayment, b: FeePayment) => 
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      )
    } else {
      // Return payments for specific period
      const periodFee = studentFees.find(fee => fee.term === period)
      if (!periodFee) return []
      
      return allPayments.filter((p: FeePayment) => p.feeId === periodFee.id)
        .sort((a: FeePayment, b: FeePayment) => 
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        )
    }
  }

  // Modified download receipt function to work with selected period
  const downloadReceipt = () => {
    if (!studentData) return;
    
    const periodFeeData = getFeeDataForPeriod(selectedPeriod)
    const periodPayments = getPaymentsForPeriod(selectedPeriod)
    
    if (!periodFeeData || periodFeeData.totalPaid <= 0) {
      alert("No payments found for the selected period. Receipt cannot be generated.");
      return;
    }
    
    // If no payments, create a single row with totalPaid
    const paymentRows = periodPayments.length > 0 ? periodPayments : [{
      paymentDate: '-',
      amount: periodFeeData.totalPaid,
      paymentMethod: '-',
      referenceNumber: '-',
      notes: '-',
    }];
    
    const doc = new jsPDF();
    // Add logo to top left based on student category
    const logoUrl = getLogoByCategory(studentData.category)
    const img = new Image();
    img.src = logoUrl;
    img.onload = function() {
      // Centered logo at the top
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 35;
      const logoHeight = 35;
      const logoX = (pageWidth - logoWidth) / 2;
      let y = 7;
      doc.addImage(img, 'JPEG', logoX, y, logoWidth, logoHeight); // Top center
      y += logoHeight + 8; // Equal space between logo and institution name
      doc.setFontSize(18);
      // Use different school names based on student category
      const schoolName = studentData.category === 'integrated' 
        ? 'TANZIL INTEGRATED ACADEMY' 
        : 'MARKAZ TANZIL';
      doc.text(schoolName, pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.setFontSize(12);
      doc.text('Knowledge and Values', pageWidth / 2, y, { align: 'center' });
      y += 12; // Extra space before content
      // Student & Fee Details
      doc.setFontSize(11);
      doc.text(`Student Name: ${studentData.firstName} ${studentData.lastName}`, 20, y);
      doc.text(`Admission Number: ${studentData.admissionNumber}`, 120, y);
      y += 7;
      doc.text(`Class: ${studentData.className}`, 20, y);
      doc.text(`Period: ${periodFeeData.term}`, 120, y);
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
      // Summary (all on one line, spaced out)
      doc.setFont('bold');
      doc.text('Amount Billed:', 20, y);
      doc.text((periodFeeData.totalBilled ?? 0).toFixed(2), 60, y, { align: 'left' });
      doc.text('Amount Paid:', 90, y);
      doc.text((periodFeeData.totalPaid ?? 0).toFixed(2), 120, y, { align: 'left' });
      doc.text('Balance:', 150, y);
      doc.text((periodFeeData.balance ?? 0).toFixed(2), 180, y, { align: 'left' });
      doc.setFont('normal');
      y += 10;
      doc.setFontSize(10);
      doc.text(`Receipt generated on: ${new Date().toLocaleString()}`, 20, y);
      doc.save(`${studentData.admissionNumber}_${periodFeeData.term.replace(/\s+/g, '_')}_receipt.pdf`);
    }
  };

  // New function to generate Payment History PDF
  const downloadPaymentHistory = () => {
    if (!studentData) return;
    
    const doc = new jsPDF();
    const logoUrl = getLogoByCategory(studentData.category)
    const img = new Image();
    img.src = logoUrl;
    
    img.onload = function() {
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 35;
      const logoHeight = 35;
      const logoX = (pageWidth - logoWidth) / 2;
      let y = 7;
      
      // Header
      doc.addImage(img, 'JPEG', logoX, y, logoWidth, logoHeight);
      y += logoHeight + 8;
      doc.setFontSize(18);
      // Use different school names based on student category
      const schoolName = studentData.category === 'integrated' 
        ? 'TANZIL INTEGRATED ACADEMY' 
        : 'MARKAZ TANZIL';
      doc.text(schoolName, pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.setFontSize(12);
      doc.text('Knowledge and Values', pageWidth / 2, y, { align: 'center' });
      y += 12;
      
      // Title
      doc.setFontSize(16);
      doc.setFont('bold');
      doc.text('Payment History Report', pageWidth / 2, y, { align: 'center' });
      y += 10;
      
      // Student Details
      doc.setFontSize(11);
      doc.setFont('normal');
      doc.text(`Student Name: ${studentData.firstName} ${studentData.lastName}`, 20, y);
      doc.text(`Admission Number: ${studentData.admissionNumber}`, 120, y);
      y += 7;
      doc.text(`Class: ${studentData.className}`, 20, y);
      doc.text(`Category: ${studentData.category}`, 120, y);
      y += 7;
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, y);
      y += 10;
      
      // Summary
      doc.setFontSize(12);
      doc.setFont('bold');
      doc.text('Payment Summary:', 20, y);
      y += 7;
      doc.setFont('normal');
      doc.setFontSize(11);
      doc.text(`Total Payments Made: ${payments.length}`, 20, y);
      y += 6;
      doc.text(`Total Amount Paid: ${(feeData?.totalPaid || 0).toFixed(2)}`, 20, y);
      y += 6;
      doc.text(`Last Payment Date: ${payments.length > 0 ? payments[0].paymentDate : 'No payments yet'}`, 20, y);
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
      doc.setFontSize(10);
      if (payments.length > 0) {
        payments.forEach((payment) => {
          doc.text(String(payment.paymentDate), 20, y);
          doc.text(Number(payment.amount).toFixed(2), 55, y, { align: 'right' });
          doc.text(String(payment.paymentMethod), 90, y);
          doc.text(String(payment.referenceNumber || '-'), 125, y);
          doc.text(String(payment.notes || '-'), 160, y, { maxWidth: 30 });
          y += 6;
          
          if (y > 260) {
            doc.addPage();
            y = 20;
          }
        });
      } else {
        doc.text('No payments recorded yet.', 20, y);
      }
      
      y += 10;
      doc.setFontSize(10);
      doc.text(`Report generated on: ${new Date().toLocaleString()}`, 20, y);
      doc.save(`${studentData.admissionNumber}_payment_history.pdf`);
    }
  };

  // New function to generate Fee Breakdown PDF
  const downloadFeeBreakdown = () => {
    if (!studentData) return;
    
    const allFees = storage.fees.getAll()
    const studentFees = allFees.filter((f) => f.studentId === studentData.id)
    
    if (studentFees.length === 0) {
      alert("No fee records found for this student.");
      return;
    }
    
    const doc = new jsPDF();
    const logoUrl = getLogoByCategory(studentData.category)
    const img = new Image();
    img.src = logoUrl;
    
    img.onload = function() {
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 35;
      const logoHeight = 35;
      const logoX = (pageWidth - logoWidth) / 2;
      let y = 7;
      
      // Header
      doc.addImage(img, 'JPEG', logoX, y, logoWidth, logoHeight);
      y += logoHeight + 8;
      doc.setFontSize(18);
      // Use different school names based on student category
      const schoolName = studentData.category === 'integrated' 
        ? 'TANZIL INTEGRATED ACADEMY' 
        : 'MARKAZ TANZIL';
      doc.text(schoolName, pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.setFontSize(12);
      doc.text('Knowledge and Values', pageWidth / 2, y, { align: 'center' });
      y += 12;
      
      // Title
      doc.setFontSize(16);
      doc.setFont('bold');
      doc.text('Fee Breakdown Report', pageWidth / 2, y, { align: 'center' });
      y += 10;
      
      // Student Details
      doc.setFontSize(11);
      doc.setFont('normal');
      doc.text(`Student Name: ${studentData.firstName} ${studentData.lastName}`, 20, y);
      doc.text(`Admission Number: ${studentData.admissionNumber}`, 120, y);
      y += 7;
      doc.text(`Class: ${studentData.className}`, 20, y);
      doc.text(`Category: ${studentData.category}`, 120, y);
      y += 7;
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, y);
      y += 10;
      
      // Overall Summary
      doc.setFontSize(12);
      doc.setFont('bold');
      doc.text('Overall Fee Summary:', 20, y);
      y += 7;
      doc.setFont('normal');
      doc.setFontSize(11);
      doc.text(`Total Amount Billed: ${(feeData?.totalBilled || 0).toFixed(2)}`, 20, y);
      y += 6;
      doc.text(`Total Amount Paid: ${(feeData?.totalPaid || 0).toFixed(2)}`, 20, y);
      y += 6;
      doc.text(`Outstanding Balance: ${(feeData?.balance || 0).toFixed(2)}`, 20, y);
      y += 6;
      doc.text(`Payment Status: ${feeData?.status ? feeData.status.charAt(0).toUpperCase() + feeData.status.slice(1) : 'Pending'}`, 20, y);
      y += 10;
      
      // Sort fees by term
      const sortedFees = studentFees.sort((a, b) => {
        if (studentData?.category === "integrated") {
          const [_, aTerm, aYear] = a.term.match(/Term (\d+)[/\\](\d+)/) || ["", "0", "0"]
          const [__, bTerm, bYear] = b.term.match(/Term (\d+)[/\\](\d+)/) || ["", "0", "0"]
          if (aYear !== bYear) return Number(aYear) - Number(bYear)
          return Number(aTerm) - Number(bTerm)
        } else {
          const aDate = new Date(a.term + " 01")
          const bDate = new Date(b.term + " 01")
          return aDate.getTime() - bDate.getTime()
        }
      });
      
      // Table Header
      doc.setFontSize(12);
      doc.setFont('bold');
      doc.text('Period', 20, y);
      doc.text('Amount Billed', 70, y);
      doc.text('Amount Paid', 110, y);
      doc.text('Balance', 150, y);
      doc.text('Status', 180, y);
      doc.setFont('normal');
      y += 4;
      doc.setLineWidth(0.1);
      doc.line(20, y, 190, y);
      y += 6;
      
      // Table Rows
      doc.setFontSize(10);
      sortedFees.forEach((fee) => {
        doc.text(String(fee.term), 20, y);
        doc.text(Number(fee.totalBilled || 0).toFixed(2), 70, y, { align: 'right' });
        doc.text(Number(fee.totalPaid || 0).toFixed(2), 110, y, { align: 'right' });
        doc.text(Number(fee.balance || 0).toFixed(2), 150, y, { align: 'right' });
        doc.text(fee.status ? fee.status.charAt(0).toUpperCase() + fee.status.slice(1) : 'Pending', 180, y);
        y += 6;
        
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
      });
      
      y += 10;
      doc.setFontSize(10);
      doc.text(`Report generated on: ${new Date().toLocaleString()}`, 20, y);
      doc.save(`${studentData.admissionNumber}_fee_breakdown.pdf`);
    }
  };

  // Helper to generate months from January 2025 onwards up to now + 11 months
  function generateLast12Months() {
    const months = []
    const now = new Date()
    const start = new Date(2025, 0, 1) // January 2025
    let d = new Date(now.getFullYear(), now.getMonth(), 1)
    for (let i = 0; i < 12; i++) {
      if (d < start) break
      months.push(formatMonthYear(d))
      d = new Date(d.getFullYear(), d.getMonth() - 1, 1)
    }
    return months.reverse() // so earliest is first
  }
  function formatMonthYear(date: Date) {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
  }
  function generateTermOptions() {
    const terms = []
    for (let year = 2025; year <= new Date().getFullYear() + 2; year++) {
      for (let term = 1; term <= 3; term++) {
        terms.push(`Term ${term}/${year}`)
      }
    }
    return terms
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
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
          <h2 className="text-3xl font-bold tracking-tight">Fee Status</h2>
          <p className="text-muted-foreground">Your fee information and payment history across all periods</p>
        </div>

        {feeData ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{typeof feeData.totalBilled === 'number' && !isNaN(feeData.totalBilled) ? feeData.totalBilled.toFixed(2) : '0.00'}</div>
                  <p className="text-xs text-muted-foreground">Across all periods</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{typeof feeData.totalPaid === 'number' && !isNaN(feeData.totalPaid) ? feeData.totalPaid.toFixed(2) : '0.00'}</div>
                  <p className="text-xs text-muted-foreground">
                    {typeof feeData.totalBilled === 'number' && !isNaN(feeData.totalBilled) && feeData.totalBilled > 0 ? ((feeData.totalPaid || 0) / feeData.totalBilled * 100).toFixed(1) : '0.0'}% of total billed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${typeof feeData.balance === 'number' && !isNaN(feeData.balance) && feeData.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                    {typeof feeData.balance === 'number' && !isNaN(feeData.balance) ? feeData.balance.toFixed(2) : '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">{typeof feeData.balance === 'number' && !isNaN(feeData.balance) && feeData.balance === 0 ? "Fully Paid" : "Amount Due"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge
                      variant={(feeData.totalPaid || 0) > (feeData.totalBilled || 0) ? "default" : (feeData.balance || 0) === 0 ? "default" : (feeData.totalPaid || 0) > 0 ? "secondary" : "destructive"}
                      style={(feeData.totalPaid || 0) > (feeData.totalBilled || 0) ? { backgroundColor: '#22c55e', color: 'white' } : {}}
                    >
                      {(feeData.totalPaid || 0) > (feeData.totalBilled || 0)
                        ? "Overpayment"
                        : (feeData.balance || 0) === 0
                        ? "Paid"
                        : (feeData.totalPaid || 0) > 0
                        ? "Partial"
                        : "Pending"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Current status</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">Amount Billed</span>
                      <span className="font-bold">{typeof feeData.totalBilled === 'number' && !isNaN(feeData.totalBilled) ? feeData.totalBilled.toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="font-medium text-green-800">Amount Paid</span>
                      <span className="font-bold text-green-800">-{typeof feeData.totalPaid === 'number' && !isNaN(feeData.totalPaid) ? feeData.totalPaid.toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded border-2 border-red-200">
                      <span className="font-medium text-red-800">Balance</span>
                      <span className="font-bold text-red-800">{typeof feeData.balance === 'number' && !isNaN(feeData.balance) ? feeData.balance.toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 gap-2">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="all" value="all">All Periods</SelectItem>
                        {studentData?.category === "integrated"
                          ? generateTermOptions().map((term) => (
                              availablePeriods.includes(term) && (
                                <SelectItem key={term} value={term}>{term}</SelectItem>
                              )
                            ))
                          : (studentData?.category === "talim" || studentData?.category === "tahfidh")
                            ? generateLast12Months().map((month) => (
                                availablePeriods.includes(month) && (
                                  <SelectItem key={month} value={month}>{month}</SelectItem>
                                )
                              ))
                            : availablePeriods.filter(p => p !== 'all').map((period) => (
                                <SelectItem key={period} value={period}>{period}</SelectItem>
                              ))}
                      </SelectContent>
                    </Select>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={downloadReceipt}
                      disabled={!feeData || feeData.totalPaid <= 0}
                    >
                      Download Receipt
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Payments Made:</span>
                      <span className="font-medium">{payments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Payment:</span>
                      <span className="font-medium">
                        {payments.length > 0 ? payments[0].paymentDate : "No payments yet"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payment Progress:</span>
                      <span className="font-medium">
                        {typeof feeData.totalBilled === 'number' && !isNaN(feeData.totalBilled) && feeData.totalBilled > 0 ? ((feeData.totalPaid || 0) / feeData.totalBilled * 100).toFixed(1) : '0.0'}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${feeData.totalBilled && feeData.totalBilled > 0 ? (feeData.totalPaid || 0) / feeData.totalBilled * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Download a detailed report of all your payment transactions including dates, amounts, methods, and reference numbers.
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Payments:</span>
                        <span className="font-medium">{payments.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Amount Paid:</span>
                        <span className="font-medium text-green-600">{(feeData?.totalPaid || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Payment:</span>
                        <span className="font-medium">{payments.length > 0 ? payments[0].paymentDate : "No payments yet"}</span>
                      </div>
                    </div>
                    <button
                      onClick={downloadPaymentHistory}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!studentData}
                    >
                      <Download className="h-4 w-4" />
                      Download Payment History PDF
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Fee Breakdown by Period
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Download a comprehensive breakdown of your fees by period/term showing billed amounts, payments, and balances for each period.
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Periods:</span>
                        <span className="font-medium">{(() => {
                          const allFees = storage.fees.getAll()
                          const studentFees = allFees.filter((f) => f.studentId === studentData?.id)
                          return studentFees.length
                        })()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Billed:</span>
                        <span className="font-medium">{(feeData?.totalBilled || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Outstanding Balance:</span>
                        <span className="font-medium text-red-600">{(feeData?.balance || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={downloadFeeBreakdown}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!studentData}
                    >
                      <Download className="h-4 w-4" />
                      Download Fee Breakdown PDF
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Fee Information</h3>
              <p className="text-muted-foreground">
                No fee records found for your account. Please contact the admin office for assistance.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
