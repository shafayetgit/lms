"use client"

import React from "react"
import Image from "next/image"
import { Box, useTheme } from "@mui/material"
import { useReadSettingsQuery } from "@/features/settings/settingsApi"

export default function AuthLogo() {
  const theme = useTheme()
  const { data: settingsData } = useReadSettingsQuery()
  const isDarkMode = theme.palette.mode === "dark"

  // Resolve settings data from response format: { success: true, data: { ... } }
  const settings = settingsData?.data || settingsData

  const dynamicLogo = isDarkMode
    ? settings?.site_logo_light || settings?.site_logo_dark
    : settings?.site_logo_dark || settings?.site_logo_light

  const defaultLogo = isDarkMode
    ? "/images/logo/ecofin-light-logo.png"
    : "/images/logo/ecofin-dark-logo.png"

  const logoSrc = dynamicLogo
    ? dynamicLogo.startsWith("http")
      ? dynamicLogo
      : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${dynamicLogo.replace(/^\//, "")}`
    : defaultLogo

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
      <Box
        sx={{
          width: 120,
          height: 44,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Image src={logoSrc} alt="Auth Logo" fill priority style={{ objectFit: "contain" }} />
      </Box>
    </Box>
  )
}
