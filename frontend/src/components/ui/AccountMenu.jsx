"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  PersonOutline,
  SettingsOutlined,
  ExitToAppOutlined,
} from "@mui/icons-material";

import { toast } from "react-toastify";
import { removeAuthCookie } from "@/lib/auth/cookie";
import { currentUser } from "@/lib/auth/client";

export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  // Get User Details for dynamic header and initials
  

  const getInitials = () => {
    if (currentUser?.first_name && currentUser?.last_name) {
      return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
    }
    if (currentUser?.first_name) {
      return currentUser.first_name.slice(0, 2).toUpperCase();
    }
    if (currentUser?.currentUsername) {
      return currentUser.currentUsername.slice(0, 2).toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email.slice(0, 2).toUpperCase();
    }
    return "US";
  };

  const getFullName = () => {
    if (currentUser?.first_name && currentUser?.last_name) {
      return `${currentUser.first_name} ${currentUser.last_name}`;
    }
    return currentUser?.currentUsername || "Authenticated CurrentUser";
  };

  const getProfileLink = () => {
    switch (currentUser?.role?.toLowerCase()) {
      case "admin": return "/admin/";
      case "student": return "/student/";
      default: return "/student/";
    }
  };

  const getDashboardLink = () => {
    switch (currentUser?.role?.toLowerCase()) {
      case "admin": return "/admin";
      case "student": return "/student ";
      default: return "/student ";
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    try {
      removeAuthCookie();
      toast.success("Signed out successfully");
      window.location.href = "/";
    } catch (error) {
      toast.error("Sign out failed");
    } finally {
      handleClose();
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip
          title="Account settings"
          arrow
          slotProps={{
            tooltip: {
              sx: {
                bgcolor: "primary.main",
                color: "white",
                fontWeight: 700,
                fontSize: "0.75rem",
                px: 2,
                py: 1,
                borderRadius: 2,
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
              },
            },
            arrow: {
              sx: {
                color: "primary.main",
              },
            },
          }}
        >
          <IconButton
            onClick={handleClick}
            sx={{ p: 0.5, ml: 1 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: "secondary.main",
                color: "white",
                fontWeight: 800,
                fontSize: "0.85rem",
              }}
            >
              {getInitials()}
            </Avatar>
          </IconButton>
        </Tooltip>
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
              filter: "drop-shadow(0px 10px 40px rgba(0,0,0,0.1))",
              mt: 2,
              backdropFilter: "blur(40px)",
              bgcolor: "rgba(255,255,255,0.9)",
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.05)",
              borderRadius: "16px",
              minWidth: 200,
            },
          },
        }}
      >
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
            {getFullName()}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            {currentUser?.email || "No email provided"}
          </Typography>
        </Box>
        <Divider sx={{ opacity: 0.5 }} />

        {/* Dynamic routing based on role or fallback to student panel */}
        <MenuItem
          onClick={handleClose}
          component={Link}
          href={getProfileLink()}
          sx={{
            py: 1.5,
            mx: 1,
            my: 0.5,
            borderRadius: "8px",
            fontWeight: 700,
          }}
        >
          <ListItemIcon>
            <PersonOutline fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>

        <MenuItem
          onClick={handleClose}
          component={Link}
          href={getDashboardLink()}
          sx={{
            py: 1.5,
            mx: 1,
            my: 0.5,
            borderRadius: "8px",
            fontWeight: 700,
          }}
        >
          <ListItemIcon>
            <SettingsOutlined fontSize="small" />
          </ListItemIcon>
          Dashboard / Settings
        </MenuItem>

        <Divider sx={{ opacity: 0.5 }} />

        <MenuItem
          onClick={handleSignOut}
          sx={{
            py: 1.5,
            mx: 1,
            my: 0.5,
            borderRadius: "8px",
            color: "error.main",
            fontWeight: 800,
          }}
        >
          <ListItemIcon>
            <ExitToAppOutlined fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
}
