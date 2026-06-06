"use client";

import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Box,
  Tooltip,
  Typography,
  alpha,
  Drawer,
  List,
  ListItem,
  Avatar,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search,
  Close as CloseIcon,
  DarkModeOutlined,
  LightModeOutlined,
} from "@mui/icons-material";
import AccountMenu from "@/components/ui/AccountMenu";
import { useState } from "react";
import Link from "next/link";
import { LOGO } from "@/lib/constants/app";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { toggleTheme } from "@/features/app/appSlice";

const mockNotifications = [
  {
    id: 1,
    title: "New User Registered",
    desc: "Sarah Jenkins joined the platform",
    time: "2 min ago",
    read: false,
    color: "success.main",
  },
  {
    id: 2,
    title: "System Update",
    desc: "Version 2.4.0 is now live with enhanced security",
    time: "1 hour ago",
    read: false,
    color: "info.main",
  },
  {
    id: 3,
    title: "Revenue Alert",
    desc: "Monthly target reached! +25% growth this week",
    time: "5 hours ago",
    read: true,
    color: "secondary.main",
  },
  {
    id: 4,
    title: "Storage Warning",
    desc: "Cloud storage is at 85% capacity",
    time: "1 day ago",
    read: true,
    color: "warning.main",
  },
];

export default function Topbar({ handleDrawerToggle, drawerWidth }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [notifOpen, setNotifOpen] = useState(false);

  const toggleNotifDrawer = (open) => () => setNotifOpen(open);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { xs: "100%", md: `calc(100% - ${drawerWidth + 48 + 20}px)` },
          ml: { md: `${drawerWidth + 24 + 20}px` },
          mt: { xs: 0, md: 3 },
          right: { xs: 0, md: 24 },
          backdropFilter: "blur(24px) !important",
          WebkitBackdropFilter: "blur(24px) !important",
          borderRadius: { xs: 0, md: "24px" },
          bgcolor: "transparent",
          border: "none",
          backgroundImage: "none !important",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          zIndex: 1100,
          overflow: "hidden",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: { xs: 2, md: 1 },
            minHeight: { xs: 64, md: 70 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              edge="start"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" }, color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>
            <Link href="/" style={{ textDecoration: "none", display: "flex" }}>
              {/* <Image /> */}
              <Box
                sx={{
                  width: 106,
                  height: 62,
                  position: "relative",
                }}
              >
                <Image
                  src={theme.palette.mode === "dark" ? LOGO : LOGO}
                  alt="TheBioSport Logo"
                  fill
                  sizes="106px"
                  style={{
                    objectFit: "contain",
                  }}
                  priority
                />
              </Box>
            </Link>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 2 },
            }}
          >
            {/* <Tooltip title="Notifications">
              <IconButton
                onClick={toggleNotifDrawer(true)}
                sx={{
                  color: "text.secondary",
                  bgcolor: "background.panel",
                  border: "1px solid",
                  borderColor: (theme) =>
                    alpha(theme.palette.common.white, 0.05),
                  "&:hover": {
                    color: "text.primary",
                    bgcolor: (theme) => alpha(theme.palette.common.white, 0.08),
                  },
                }}
              >
                <Badge
                  badgeContent={2}
                  color="primary"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontWeight: 800,
                      border: "2px solid",
                      borderColor: "background.default",
                    },
                  }}
                >
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            <Box
              sx={{
                width: "1px",
                height: 24,
                bgcolor: "rgba(255,255,255,0.1)",
                mx: 0.5,
                display: { xs: "none", sm: "block" },
              }}
            /> */}

            <Tooltip
              title={`Switch to ${theme.palette.mode === "dark" ? "light" : "dark"} mode`}
            >
              <IconButton
                onClick={() => dispatch(toggleTheme())}
                sx={{
                  color: "text.secondary",
                  bgcolor: "background.panel",
                  border: "1px solid",
                  borderColor: (theme) =>
                    alpha(theme.palette.common.white, 0.05),
                  "&:hover": {
                    color: "text.primary",
                    bgcolor: (theme) => alpha(theme.palette.common.white, 0.08),
                  },
                }}
              >
                {theme.palette.mode === "dark" ? (
                  <LightModeOutlined fontSize="small" />
                ) : (
                  <DarkModeOutlined fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            <AccountMenu />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={notifOpen}
        onClose={toggleNotifDrawer(false)}
        transitionDuration={{ enter: 350, exit: 250 }}
        disableScrollLock
        ModalProps={{
          keepMounted: true,
        }}
        slotProps={{
          transition: {
            easing: {
              enter: "cubic-bezier(0, 0, 0.2, 1)", // Deceleration curve
              exit: "cubic-bezier(0.4, 0, 1, 1)", // Acceleration curve
            },
          },
          paper: {
            sx: {
              width: { xs: "100%", sm: 400 },
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(20px)",
              backgroundImage: "none",
              borderLeft: "1px solid",
              borderColor: (theme) => alpha(theme.palette.common.white, 0.08),
              color: "text.primary",
              boxShadow: (theme) =>
                `-20px 0 50px ${alpha(theme.palette.common.black, 0.5)}`,
            },
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="800"
              sx={{ letterSpacing: -0.5 }}
            >
              Notifications
            </Typography>
            <IconButton
              onClick={toggleNotifDrawer(false)}
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <List sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}>
            {mockNotifications.map((notif) => (
              <ListItem
                key={notif.id}
                disablePadding
                sx={{
                  mb: 1.5,
                  borderRadius: "16px",
                  border: notif.read
                    ? "1px solid transparent"
                    : (theme) =>
                        `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  bgcolor: notif.read
                    ? "transparent"
                    : (theme) => alpha(theme.palette.primary.main, 0.03),
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
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
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: notif.color,
                          boxShadow: `0 0 10px ${notif.color}`,
                        }}
                      />
                      <Typography variant="body2" fontWeight="700">
                        {notif.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", opacity: 0.7 }}
                    >
                      {notif.time}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      pl: 3.5,
                      lineHeight: 1.4,
                    }}
                  >
                    {notif.desc}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>

          <Box
            sx={{
              p: 3,
              borderTop: "1px solid",
              borderColor: (theme) => alpha(theme.palette.common.white, 0.05),
            }}
          >
            <Typography
              variant="button"
              sx={{
                display: "block",
                textAlign: "center",
                color: "primary.main",
                fontWeight: 800,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              View All Activity
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
