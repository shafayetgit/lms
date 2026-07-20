"use client"

import React, { useState, useEffect } from "react"
import usePermissions from "@/hooks/usePermissions"
import CPageLoader from "./CPageLoader"
import CError from "./CError"

export default function PermissionGuard({
  children,
  resource,
  action = "read",
  fallback = null,
  silent = false,
}) {
  const { can, isSuperAdmin, isLoading } = usePermissions()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let active = true
    setTimeout(() => {
      if (active) setMounted(true)
    }, 0)
    return () => {
      active = false
    }
  }, [])

  // Superadmins bypass all checks immediately
  if (mounted && isSuperAdmin) return <>{children}</>

  // Show loader until mounted and permissions are resolved
  if (!mounted || isLoading) {
    return <CPageLoader fullPage={false} />
  }

  const isAuthorized = can(resource, action)

  if (!isAuthorized) {
    if (silent) return null
    if (fallback) return fallback
    return (
      <CError
        title="Access Denied"
        message="You do not have permission to access this resource. Please contact your administrator if you believe this is an error."
        fullPage={false}
      />
    )
  }

  return <>{children}</>
}
