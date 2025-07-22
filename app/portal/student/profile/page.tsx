"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { BookOpen, DollarSign, User, FileText } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Student } from "@/lib/types"
import ProfileForm from "@/components/profile-form"
import ProfileAvatar from "@/components/profile-avatar"


export default function StudentProfile() {
  const { user, login, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [studentData, setStudentData] = useState<Student | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (!user || user.role !== "student") {
        router.push("/login")
        return
      }
      loadStudentData()
    }
  }, [user, router, mounted])

  const loadStudentData = () => {
    if (!user) return

    const allStudents = storage.students.getAll()
    const currentStudent = allStudents.find((s) => s.userId === user.id)
    setStudentData(currentStudent || null)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    if (currentPassword !== user?.password) {
      setError("Current password is incorrect")
      setIsLoading(false)
      return
    }

    try {
      // Update user password
      const updatedUser = { ...user!, password: newPassword }
      storage.users.update(user!.id, updatedUser)
      login(updatedUser)

      setSuccess("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
    <DashboardLayout user={user || undefined} onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
          <p className="text-muted-foreground">Manage your account settings and change your password.</p>
        </div>

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Profile Picture</h3>
          <ProfileAvatar userId={user.id} name={studentData ? `${studentData.firstName} ${studentData.lastName}` : user.username} />
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Admission Number</Label>
                  <Input value={studentData?.admissionNumber || "N/A"} disabled className="font-mono" />
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <div>
                    <Badge
                      variant={
                        studentData?.category === "tahfidh"
                          ? "default"
                          : studentData?.category === "integrated"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {studentData?.category ? studentData.category.charAt(0).toUpperCase() + studentData.category.slice(1) : "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>First Name</Label>
                  <Input value={studentData?.firstName || "N/A"} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Last Name</Label>
                  <Input value={studentData?.lastName || "N/A"} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input value={"N/A"} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input value={"N/A"} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Class</Label>
                  <Input value={studentData?.className || "N/A"} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Admission Date</Label>
                  <Input value={studentData?.admissionDate || "N/A"} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parent/Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Parent/Guardian Name</Label>
                <Input value={studentData?.parentName || "N/A"} disabled />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Parent Phone</Label>
                  <Input value={studentData?.parentPhone || "N/A"} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Parent Email</Label>
                  <Input value={studentData?.parentEmail || "N/A"} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add the profile form for account info and password change */}
        {user && (
          <ProfileForm user={{
            id: Number(user.id) || 0,
            username: user.username,
            role: user.role,
          }} />
        )}
      </div>
    </DashboardLayout>
  )
}
