"use client"
import React from "react"
import { Box, Divider, Stack, Button, alpha, useTheme } from "@mui/material"
import { usePathname } from "next/navigation"
import Link from "next/link"
import CHelpSidebar from "./CHelpSidebar"
import usePermissions from "@/hooks/usePermissions"

export default function CModuleLayout({ children, navigators, helpTips, Navigation, HelpSidebar }) {
  const pathname = usePathname()
  const theme = useTheme()
  const { can, isSuperAdmin } = usePermissions()

  const visibleNavigators = React.useMemo(() => {
    if (!navigators) return []
    return navigators
      .map(item => ({
        ...item,
        href: item.href || item.path,
        label: item.label || item.name,
      }))
      .filter(item => {
        if (!item || !item.href) return false
        if (!item.resource) return true
        return isSuperAdmin || can(item.resource, item.action || "read")
      })
  }, [navigators, can, isSuperAdmin])

  const renderNavigation = () => {
    if (Navigation) return Navigation
    if (!visibleNavigators || visibleNavigators.length === 0) return null

    return (
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        <Stack
          direction="row"
          spacing={0}
          justifyContent="flex-start"
          alignItems="center"
          sx={{
            width: "100%",
            borderBottom: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.1),
          }}
        >
          {visibleNavigators.map((item, index) => {
            // Find the most specific (longest) href that matches the current pathname
            const activeItem = [...visibleNavigators]
              .sort((a, b) => (b?.href?.length || 0) - (a?.href?.length || 0))
              .find(
                nav => nav?.href && (pathname === nav.href || pathname.startsWith(nav.href + "/"))
              )

            const isStrictActive = activeItem ? activeItem.href === item.href : false

            return (
              <Button
                key={index}
                component={Link}
                href={item.href}
                target={item.target}
                startIcon={item.icon}
                sx={{
                  px: 0,
                  mr: { xs: 3, sm: 4 },
                  pb: 1,
                  borderRadius: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: isStrictActive ? 700 : 500,
                  fontSize: "0.75rem",
                  color: isStrictActive ? "primary.main" : "text.secondary",
                  bgcolor: "transparent",
                  borderBottom: "2px solid",
                  borderColor: isStrictActive ? "primary.main" : "transparent",
                  justifyContent: "flex-start",
                  transition: "all 0.2s ease-in-out",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    color: "primary.main",
                    borderColor: isStrictActive
                      ? "primary.main"
                      : alpha(theme.palette.primary.main, 0.3),
                  },
                  "& .MuiButton-startIcon": {
                    mr: 1,
                    ml: 0,
                    transition: "transform 0.2s ease",
                  },
                  "&:hover .MuiButton-startIcon": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </Stack>
      </Box>
    )
  }

  const renderHelpSidebar = () => {
    if (HelpSidebar) return HelpSidebar
    if (!helpTips) return null
    return <CHelpSidebar description={helpTips.description} tips={helpTips.tips} />
  }

  const renderedNav = renderNavigation()
  const renderedSidebar = renderHelpSidebar()

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        minHeight: "calc(100vh - 100px)",
      }}
    >
      {renderedNav}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "stretch",
          flexGrow: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, py: 2, pr: { md: renderedSidebar ? 3 : 0 } }}>
          {children}
        </Box>

        {renderedSidebar && (
          <>
            <Divider sx={{ display: { xs: "block", md: "none" } }} />
            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: "none", md: "block" } }}
            />

            <Box sx={{ width: { xs: "100%", md: "320px" }, flexShrink: 0, py: 2, pl: { md: 3 } }}>
              {renderedSidebar}
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
