"use client"

import React, { useState, useEffect } from "react"
import { LogOut, User, Menu, X, PanelLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getMenuItems, type MenuItem } from "@/lib/menu-config"
import { storage } from "@/lib/storage"
import ProfileAvatar from "@/components/profile-avatar"

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: {
    id?: string
    username?: string
    role?: string
    firstName?: string
    lastName?: string
  }
  onLogout: () => void
}

// Helper to get display name
function getDisplayName(user: any) {
  if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`
  return user?.username || "User"
}

export default function DashboardLayout({ children, user, onLogout }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)
  const pathname = usePathname()
  const [staffCategory, setStaffCategory] = useState<string | undefined>(undefined)
  
  // Get staff category if user is staff
  useEffect(() => {
    if (user?.role === "staff" && user?.id) {
      const allStaff = storage.staff.getAll()
      const currentStaff = allStaff.find((s) => s.userId === user.id)
      setStaffCategory(currentStaff?.category)
    }
  }, [user])
  
  // Generate menu items based on user role and staff category
  const menuItems = getMenuItems(user?.role || "", staffCategory)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md"
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-gray-900 text-white transform transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${
          isSidebarMinimized ? "lg:w-16" : "w-64"
        }`}
      >
        {/* Minimize/Expand Toggle Button (Desktop Only) */}
        <div className="hidden lg:flex justify-end p-2">
          <button
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="flex items-center justify-center w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors duration-200"
            title={isSidebarMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
          >
            <PanelLeft className="h-5 w-5 text-white" />
          </button>
        </div>
        {/* Header */}
        <div className={`p-6 border-b border-gray-800 ${isSidebarMinimized ? "lg:p-2" : ""}`}>
          <div className={`flex items-center space-x-3 ${isSidebarMinimized ? "lg:justify-center" : ""}`}>
            <ProfileAvatar userId={user?.id || "sidebar"} name={getDisplayName(user)} size={40} readonly={true} />
            {!isSidebarMinimized && (
              <div>
                <p className="font-semibold text-white text-sm max-w-[140px] truncate" title={user?.username}>{user?.username || "User"}</p>
                <p className="text-sm text-gray-400 capitalize">{user?.role || "Portal"}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 p-4 ${isSidebarMinimized ? "lg:p-2" : ""}`}>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive 
                        ? "text-white bg-gray-800" 
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    } ${isSidebarMinimized ? "lg:justify-center lg:px-2" : ""}`}
                    onClick={() => setIsSidebarOpen(false)}
                    title={isSidebarMinimized ? item.title : undefined}
                  >
                    <item.icon className="h-5 w-5" />
                    {!isSidebarMinimized && (
                      <span className="font-medium">{item.title}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className={`p-4 border-t border-gray-800 ${isSidebarMinimized ? "lg:p-2" : ""}`}>
          <button
            onClick={onLogout}
            className={`flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors duration-200 ${
              isSidebarMinimized ? "lg:justify-center lg:px-2" : ""
            }`}
            title={isSidebarMinimized ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5" />
            {!isSidebarMinimized && (
              <span className="font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className={`flex-1 ${isSidebarMinimized ? "lg:ml-16" : "lg:ml-0"}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="lg:ml-0 ml-12">
                <h1 className="text-2xl font-bold text-gray-900">School Management System</h1>
                <p className="text-sm text-gray-600 capitalize">{user?.role || "Dashboard"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ProfileAvatar userId={user?.id || "header"} name={getDisplayName(user)} size={40} readonly={true} />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
