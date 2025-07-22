"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { authenticateUser, getFromStorage } from "@/lib/storage"
import type { User, Staff, Student } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function PortalLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPortal, setSelectedPortal] = useState<"admin" | "staff" | "student">("admin")

  useEffect(() => {
    setMounted(true)
    // Pre-select portal from query param on mount
    const portalParam = searchParams?.get("portal")
    if (portalParam === "admin" || portalParam === "staff" || portalParam === "student") {
      setSelectedPortal(portalParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (mounted && user) {
      // Redirect based on role
      switch (user.role) {
        case "admin":
          router.push("/portal/admin")
          break
        case "staff":
          router.push("/portal/staff")
          break
        case "student":
          router.push("/portal/student")
          break
      }
    }
  }, [user, router, mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // First check if user exists with correct credentials
      const users = getFromStorage<User[]>("schoolmanagementsystem_users", [])
      const user = users.find((u: User) => u.username === username && u.password === password)
      
      if (!user) {
        setError("Invalid username or password")
        return
      }
      
      // Check if user is deactivated
      if (user.role === "staff") {
        const allStaff = getFromStorage<Staff[]>("schoolmanagementsystem_staff", [])
        const staffMember = allStaff.find((s: Staff) => s.userId === user.id)
        if (staffMember && staffMember.status === "inactive") {
          setError("Your account has been deactivated. Please contact the administrator.")
          return
        }
      } else if (user.role === "student") {
        const allStudents = getFromStorage<Student[]>("schoolmanagementsystem_students", [])
        const student = allStudents.find((s: Student) => s.userId === user.id)
        if (student && student.status === "inactive") {
          setError("Your account has been deactivated. Please contact the administrator.")
          return
        }
      }
      
      const authenticatedUser = authenticateUser(username, password)

      if (authenticatedUser) {
        login(authenticatedUser)
      } else {
        setError("Invalid username or password")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Markaz Tanzil Portal</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  {selectedPortal === "admin"
                    ? "Email"
                    : selectedPortal === "staff"
                    ? "Staff ID"
                    : "Admission Number"}
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    selectedPortal === "admin"
                      ? "Enter your email"
                      : selectedPortal === "staff"
                      ? "Enter your Staff ID"
                      : "Enter your Admission Number"
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 