"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RedirectToGeneralSettings() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/settings/general")
  }, [router])

  return null
}
