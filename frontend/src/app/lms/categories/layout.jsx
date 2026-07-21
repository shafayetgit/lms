"use client"

import React from "react"
import PermissionGuard from "@/components/ui/PermissionGuard"

export default function Layout({ children }) {
  return (
    <PermissionGuard resource="category" action="read">
      {children}
    </PermissionGuard>
  )
}
