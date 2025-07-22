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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, User, BookOpen, CheckCircle } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Staff } from "@/lib/types"
import ProfileAvatar from "@/components/profile-avatar"


export default function StaffProfile() {
  const { user, login, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [staffData, setStaffData] = useState<Staff | null>(null)
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
      if (!user || user.role !== "staff") {
        router.push("/login")
        return
      }
      loadStaffData()
    }
  }, [user, router, mounted])

  const loadStaffData = () => {
    if (!user) return

    const allStaff = storage.staff.getAll()
    const currentStaff = allStaff.find((s) => s.userId === user.id)
    setStaffData(currentStaff || null)
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

  if (!mounted || !user || user.role !== "staff") {
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
          <ProfileAvatar userId={user.id} name={staffData ? `${staffData.firstName} ${staffData.lastName}` : user.username} />
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={staffData?.firstName || ""} disabled />
                </div>
                  <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={staffData?.lastName || ""} disabled />
              </div>
              <div>
                <Label htmlFor="nationalId">National ID Number</Label>
                <Input id="nationalId" value={staffData?.nationalId || ""} disabled />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={staffData?.email || ""} disabled />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={staffData?.phone || ""} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Username</Label>
                <Input value={user.username} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Input value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Changing Password..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
