"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/types"
import { getCurrentUser, setCurrentUser, initializeDefaultData } from "@/lib/storage"
import { createSampleData } from "@/lib/sample-data"

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Initialize default data on first load
      initializeDefaultData()

      // Create sample data for testing
      createSampleData()

      // Get current user from storage
      const currentUser = getCurrentUser()
      setUser(currentUser)
      setIsLoading(false)
    }
  }, [mounted])

  const login = (user: User) => {
    setUser(user)
    setCurrentUser(user)
  }

  const logout = () => {
    setUser(null)
    setCurrentUser(null)
    // Clear any other session-related data if needed
    localStorage.removeItem("schoolmanagementsystem_current_user")
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
