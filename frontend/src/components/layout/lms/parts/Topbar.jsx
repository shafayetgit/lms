"use client";

import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Tooltip,
  Badge,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  NotificationsNoneOutlined,
} from "@mui/icons-material";
import AccountMenu from "@/components/ui/AccountMenu";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOGO, LOGO_HEIGHT, LOGO_WIDTH } from "@/lib/constants/app";
import Image from "next/image";
import { useReadSettingsQuery } from "@/features/settings/settingsApi";
import { useReadNotificationsQuery } from "@/features/notification/notificationApi";
import TopbarBreadcrumbs from "./TopbarBreadcrumbs";
import NotificationDrawer from "./NotificationDrawer";

export default function Topbar({ handleDrawerToggle, drawerWidth, isMini }) {
  const theme = useTheme();
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: settingsData } = useReadSettingsQuery();
  const isDarkMode = theme.palette.mode === "dark";
  const dynamicLogo = isDarkMode
    ? settingsData?.site_logo_light || settingsData?.site_logo_dark
    : settingsData?.site_logo_dark || settingsData?.site_logo_light;

  const logoSrc = dynamicLogo
    ? (dynamicLogo.startsWith("http") ? dynamicLogo : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${dynamicLogo.replace(/^\//, "")}`)
    : LOGO;

  const { data: notificationsData } = useReadNotificationsQuery({ page: 1, size: 50 });
  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          left: { xs: 0, md: `${drawerWidth}px` },
          top: 0,
          right: 0,
          borderRadius: 0,
          bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.7 : 0.8),
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: `0 4px 20px 0 ${alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.2 : 0.02)}`,
          backgroundImage: "none",
          transition: theme.transitions.create(["width", "left"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: { xs: 2, md: 4 },
            minHeight: { xs: 56, md: 64 },
            height: { xs: 56, md: 64 },
            boxSizing: "border-box",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Show Logo only on Mobile, acts as drawer toggle */}
            <Box sx={{ display: { xs: "block", md: "none" } }}>
              <Box 
                onClick={handleDrawerToggle}
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  cursor: "pointer",
                  p: 0.5,
                  ml: -0.5,
                  borderRadius: 1,
                  "&:hover": {
                    bgcolor: "action.hover"
                  }
                }}
                role="button"
                aria-label="open drawer"
                tabIndex={0}
              >
                <Image
                  src={logoSrc}
                  alt="Elite LMS Logo"
                  width={120}
                  height={40}
                  style={{
                    height: "40px",
                    width: "auto",
                    objectFit: "contain",
                  }}
                  unoptimized
                />
              </Box>
            </Box>

            {/* Dynamic Breadcrumbs */}
            <TopbarBreadcrumbs pathname={pathname} />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 2 },
            }}
          >
            <Tooltip title="Notifications">
              <IconButton
                onClick={() => setNotifOpen(true)}
                size="small"
                sx={{
                  color: "text.secondary",
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: "50%",
                  p: 0.75,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderColor: alpha(theme.palette.primary.main, 0.3),
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
                    }
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
                bgcolor: alpha(theme.palette.divider, 0.2),
                mx: 0.5,
                display: { xs: "none", sm: "block" },
              }}
            />

            <AccountMenu />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notification Drawer */}
      <NotificationDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </>
  );
}
