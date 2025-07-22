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
import { Switch } from "@/components/ui/switch"
import { Users, GraduationCap, DollarSign, Bell, BookOpen, User, Plus, Edit, Trash2, Pen } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Announcement } from "@/lib/types"



export default function AnnouncementManagement() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "all" as Announcement["targetAudience"],
    priority: "normal" as Announcement["priority"],
    isActive: true,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (!user || user.role !== "admin") {
        router.push("/login")
        return
      }
      loadAnnouncements()
    }
  }, [user, router, mounted])

  const loadAnnouncements = () => {
    const allAnnouncements = storage.announcements.getAll()
    setAnnouncements(allAnnouncements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingAnnouncement) {
      // Update existing announcement
      const updatedAnnouncement: Announcement = {
        ...editingAnnouncement,
        ...formData,

      }
      storage.announcements.update(editingAnnouncement.id, updatedAnnouncement)
    } else {
      // Create new announcement
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...formData,
        createdBy: user!.id,
        createdAt: new Date().toISOString(),
      }
      storage.announcements.add(newAnnouncement)
    }

    loadAnnouncements()
    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      targetAudience: announcement.targetAudience,
      priority: announcement.priority,
      isActive: announcement.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (announcement: Announcement) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      storage.announcements.delete(announcement.id)
      loadAnnouncements()
    }
  }

  const toggleActive = (announcement: Announcement) => {
    const updatedAnnouncement: Announcement = {
      ...announcement,
      isActive: !announcement.isActive,
      
    }
    storage.announcements.update(announcement.id, updatedAnnouncement)
    loadAnnouncements()
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      targetAudience: "all",
      priority: "normal",
      isActive: true,
    })
    setEditingAnnouncement(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "default"
      case "normal":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case "all":
        return "All Users"
      case "staff":
        return "All Staff"
      case "students":
        return "All Students"
      case "tahfidh":
        return "Tahfidh Students"
      case "integrated":
        return "Integrated Students"
      case "talim":
        return "Ta'lim Students"
      case "teaching_staff":
        return "Teaching Staff"
      case "non_teaching_staff":
        return "Non-Teaching Staff"
      default:
        return audience
    }
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
            <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
            <p className="text-muted-foreground">Send announcements to staff and students</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Announcement title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Announcement content"
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Select
                      value={formData.targetAudience}
                      onValueChange={(value: Announcement["targetAudience"]) =>
                        setFormData({ ...formData, targetAudience: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="staff">All Staff</SelectItem>
                        <SelectItem value="students">All Students</SelectItem>
                        <SelectItem value="tahfidh">Tahfidh Students</SelectItem>
                        <SelectItem value="integrated">Integrated Students</SelectItem>
                        <SelectItem value="talim">Ta'lim Students</SelectItem>
                        <SelectItem value="teaching_staff">Teaching Staff</SelectItem>
                        <SelectItem value="non_teaching_staff">Non-Teaching Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: Announcement["priority"]) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingAnnouncement ? "Update Announcement" : "Create Announcement"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Target Audience</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>{getAudienceLabel(announcement.targetAudience)}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(announcement.priority)}>
                        {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={announcement.isActive ? "default" : "secondary"}>
                        {announcement.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(announcement.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => toggleActive(announcement)}>
                          {announcement.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(announcement)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(announcement)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {announcements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No announcements found. Create your first announcement to get started.
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
