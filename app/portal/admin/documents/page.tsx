"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { storage } from "@/lib/storage"
import { OfficialDocument } from "@/lib/types"
import { Upload, Download, Edit, Trash2, FileText, Plus, Search } from "lucide-react"
import { toast } from "sonner"

export default function DocumentsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [documents, setDocuments] = useState<OfficialDocument[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<OfficialDocument | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    documentType: "policy" as const,
    file: null as File | null,
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
      loadDocuments()
    }
  }, [user, router, mounted])

  const loadDocuments = () => {
    const allDocuments = storage.documents.getAll()
    setDocuments(allDocuments)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, file }))
    }
  }

  const handleUpload = async () => {
    if (!formData.title || !formData.file) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      // In a real application, you would upload the file to a cloud storage service
      // For this demo, we'll create a mock file URL
      const fileUrl = URL.createObjectURL(formData.file)
      
      const newDocument: OfficialDocument = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        documentType: formData.documentType,
        fileName: formData.file.name,
        fileUrl: fileUrl,
        fileSize: formData.file.size,
        mimeType: formData.file.type,
        uploadedBy: user?.id || "",
        isActive: true,
        downloadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      storage.documents.add(newDocument)
      loadDocuments()
      setIsUploadDialogOpen(false)
      setFormData({
        title: "",
        description: "",
        documentType: "policy",
        file: null,
      })
      toast.success("Document uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload document")
    }
  }

  const handleEdit = (document: OfficialDocument) => {
    setEditingDocument(document)
    setFormData({
      title: document.title,
      description: document.description || "",
      documentType: document.documentType,
      file: null,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!editingDocument || !formData.title) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      storage.documents.update(editingDocument.id, {
        title: formData.title,
        description: formData.description,
        documentType: formData.documentType,
        updatedAt: new Date().toISOString(),
      })
      loadDocuments()
      setIsEditDialogOpen(false)
      setEditingDocument(null)
      setFormData({
        title: "",
        description: "",
        documentType: "policy",
        file: null,
      })
      toast.success("Document updated successfully")
    } catch (error) {
      toast.error("Failed to update document")
    }
  }

  const handleDelete = (documentId: string) => {
    try {
      storage.documents.delete(documentId)
      loadDocuments()
      toast.success("Document deleted successfully")
    } catch (error) {
      toast.error("Failed to delete document")
    }
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
            <h2 className="text-3xl font-bold tracking-tight">Official Documents</h2>
            <p className="text-muted-foreground">Manage and organize official school documents</p>
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Document Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter document title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter document description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="documentType">Document Type *</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, documentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
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
                <div className="grid gap-2">
                  <Label htmlFor="file">File *</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload}>Upload</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Management</CardTitle>
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
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(document)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(document)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{document.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(document.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Document</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Document Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter document title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter document description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-documentType">Document Type *</Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, documentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
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
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Update</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
} 