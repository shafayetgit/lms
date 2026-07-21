"use client"

import React, { Fragment, useState, useEffect } from "react"
import Link from "next/link"
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Box,
  alpha,
} from "@mui/material"
import { usePermissions } from "@/hooks/usePermissions"
import { ROUTES } from "@/lib/constants/routes"
import { lmsMenuItems, settingsMenuItems, academyMenuItems, coreMenuItems } from "../navigation"

export default function NavigationList({ isMini, isMobile, pathname, theme }) {
  const [mounted, setMounted] = useState(false)
  const { can } = usePermissions()

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

  const itemsSource =
    currentValue === "settings"
      ? settingsMenuItems
      : currentValue === "academy"
        ? academyMenuItems
        : currentValue === "core"
          ? coreMenuItems
          : lmsMenuItems

  const filteredItems = mounted
    ? itemsSource.filter(item => {
        if (!item.resource) return true
        return can(item.resource, item.action || "read")
      })
    : []

  return (
    <List
      sx={{
        px: isMini && !isMobile ? 1.5 : 2,
        py: 2,
        flexGrow: 1,
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: alpha(theme.palette.text.secondary, 0.2),
          borderRadius: "4px",
        },
      }}
    >
      {filteredItems.map((item, index) => {
        const isActive =
          item.path === ROUTES.admin.dashboard.path
            ? pathname === item.path
            : pathname === item.path || (item.path !== "/" && pathname?.startsWith(item.path + "/"))

        const prevItem = index > 0 ? filteredItems[index - 1] : null
        const showGroup = item.group && item.group !== prevItem?.group

        return (
          <Fragment key={item.path}>
            {showGroup && !isMini && !isMobile && (
              <Typography
                variant="caption"
                sx={{
                  px: 0.5,
                  pt: index === 0 ? 0.5 : 2,
                  pb: 1,
                  display: "block",
                  color: "text.disabled",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontSize: "0.65rem",
                }}
              >
                {item.group}
              </Typography>
            )}
            {showGroup && isMini && !isMobile && <Box sx={{ height: index === 0 ? 4 : 16 }} />}

            <ListItem
              disablePadding
              sx={{ mb: 0, justifyContent: isMini && !isMobile ? "center" : "flex-start" }}
            >
              <Tooltip title={isMini && !isMobile ? item.title : ""} placement="right" arrow>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  aria-current={isActive ? "page" : undefined}
                  suppressHydrationWarning
                  sx={{
                    borderRadius: "8px",
                    py: 1,
                    px: isMini && !isMobile ? 0 : 0.5,
                    minHeight: 42,
                    width: isMini && !isMobile ? 48 : "100%",
                    maxWidth: isMini && !isMobile ? 48 : "100%",
                    flexGrow: isMini && !isMobile ? 0 : 1,
                    mx: "auto",
                    justifyContent: isMini && !isMobile ? "center" : "flex-start",
                    transition: "all 0.2s ease-in-out",

                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : "transparent",
                    color: isActive ? "primary.main" : "text.secondary",

                    "&:hover": {
                      bgcolor: isActive
                        ? alpha(theme.palette.primary.main, 0.15)
                        : alpha(theme.palette.action.hover, 0.5),
                      color: isActive ? "primary.main" : "text.primary",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "inherit",
                      minWidth: isMini && !isMobile ? 0 : 40,
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.title}
                    sx={{
                      display: isMini && !isMobile ? "none" : "block",
                      m: 0,
                    }}
                    slotProps={{
                      primary: {
                        fontWeight: isActive ? 600 : 500,
                        fontSize: "0.875rem",
                        letterSpacing: "0.3px",
                      },
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </Fragment>
        )
      })}
    </List>
  )
}
