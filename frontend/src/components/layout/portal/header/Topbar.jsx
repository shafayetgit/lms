"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AppBar,
  Toolbar,
  Drawer,
  SwipeableDrawer,
  Box,
  Divider,
  Container,
  Stack,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  alpha,
  Tooltip,
  Badge,
} from "@mui/material"
import {
  MenuOpen,
  Close,
  PersonAdd,
  PersonOutline,
  Login,
  AccountCircle,
  Home,
  MenuBook,
  Info,
  ChevronRight,
  LibraryBooks,
  ContactSupport,
  LightModeOutlined,
  DarkModeOutlined,
  NotificationsNoneOutlined,
} from "@mui/icons-material"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { toggleTheme } from "@/features/app/appSlice"

import CButton from "@/components/ui/CButton"
import CartDrawer from "./partials/CartDrawer"
import Navigation from "./partials/Navigation"
import AccountMenu from "@/components/ui/AccountMenu"
import AuthMenu from "./partials/AuthMenu"
import MobileDrawer from "./partials/MobileDrawer"
import SignOut from "./partials/SignOut"
import { LOGO, LOGO_HEIGHT, LOGO_WIDTH } from "@/lib/constants"
import { getCurrentUser, getProfileUser } from "@/lib/auth/client"
import Image from "next/image"
import { useReadSettingsQuery } from "@/features/settings/settingsApi"
import { useReadNotificationsQuery } from "@/features/notification/notificationApi"
import NotificationDrawer from "@/components/layout/lms/parts/NotificationDrawer"
import { useTheme } from "@mui/material"

import { useGetMeQuery } from "@/features/user/userAPI"
import { getCookie } from "@/utils/shared"
import { usePermissions } from "@/hooks/usePermissions"

const navItems = [
  { label: "Home", url: "/", icon: Home },
  { label: "Courses", url: "/courses", icon: MenuBook },
  { label: "E-Books", url: "/ebooks", icon: LibraryBooks },
  { label: "About", url: "/about", icon: Info },
  { label: "Contact", url: "/contact", icon: ContactSupport },
]

export default function Topbar({ dynamicColor }) {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const mode = useSelector(state => state.app?.mode || "light")
  const theme = useTheme()

  const { data: settingsData } = useReadSettingsQuery()
  const isDarkMode = theme.palette.mode === "dark"
  const dynamicLogo = isDarkMode
    ? settingsData?.site_logo_light || settingsData?.site_logo_dark
    : settingsData?.site_logo_dark || settingsData?.site_logo_light

  const defaultLogo = isDarkMode
    ? "/images/logo/ecofin-light-logo.png"
    : "/images/logo/ecofin-dark-logo.png"

  const logoSrc = dynamicLogo
    ? dynamicLogo.startsWith("http")
      ? dynamicLogo
      : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${dynamicLogo.replace(/^\//, "")}`
    : defaultLogo

  const [mobileOpen, setMobileOpen] = useState(false)
  const handleDrawerToggle = () => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50)
    }
    setMobileOpen(prev => !prev)
  }

  // Hydration-safe auth state
  const [mounted, setMounted] = useState(false)

  const hasToken = typeof window !== "undefined" && !!getCookie("accessToken")
  const { data: meResponse } = useGetMeQuery(undefined, { skip: !hasToken })
  const user = meResponse?.data || getCurrentUser()
  const { isSuperAdmin } = usePermissions()

  const [notifOpen, setNotifOpen] = useState(false)
  const { data: notificationsData } = useReadNotificationsQuery(
    { page: 1, size: 50 },
    { skip: !hasToken }
  )
  const notifications = notificationsData?.data || []
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    let active = true
    setTimeout(() => {
      if (active) setMounted(true)
    }, 0)
    return () => {
      active = false
    }
  }, [])

  // Auth Menu State
  const [anchorElAuth, setAnchorElAuth] = useState(null)
  const authMenuOpen = Boolean(anchorElAuth)
  const handleAuthMenuClick = event => setAnchorElAuth(event.currentTarget)
  const handleAuthMenuClose = () => setAnchorElAuth(null)

  return (
    <AppBar
      component="nav"
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backgroundColor: "background.default",
        borderBottom: "none",
        top: 0,
        transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
        zIndex: theme => theme.zIndex.appBar,
      }}
    >
      <Container maxWidth="lg" disableGutters sx={{ px: { xs: 1, md: 2 } }}>
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 64 }, height: { xs: 56, md: 64 } }}>
          <Stack direction="row" alignItems="center" flexGrow={1}>
            {/* Desktop Logo */}
            <Box
              component={Link}
              href="/"
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                color: "text.primary",
                fontWeight: 600,
                fontSize: "1.25rem",
                letterSpacing: 0.5,
                textTransform: "capitalize",
                cursor: "pointer",
                userSelect: "none",
                textDecoration: "none",
              }}
            >
              <Image
                src={logoSrc}
                alt="Logo"
                width={120}
                height={44}
                priority
                style={{ width: "auto", height: "40px", objectFit: "contain" }}
              />
            </Box>

            {/* Mobile Logo / Drawer Toggle */}
            <Box
              onClick={handleDrawerToggle}
              sx={{
                display: { xs: "flex", md: "none" },
                alignItems: "center",
                cursor: "pointer",
                p: 0.5,
                ml: -0.5,
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
              role="button"
              aria-label="open drawer"
              tabIndex={0}
            >
              <Image
                src={logoSrc}
                alt="Logo"
                width={120}
                height={44}
                priority
                style={{ width: "auto", height: "40px", objectFit: "contain" }}
              />
            </Box>
          </Stack>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, mx: 1, display: { xs: "none", md: "block" } }}>
            <Navigation />
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Cart */}
          {/* <CartDrawer /> */}
          {/* Universal Topbar Profile Action */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
            {mounted && user ? (
              <>
                <Tooltip title="Notifications">
                  <IconButton
                    onClick={() => setNotifOpen(true)}
                    size="small"
                    sx={{
                      color: "text.secondary",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "50%",
                      p: 0.75,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        color: "primary.main",
                        bgcolor: theme => alpha(theme.palette.primary.main, 0.08),
                        borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      sx={{
                        "& .MuiBadge-badge": {
                          fontWeight: 800,
                          fontSize: "0.7rem",
                        },
                      }}
                    >
                      <NotificationsNoneOutlined sx={{ fontSize: 22 }} />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Divider */}
                <Box
                  sx={{
                    width: "1px",
                    height: 24,
                    bgcolor: theme => alpha(theme.palette.divider, 0.2),
                    mx: 0.5,
                    display: { xs: "none", sm: "block" },
                  }}
                />

                <AccountMenu />
              </>
            ) : (
              <>
                <IconButton
                  onClick={handleAuthMenuClick}
                  size="small"
                  sx={{
                    ml: 1,
                    p: 0.75,
                    border: theme => `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    borderRadius: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: theme => alpha(theme.palette.text.primary, 0.04),
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <PersonOutline sx={{ fontSize: 22, color: "text.secondary" }} />
                </IconButton>

                {mounted && (
                  <AuthMenu
                    anchorElAuth={anchorElAuth}
                    authMenuOpen={authMenuOpen}
                    handleAuthMenuClose={handleAuthMenuClose}
                  />
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer Component */}
      <MobileDrawer
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        logoSrc={logoSrc}
      />

      {/* Notification Drawer */}
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </AppBar>
  )
}
