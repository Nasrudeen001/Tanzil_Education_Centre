"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StudentLoginRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/portal/login?portal=student")
  }, [router])
  return null
} 