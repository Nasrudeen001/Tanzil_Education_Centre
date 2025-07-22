"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, DollarSign, Bell, BookOpen, User, Pen } from "lucide-react"
import { storage } from "@/lib/storage"



export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    staffCount: 0,
    studentCount: 0,
    totalFees: 0,
    pendingFees: 0,
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
      if (!user || user.role !== "admin") {
        router.push("/login")
        return
      }

      // Calculate stats
      const staff = storage.staff.getAll()
      const students = storage.students.getAll()
      const fees = storage.fees.getAll()

      const activeStaff = staff.filter((s) => s.status === "active")
      const activeStudents = students.filter((s) => s.status === "active")
      const totalBilled = fees.reduce((sum, fee) => sum + fee.totalBilled, 0)
      const totalPending = fees.reduce((sum, fee) => sum + fee.balance, 0)

      setStats({
        staffCount: activeStaff.length,
        studentCount: activeStudents.length,
        totalFees: totalBilled,
        pendingFees: totalPending,
      })
    }
  }, [user, router, mounted])

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
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's what's happening at your school.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.staffCount}</div>
              <p className="text-xs text-muted-foreground">Active staff members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.studentCount}</div>
              <p className="text-xs text-muted-foreground">Active students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fees Billed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This academic year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.pendingFees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Outstanding balance</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="/portal/admin/staff" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium">Add New Staff</div>
                <div className="text-sm text-muted-foreground">Register teaching or non-teaching staff</div>
              </a>
              <a href="/portal/admin/students" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium">Add New Student</div>
                <div className="text-sm text-muted-foreground">Register new student admission</div>
              </a>
              <a href="/portal/admin/announcements" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium">Send Announcement</div>
                <div className="text-sm text-muted-foreground">Broadcast message to users</div>
              </a>
              {/* <a href="/admin/documents" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium">Manage Documents</div>
                <div className="text-sm text-muted-foreground">Upload and organize official documents</div>
              </a> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">System ready</span>
                  <div className="text-muted-foreground">All systems operational</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
