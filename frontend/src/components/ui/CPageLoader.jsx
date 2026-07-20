"use client"
import React, { useState, useEffect } from "react"
import { Box, Typography, Stack, CircularProgress } from "@mui/material"

/**
 * CPageLoader Component
 * A lightweight, performant loading component.
 *
 * @param {boolean} fullPage - If true, covers the entire screen.
 * @param {string} label - Optional text to display below the loader.
 */
export default function CPageLoader({ fullPage = true, label = "Loading..." }) {
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

  if (!mounted) {
    return null
  }

  const loaderContent = (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={2.5}
      sx={{
        width: "100%",
        height: fullPage ? "100vh" : "100%",
        minHeight: fullPage ? "none" : "60vh",
        flexGrow: 1,
      }}
    >
      <CircularProgress size={36} thickness={4} disableShrink />

      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: "text.secondary",
          letterSpacing: 2,
          textTransform: "uppercase",
          opacity: 0.8,
        }}
      >
        {label}
      </Typography>
    </Stack>
  )

  if (fullPage) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          bgcolor: "background.paper",
        }}
      >
        {loaderContent}
      </Box>
    )
  }

  return loaderContent
}
