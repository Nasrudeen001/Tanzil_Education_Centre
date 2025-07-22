"use client"

import React, { useEffect, useState } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { storage, getCurrentUser } from "@/lib/storage"
import type { Class, Staff, ClassStaffAssignment } from "@/lib/types"

export default function MyClassPage() {
  const [loading, setLoading] = useState(true)
  const [assignedClasses, setAssignedClasses] = useState<Class[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)

  useEffect(() => {
    // Fetch all necessary data from storage
    const user = getCurrentUser()
    if (!user || user.role !== "staff") {
      setLoading(false)
      return
    }
    const allStaff: Staff[] = storage.staff.getAll()
    const staff = allStaff.find((s) => s.userId === user.id)
    if (!staff) {
      setLoading(false)
      return
    }
    const assignments: ClassStaffAssignment[] = storage.classStaffAssignments.getByStaffId(staff.id)
    // Only consider assignments where staff is incharge/main teacher
    const inchargeAssignments = assignments.filter((a) => a.role === "incharge")
    const allClasses: Class[] = storage.classes.getAll()
    const classes = inchargeAssignments
      .map((a) => allClasses.find((c) => c.id === a.classId))
      .filter((c): c is Class => !!c)
    setAssignedClasses(classes)
    if (classes.length > 0) {
      setSelectedClassId(classes[0].id)
      setSelectedClass(classes[0])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!selectedClassId) {
      setSelectedClass(null)
      return
    }
    const found = assignedClasses.find((c) => c.id === selectedClassId) || null
    setSelectedClass(found)
  }, [selectedClassId, assignedClasses])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg">Loading...</span>
      </div>
    )
  }

  if (assignedClasses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">You are not assigned as incharge to any class.</h1>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-2xl font-bold mb-4">My Classes</h1>
      {assignedClasses.length > 1 && (
        <div className="w-72">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {assignedClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.className} ({cls.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {selectedClass && (
        <div className="border rounded-lg p-6 shadow w-full max-w-xl bg-white">
          <h2 className="text-xl font-semibold mb-2">{selectedClass.className}</h2>
          <p className="mb-1">Category: <span className="font-medium">{selectedClass.category}</span></p>
          <p className="mb-1">Academic Year: <span className="font-medium">{selectedClass.academicYear}</span></p>
          {/* Add more class details or actions here as needed */}
        </div>
      )}
    </div>
  )
} 