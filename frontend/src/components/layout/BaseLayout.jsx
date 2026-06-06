"use client"

import { useState, useEffect } from "react"
import { Box, Typography } from "@mui/material"
import { usePathname } from "next/navigation"

const drawerWidth = 280
const miniDrawerWidth = 88

function BaseLayout({ children, sidebar: Sidebar, topbar: Topbar }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMini, setIsMini] = useState(false)
  const pathname = usePathname()

  const currentDrawerWidth = isMini ? miniDrawerWidth : drawerWidth

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <Box
      sx={{ width: "100%", minHeight: "100vh", bgcolor: "transparent", position: "relative", overflowX: "hidden" }}
    >
      <Box
        sx={{ width: "100%", display: "flex", minHeight: "100vh", bgcolor: "transparent", position: "relative" }}
      >
        {Sidebar && (
          <Sidebar
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
            drawerWidth={currentDrawerWidth}
            isMini={isMini}
            setIsMini={setIsMini}
          />
        )}
        {Topbar && (
          <Topbar
            handleDrawerToggle={handleDrawerToggle}
            drawerWidth={currentDrawerWidth}
            isMini={isMini}
          />
        )}

        <Box
          component="main"
          sx={{
            width: { xs: "100%", md: `calc(100% - ${currentDrawerWidth + 48 + 20}px)` },
            flexShrink: 0, // Prevent flexbox from shrinking it
            display: "flex",
            flexDirection: "column",
            px: { xs: 1, md: 0 },
            pt: { xs: 2, md: 3 },
            pb: 4,
            ml: { md: "44px" },
            mt: { xs: "64px", md: "100px" },
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            minHeight: "100vh",
            position: "relative",
            zIndex: 1,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
export default BaseLayout
