"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SwipeableDrawer, Box, Stack, Typography, alpha } from "@mui/material"
import { motion } from "framer-motion"
import Image from "next/image"
import { Home, MenuBook, LibraryBooks, Info, ContactSupport } from "@mui/icons-material"

const navItems = [
  { label: "Home", url: "/", icon: Home },
  { label: "Courses", url: "/courses", icon: MenuBook },
  { label: "E-Books", url: "/ebooks", icon: LibraryBooks },
  { label: "About", url: "/about", icon: Info },
  { label: "Contact", url: "/contact", icon: ContactSupport },
]

export default function MobileDrawer({ mobileOpen, handleDrawerToggle, logoSrc }) {
  const pathname = usePathname()

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        bgcolor: "transparent",
        backgroundImage: theme =>
          `linear-gradient(${alpha(theme.palette.divider, 0.04)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(theme.palette.divider, 0.04)} 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        position: "relative",
      }}
    >
      {/* Minimalist Premium Header */}
      <Box sx={{ px: 3, pb: 4, display: "flex", justifyContent: "center" }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Box
            onClick={handleDrawerToggle}
            sx={{ cursor: "pointer", display: "inline-block" }}
            role="button"
            aria-label="close drawer"
            tabIndex={0}
          >
            <Image
              src={logoSrc}
              alt="Logo"
              width={160}
              height={56}
              priority
              style={{ width: "auto", height: "56px", objectFit: "contain" }}
            />
          </Box>
        </motion.div>
      </Box>

      {/* Refined Navigation Links */}
      <Box sx={{ px: 2, overflowY: "auto" }}>
        <Stack spacing={3.5} alignItems="center">
          {navItems.map((item, index) => {
            const isActive = pathname === item.url
            return (
              <Box
                key={index}
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 24,
                }}
              >
                <Box
                  component={Link}
                  href={item.url}
                  onClick={handleDrawerToggle}
                  sx={{
                    display: "block",
                    textDecoration: "none",
                    color: isActive ? "text.primary" : "text.secondary",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "text.primary",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "1.75rem",
                      textAlign: "center",
                      letterSpacing: "-0.02em",
                      color: "inherit",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Stack>
      </Box>
    </Box>
  )

  return (
    <SwipeableDrawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      onOpen={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          backdropFilter: "blur(24px)",
          backgroundColor: theme => alpha(theme.palette.background.paper, 0.75),
          boxShadow: "none",
          borderRadius: 0,
        },
      }}
      sx={{ display: { xs: "block", md: "none" } }}
    >
      <Box
        sx={{
          width: { xs: "100vw", sm: 400 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {drawerContent}
      </Box>
    </SwipeableDrawer>
  )
}
