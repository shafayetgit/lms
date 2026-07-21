"use client"

import { Box, Drawer, useTheme, alpha } from "@mui/material"

import React from "react"
import { usePathname } from "next/navigation"
import DrawerContent from "./DrawerContent"

export default function Sidebar({
  mobileOpen,
  handleDrawerToggle,
  drawerWidth,
  isMini,
  setIsMini,
}) {
  const theme = useTheme()
  const pathname = usePathname()

  return (
    <Box
      component="nav"
      sx={{
        width: { md: drawerWidth },
        flexShrink: { md: 0 },
        position: { md: "fixed" },
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: theme.zIndex.drawer,
      }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              width: 280, // fixed width for mobile
              bgcolor: "background.paper",
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundImage: "none",
              boxShadow: theme.shadows[8],
              borderRadius: 0,
            },
          },
        }}
      >
        <DrawerContent
          isMini={false}
          pathname={pathname}
          theme={theme}
          setIsMini={setIsMini}
          isMobile={true}
        />
      </Drawer>

      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            height: "100vh",
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            backgroundImage: "none",
            borderRadius: 0,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: "hidden",
            boxShadow: `4px 0 24px ${alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.2 : 0.02)}`,
          },
        }}
        open
      >
        <DrawerContent
          isMini={isMini}
          pathname={pathname}
          theme={theme}
          setIsMini={setIsMini}
          isMobile={false}
        />
      </Drawer>
    </Box>
  )
}
