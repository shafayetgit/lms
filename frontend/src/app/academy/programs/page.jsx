"use client"

import React from "react"
import { Typography, Box } from "@mui/material"
import PermissionGuard from "@/components/ui/PermissionGuard"

export default function Page() {
  return (
    <PermissionGuard resource="program" action="read">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
          Academy Programs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your academy programs here.
        </Typography>
      </Box>
    </PermissionGuard>
  )
}
