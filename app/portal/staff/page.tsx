"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, User, BookOpen } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Staff, Student, Class, Announcement } from "@/lib/types"
import { filterStudentsForStaff } from "@/lib/utils"



export default function StaffDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [staffData, setStaffData] = useState<Staff | null>(null)
  const [assignedClasses, setAssignedClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

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

    // Get staff data
    const allStaff = storage.staff.getAll()
    const currentStaff = allStaff.find((s) => s.userId === user.id)
    setStaffData(currentStaff || null)

    if (currentStaff) {
      // Get assigned classes
      const allClasses = storage.classes.getAll()
      const myClasses = allClasses.filter((c) => c.teacherId === currentStaff.id)
      setAssignedClasses(myClasses)

      // Get students in assigned classes - filter by category based on admission number codes
      const allStudents = storage.students.getAll()
      const myStudents = filterStudentsForStaff(allStudents, myClasses, currentStaff)
      setStudents(myStudents)
    }

    // Get relevant announcements
    const allAnnouncements = storage.announcements.getAll()
    const relevantAnnouncements = allAnnouncements.filter(
      (a) =>
        a.isActive &&
        (a.targetAudience === "all" ||
          a.targetAudience === "staff" ||
          (currentStaff?.category === "teaching" && a.targetAudience === "teaching_staff") ||
          (currentStaff?.category === "non_teaching" && a.targetAudience === "non_teaching_staff")),
    )
    setAnnouncements(relevantAnnouncements.slice(0, 5))
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
          <h2 className="text-3xl font-bold tracking-tight">Staff Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {staffData?.firstName} {staffData?.lastName}!
          </p>
        </div>

        {/* Only show Announcements for non-teaching staff, full dashboard for teaching */}
        {staffData?.category === "non_teaching" ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-blue-500 pl-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{announcement.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {announcement.content.substring(0, 100)}
                            {announcement.content.length > 100 ? "..." : ""}
                          </p>
                        </div>
                        <Badge
                          variant={
                            announcement.priority === "urgent"
                              ? "destructive"
                              : announcement.priority === "high"
                                ? "default"
                                : "secondary"
                          }
                          className="ml-2"
                        >
                          {announcement.priority}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No announcements available.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assigned Classes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignedClasses.length}</div>
                  <p className="text-xs text-muted-foreground">Classes you teach</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Students</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{students.length}</div>
                  <p className="text-xs text-muted-foreground">Students in your classes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Staff Category</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge variant={staffData?.category === "teaching" ? "default" : "secondary"}>
                      {staffData?.category === "teaching" ? "Teaching" : "Non-Teaching"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Your role category</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  {assignedClasses.length > 0 ? (
                    <div className="space-y-2">
                      {assignedClasses.map((classItem) => (
                        <div key={classItem.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <div className="font-medium">{classItem.className}</div>
                            <div className="text-sm text-muted-foreground">
                              {classItem.category.charAt(0).toUpperCase() + classItem.category.slice(1)} -{" "}
                              {classItem.academicYear}
                            </div>
                          </div>
                          <Badge
                            variant={
                              classItem.category === "tahfidh"
                                ? "default"
                                : classItem.category === "integrated"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {classItem.category}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No classes assigned yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  {announcements.length > 0 ? (
                    <div className="space-y-3">
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="border-l-4 border-blue-500 pl-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{announcement.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {announcement.content.substring(0, 100)}
                                {announcement.content.length > 100 ? "..." : ""}
                              </p>
                            </div>
                            <Badge
                              variant={
                                announcement.priority === "urgent"
                                  ? "destructive"
                                  : announcement.priority === "high"
                                    ? "default"
                                    : "secondary"
                              }
                              className="ml-2"
                            >
                              {announcement.priority}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {new Date(announcement.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No announcements available.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
