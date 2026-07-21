"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Box, Typography, Menu, MenuItem, alpha } from "@mui/material"
import { KeyboardArrowDown as KeyboardArrowDownIcon } from "@mui/icons-material"
import { usePermissions } from "@/hooks/usePermissions"
import { getCookie } from "@/utils/shared"
import { getCurrentUser } from "@/lib/auth/client"
import { useGetMeQuery } from "@/features/user/userAPI"
import { useReadSettingsQuery } from "@/features/settings/settingsApi"

import Image from "next/image"

export default function ModuleSwitcher({ isMini, isMobile, pathname, theme }) {
  const [mounted, setMounted] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const { can, isSuperAdmin, hasFeatureFlag } = usePermissions()
  const router = useRouter()

  const { data: settingsData } = useReadSettingsQuery()
  const isDarkMode = theme.palette.mode === "dark"
  const dynamicShortLogo = isDarkMode
    ? settingsData?.site_short_logo_light || settingsData?.site_short_logo_dark
    : settingsData?.site_short_logo_dark || settingsData?.site_short_logo_light

  const defaultShortLogo = isDarkMode
    ? "/images/logo/ecofin-logo-light-short.png"
    : "/images/logo/ecofin-logo-dark-short.png"

  const shortLogoSrc = dynamicShortLogo
    ? dynamicShortLogo.startsWith("http")
      ? dynamicShortLogo
      : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${dynamicShortLogo.replace(/^\//, "")}`
    : defaultShortLogo

  const hasToken = mounted && !!getCookie("accessToken")
  const { data: meResponse } = useGetMeQuery(undefined, { skip: !hasToken })
  const activeUser = meResponse?.data || (mounted ? getCurrentUser() : null)
  const userUsername = activeUser?.username || activeUser?.sub || activeUser?.email || ""
  // gate on mounted to avoid SSR/client hydration mismatch
  const isStudent = mounted && activeUser?.role?.toLowerCase() === "student"

  const currentValue = pathname.startsWith("/settings")
    ? "settings"
    : pathname.startsWith("/academy")
      ? "academy"
      : pathname.startsWith("/core")
        ? "core"
        : "lms"

  useEffect(() => {
    let active = true
    setTimeout(() => {
      if (active) setMounted(true)
    }, 0)
    return () => {
      active = false
    }
  }, [])

  return (
    <Box
      sx={{
        px: isMini && !isMobile ? 1.5 : 2,
        py: 1.5,
        minHeight: { xs: 56, md: 64 },
        height: { xs: 56, md: 64 },
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Switcher Trigger Button */}
      <Box
        component="div"
        role="button"
        tabIndex={0}
        onClick={e => !isStudent && setAnchorEl(e.currentTarget)}
        onKeyDown={e => {
          if (!isStudent && (e.key === "Enter" || e.key === " ")) {
            setAnchorEl(e.currentTarget)
          }
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          p: isMini && !isMobile ? 0.5 : "6px 0px",
          borderRadius: "12px",
          cursor: isStudent ? "default" : "pointer",
          bgcolor: "transparent",
          border: "none",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            bgcolor: "transparent",
          },
          outline: "none",
        }}
      >
        {/* Active Module Icon Badge */}
        <Box
          sx={{
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Image
            src={shortLogoSrc}
            alt="LMS Logo"
            width={42}
            height={42}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            unoptimized
          />
        </Box>

        {/* Module Text & Role (only if not mini) */}
        {!(isMini && !isMobile) && (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                minWidth: 0,
                ml: 1.5,
                textAlign: "left",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "text.primary",
                  lineHeight: 1.2,
                }}
              >
                {currentValue === "settings"
                  ? "Settings"
                  : currentValue === "academy"
                    ? "Academy"
                    : currentValue === "core"
                      ? "Core"
                      : "LMS"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  mt: 0.25,
                  lineHeight: 1.2,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {mounted ? userUsername : ""}
              </Typography>
            </Box>

            {/* Chevron Down */}
            {!isStudent && (
              <KeyboardArrowDownIcon
                sx={{
                  color: "text.secondary",
                  fontSize: 18,
                  ml: 1,
                  transition: "transform 0.2s ease",
                  transform: anchorEl ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            )}
          </>
        )}
      </Box>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isMini && !isMobile ? "right" : "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: isMini && !isMobile ? "left" : "left",
        }}
        slotProps={{
          paper: {
            sx: {
              width: isMini && !isMobile ? 150 : anchorEl?.offsetWidth || "auto",
              mt: 1,
              bgcolor: "background.paper",
              borderRadius: "10px",
              border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
              p: 0.5,
            },
          },
        }}
      >
        {/* LMS Option */}
        {hasFeatureFlag("lms") && (
          <MenuItem
            selected={currentValue === "lms"}
            onClick={() => {
              setAnchorEl(null)
              router.push("/lms/dashboard")
            }}
            sx={{
              borderRadius: "6px",
              py: 1,
              px: 1.5,
              display: "flex",
              alignItems: "center",
              "&.Mui-selected": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                },
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              LMS
            </Typography>
          </MenuItem>
        )}

        {/* Academy Option */}
        {hasFeatureFlag("academy") && (
          <MenuItem
            selected={currentValue === "academy"}
            onClick={() => {
              setAnchorEl(null)
              router.push("/academy/dashboard")
            }}
            sx={{
              borderRadius: "6px",
              py: 1,
              px: 1.5,
              display: "flex",
              alignItems: "center",
              "&.Mui-selected": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                },
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Academy
            </Typography>
          </MenuItem>
        )}

        {/* Settings Option */}
        {hasFeatureFlag("settings") && (
          <MenuItem
            selected={currentValue === "settings"}
            onClick={() => {
              setAnchorEl(null)
              router.push("/settings/general")
            }}
            sx={{
              borderRadius: "6px",
              py: 1,
              px: 1.5,
              display: "flex",
              alignItems: "center",
              "&.Mui-selected": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                },
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Settings
            </Typography>
          </MenuItem>
        )}

        {/* Core Option */}
        {hasFeatureFlag("core") && (
          <MenuItem
            selected={currentValue === "core"}
            onClick={() => {
              setAnchorEl(null)
              router.push("/core/users")
            }}
            sx={{
              borderRadius: "6px",
              py: 1,
              px: 1.5,
              display: "flex",
              alignItems: "center",
              "&.Mui-selected": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                },
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Core
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </Box>
  )
}
