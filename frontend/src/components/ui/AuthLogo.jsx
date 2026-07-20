"use client";

import React from "react";
import { Box, useTheme } from "@mui/material";
import { useReadSettingsQuery } from "@/features/settings/settingsApi";

export default function AuthLogo() {
  const theme = useTheme();
  const { data: settingsData } = useReadSettingsQuery();
  const isDarkMode = theme.palette.mode === "dark";

  // Resolve settings data from response format: { success: true, data: { ... } }
  const settings = settingsData?.data || settingsData;

  // Priority list for auth pages (which usually need short logo first, then full logo)
  const dynamicLogo = isDarkMode
    ? (settings?.site_short_logo_light || settings?.site_short_logo_dark || settings?.site_logo_light || settings?.site_logo_dark)
    : (settings?.site_short_logo_dark || settings?.site_short_logo_light || settings?.site_logo_dark || settings?.site_logo_light);

  const defaultLogo = "/images/ecofin-logo-circle.png";

  const logoSrc = dynamicLogo
    ? (dynamicLogo.startsWith("http") ? dynamicLogo : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${dynamicLogo.replace(/^\//, "")}`)
    : defaultLogo;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 1,
          bgcolor: isDarkMode && logoSrc === defaultLogo ? "common.white" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: isDarkMode && logoSrc === defaultLogo ? 0.5 : 0,
        }}
      >
        <Box
          component="img"
          src={logoSrc}
          alt="Logo"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </Box>
    </Box>
  );
}
