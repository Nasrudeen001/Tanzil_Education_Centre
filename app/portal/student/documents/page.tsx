"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { storage } from "@/lib/storage"
import { OfficialDocument } from "@/lib/types"
import { Download, FileText, BookOpen, DollarSign, User } from "lucide-react"
import { toast } from "sonner"

export default function StudentDocumentsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [documents, setDocuments] = useState<OfficialDocument[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (!user || user.role !== "student") {
        router.push("/login")
        return
      }
      loadDocuments()
    }
  }, [user, router, mounted])

  const loadDocuments = () => {
    const allDocuments = storage.documents.getAll()
    // Only show active documents
    const activeDocuments = allDocuments.filter(doc => doc.isActive)
    setDocuments(activeDocuments)
  }

  const handleDownload = (document: OfficialDocument) => {
    try {
      // In a real application, you would trigger a download from the server
      // For this demo, we'll create a temporary link
      const link = document.createElement('a')
      link.href = document.fileUrl
      link.download = document.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Increment download count
      storage.documents.incrementDownloadCount(document.id)
      loadDocuments()
      toast.success("Download started")
    } catch (error) {
      toast.error("Failed to download document")
    }
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case "policy": return "bg-blue-100 text-blue-800"
      case "form": return "bg-green-100 text-green-800"
      case "guideline": return "bg-purple-100 text-purple-800"
      case "procedure": return "bg-orange-100 text-orange-800"
      case "certificate": return "bg-red-100 text-red-800"
      case "report": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || doc.documentType === selectedType
    return matchesSearch && matchesType
  })

  const menuItems = [
    { title: "Dashboard", href: "/student", icon: BookOpen },
    { title: "Academic Records", href: "/student/academics", icon: FileText },
    { title: "Fee Status", href: "/student/fees", icon: DollarSign },
    { title: "Assignments", href: "/student/assignments", icon: BookOpen },
    { title: "Profile", href: "/student/profile", icon: User },
  ]

  if (!mounted || !user || user.role !== "student") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout menuItems={menuItems} user={user || undefined} onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Official Documents</h2>
          <p className="text-muted-foreground">Access and download official school documents</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="guideline">Guideline</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No documents found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{document.title}</div>
                          {document.description && (
                            <div className="text-sm text-muted-foreground">{document.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDocumentTypeColor(document.documentType)}>
                          {document.documentType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <div>
                            <div className="text-sm font-medium">{document.fileName}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(document.fileSize)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {document.downloadCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(document.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 