"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function PortalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // If a portal param is present, redirect to the correct login page
    const portal = searchParams.get("portal")
    if (portal === "admin" || portal === "staff" || portal === "student") {
      router.replace(`/portal/login?portal=${portal}`)
    } else {
      // If no portal param, just go to generic login
      router.replace("/portal/login")
    }
  }, [router, searchParams])

  return null
} 