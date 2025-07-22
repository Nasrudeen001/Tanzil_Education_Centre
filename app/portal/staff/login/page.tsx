"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StaffLoginRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/portal/login?portal=staff")
  }, [router])
  return null
} 