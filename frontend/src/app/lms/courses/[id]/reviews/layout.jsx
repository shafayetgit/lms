"use client"

import React from "react"
import PermissionGuard from "@/components/ui/PermissionGuard"

export default function Layout({ children }) {
  return (
    <PermissionGuard resource="review" action="read">
      {children}
    </PermissionGuard>
  )
}
