"use client"

import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Avatar,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
  Drawer,
  List,
  ListItem,
  alpha,
} from "@mui/material"
import {
  Menu as MenuIcon,
  NotificationsNone,
  SettingsOutlined,
  ExitToAppOutlined,
  PersonOutline,
  Search,
  Close,
  Circle,
} from "@mui/icons-material"
import NeuralPanel from "@/components/ui/NeuralPanel"
import { useState } from "react"
import Link from "next/link"
import AccountMenu from "@/components/ui/AccountMenu"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {
  useReadNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/features/notification/notificationApi"

dayjs.extend(relativeTime)

export default function StudentTopbar({ handleDrawerToggle, drawerWidth }) {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifOpen, setNotifOpen] = useState(false)

  const { data: notificationsData } = useReadNotificationsQuery({ page: 1, size: 50 })
  const [markAsRead] = useMarkNotificationAsReadMutation()
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation()

  const notifications = notificationsData?.data || []
  const unreadCount = notifications.filter(n => !n.read).length

  const handleNotificationClick = async notif => {
    if (!notif.read) {
      await markAsRead(notif.public_id)
    }
    if (notif.link) {
      router.push(notif.link)
    }
    setNotifOpen(false)
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
  }

  const handleMenuOpen = event => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)
  const toggleNotifDrawer = open => () => setNotifOpen(open)

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { xs: "calc(100% - 32px)", md: `calc(100% - ${drawerWidth + 48 + 24}px)` },
          ml: { md: `${drawerWidth + 24 + 24}px` },
          mt: { xs: 2, md: 3 },
          right: { xs: 16, md: 24 },
          backdropFilter: "blur(20px) !important",
          borderRadius: "20px",
          bgcolor: "rgba(255,255,255,0.8)",
          border: "1px solid",
          borderColor: theme => alpha(theme.palette.common.black, 0.05),
          transition: "all 0.3s ease",
          zIndex: 1100,
          overflow: "hidden",
        }}
      >
        <NeuralPanel particleCount={10} opacity={0.2} />
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: { xs: 2, md: 4 },
            minHeight: { xs: 64, md: 70 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" }, color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                display: { xs: "none", lg: "block" },
                color: "primary.main",
                letterSpacing: -1,
              }}
            >
              Elite Learning Console
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
            <IconButton sx={{ bgcolor: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <Search fontSize="small" />
            </IconButton>

            <Tooltip title="Notifications">
              <IconButton
                onClick={toggleNotifDrawer(true)}
                sx={{
                  color: "text.secondary",
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": { color: "secondary.main", bgcolor: "rgba(0,0,0,0.04)" },
                }}
              >
                <Badge badgeContent={unreadCount} color="secondary">
                  <NotificationsNone fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            <Box
              sx={{
                width: "1px",
                height: 24,
                bgcolor: "rgba(0,0,0,0.1)",
                mx: 0.5,
                display: { xs: "none", sm: "block" },
              }}
            />

            <AccountMenu />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={notifOpen}
        onClose={toggleNotifDrawer(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            bgcolor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(40px)",
            backgroundImage: "none",
            borderLeft: "1px solid",
            borderColor: "rgba(0,0,0,0.05)",
            color: "text.primary",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              p: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: -0.5 }}>
              Notifications
            </Typography>
            <IconButton onClick={toggleNotifDrawer(false)} sx={{ color: "rgba(0,0,0,0.5)" }}>
              <Close />
            </IconButton>
          </Box>

          <List sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <ListItem sx={{ justifyContent: "center", py: 4 }}>
                <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                  No notifications
                </Typography>
              </ListItem>
            ) : (
              notifications.map(notif => {
                const dotColor = notif.read ? "rgba(0,0,0,0.15)" : "#2EB82E"
                return (
                  <ListItem
                    key={notif.public_id}
                    disablePadding
                    onClick={() => handleNotificationClick(notif)}
                    sx={{
                      mb: 1.5,
                      borderRadius: "16px",
                      cursor: "pointer",
                      border: notif.read
                        ? "1px solid transparent"
                        : theme => `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                      bgcolor: notif.read
                        ? "transparent"
                        : theme => alpha(theme.palette.secondary.main, 0.03),
                      "&:hover": {
                        bgcolor: "rgba(0,0,0,0.02)",
                      },
                    }}
                  >
                    <Box sx={{ p: 2, width: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Circle
                            sx={{
                              width: 8,
                              height: 8,
                              color: dotColor,
                              filter: notif.read ? "none" : `drop-shadow(0 0 5px ${dotColor})`,
                            }}
                          />
                          <Typography variant="body2" fontWeight="800">
                            {notif.title}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.disabled", fontWeight: 600 }}
                        >
                          {dayjs(notif.created_at).fromNow()}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", pl: 3.5, lineHeight: 1.4, fontWeight: 500 }}
                      >
                        {notif.message}
                      </Typography>
                    </Box>
                  </ListItem>
                )
              })
            )}
          </List>

          <Box sx={{ p: 3, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
            <Typography
              variant="button"
              onClick={handleMarkAllRead}
              sx={{
                display: "block",
                textAlign: "center",
                color: "secondary.main",
                fontWeight: 900,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Mark All as Read
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}
