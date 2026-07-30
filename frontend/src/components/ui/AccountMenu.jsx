"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  alpha,
} from "@mui/material"
import {
  PersonOutline,
  ExitToAppOutlined,
  LightModeOutlined,
  DarkModeOutlined,
  SpaceDashboardOutlined,
  LanguageOutlined,
  DeleteSweepOutlined,
} from "@mui/icons-material"
import { useDispatch, useSelector } from "react-redux"
import { toggleTheme } from "@/features/app/appSlice"

import { toast } from "react-toastify"
import { removeAuthCookie } from "@/lib/auth/cookie"
import { getCurrentUser, getProfileUser } from "@/lib/auth/client"
import { useGetMeQuery } from "@/features/user/userAPI"
import { useFlushCacheMutation } from "@/features/settings/settingsApi"
import { getCookie } from "@/utils/shared"
import api from "@/redux/api"
import { getStore } from "@/redux/storeProvider"

export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [mounted, setMounted] = React.useState(false)
  const open = Boolean(anchorEl)
  const router = useRouter()
  const dispatch = useDispatch()
  const [flushBackendCache] = useFlushCacheMutation()
  const mode = useSelector(state => state.app?.mode || "light")

  const hasToken = typeof window !== "undefined" && !!getCookie("accessToken")
  const { data: meResponse } = useGetMeQuery(undefined, { skip: !hasToken })
  const user = meResponse?.data || getCurrentUser()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const getInitials = () => {
    if (!mounted || !user) return "US"
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    if (user.first_name) {
      return user.first_name.slice(0, 2).toUpperCase()
    }
    if (user.currentUsername) {
      return user.currentUsername.slice(0, 2).toUpperCase()
    }
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase()
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    if (user.sub) {
      return user.sub.slice(0, 2).toUpperCase()
    }
    return "US"
  }

  const getFullName = () => {
    if (!mounted || !user) return "Authenticated User"
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return user.currentUsername || user.username || user.email || "Authenticated User"
  }

  const getDashboardLink = () => {
    if (!mounted || !user) return "/academy/dashboard"
    switch (user.role?.toLowerCase()) {
      case "superadmin":
      case "admin":
        return "/lms/dashboard"
      case "student":
        return "/academy/dashboard"
      default:
        return "/academy/dashboard"
    }
  }

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleFlushCache = async () => {
    try {
      // 1. Flush backend redis cache (only works if admin, otherwise fails silently)
      try {
        await flushBackendCache().unwrap()
      } catch (err) {
        console.warn("Backend cache flush unauthorized or failed, proceeding with frontend flush")
      }

      // 2. Reset RTK Query API cache
      dispatch(api.util.resetApiState())

      // 3. Purge redux-persist storage
      const { persistor } = getStore()
      await persistor.purge()

      toast.success("Cache flushed successfully")
      window.location.reload()
    } catch {
      toast.error("Failed to flush cache")
    } finally {
      handleClose()
    }
  }

  const handleSignOut = () => {
    try {
      removeAuthCookie()
      toast.success("Signed out successfully")
      window.location.href = "/"
    } catch (error) {
      toast.error("Sign out failed")
    } finally {
      handleClose()
    }
  }

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <IconButton
          onClick={handleClick}
          sx={{ p: 0.5, ml: 1 }}
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar
            src={user?.avatar || undefined}
            sx={{
              width: 38,
              height: 38,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 800,
              fontSize: "0.85rem",
            }}
          >
            {getInitials()}
          </Avatar>
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              boxShadow: "none",
              mt: 2,
              backdropFilter: "blur(40px)",
              bgcolor: theme => alpha(theme.palette.background.paper, 0.95),
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              minWidth: 200,
            },
          },
        }}
      >
        <Box sx={{ px: 1.5, py: 0.5, borderBottom: 1, borderColor: "divider" }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.2,
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              fontSize: "0.875rem",
            }}
          >
            {getFullName()}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              mt: 0.25,
              display: "block",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {mounted ? user?.email || "No email provided" : ""}
          </Typography>
        </Box>

        {/* Dynamic routing based on role or fallback to student panel */}
        <MenuItem
          onClick={handleClose}
          component={Link}
          href={getDashboardLink()}
          sx={{
            py: 0.5,
            px: 1.5,
            fontWeight: 700,
            fontSize: "0.875rem",
          }}
        >
          <ListItemIcon>
            <SpaceDashboardOutlined fontSize="small" />
          </ListItemIcon>
          Dashboard
        </MenuItem>

        {/* Portal Option */}
        <MenuItem
          onClick={handleClose}
          component={Link}
          href="/"
          sx={{
            py: 0.5,
            px: 1.5,
            fontWeight: 700,
            fontSize: "0.875rem",
          }}
        >
          <ListItemIcon>
            <LanguageOutlined fontSize="small" />
          </ListItemIcon>
          Portal
        </MenuItem>

        <MenuItem
          onClick={() => {
            dispatch(toggleTheme())
            handleClose()
          }}
          sx={{
            py: 0.5,
            px: 1.5,
            fontWeight: 700,
            fontSize: "0.875rem",
          }}
        >
          <ListItemIcon>
            {mode === "dark" ? (
              <LightModeOutlined fontSize="small" />
            ) : (
              <DarkModeOutlined fontSize="small" />
            )}
          </ListItemIcon>
          {mode === "dark" ? "Light Mode" : "Dark Mode"}
        </MenuItem>

        <Divider sx={{ opacity: 0.5 }} />

        {/* Flush Cache */}
        <MenuItem
          onClick={handleFlushCache}
          sx={{
            py: 0.5,
            px: 1.5,
            color: "warning.main",
            fontWeight: 700,
            fontSize: "0.875rem",
          }}
        >
          <ListItemIcon>
            <DeleteSweepOutlined fontSize="small" sx={{ color: "warning.main" }} />
          </ListItemIcon>
          Flush Cache
        </MenuItem>

        <Divider sx={{ opacity: 0.5 }} />

        <MenuItem
          onClick={handleSignOut}
          sx={{
            py: 0.5,
            px: 1.5,
            color: "error.main",
            fontWeight: 800,
            fontSize: "0.875rem",
          }}
        >
          <ListItemIcon>
            <ExitToAppOutlined fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  )
}
