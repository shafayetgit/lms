"use client";

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha,
  Tooltip,
} from "@mui/material";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

import { menuItems } from "../navigation";
import { ROUTES } from "@/lib/constants/routes";

export default function Sidebar({
  mobileOpen,
  handleDrawerToggle,
  drawerWidth,
  isMini,
  setIsMini,
}) {
  const theme = useTheme();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              width: drawerWidth,
              bgcolor: "background.paper",
              borderRight: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
              backgroundImage: "none",
            },
          },
        }}
      >
        {drawerContent({ isMini, pathname, theme, setIsMini })}
      </Drawer>

      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            height: "calc(100vh - 48px)",
            top: 24,
            left: 24,
            borderRadius: "32px",
            bgcolor: "transparent",
            backdropFilter: "blur(2px)",
            border: `1px solid ${alpha(theme.palette.text.primary, 0.03)}`,
            overflow: "hidden",
            transition: "width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          },
        }}
        open
      >
        {drawerContent({ isMini, pathname, theme, setIsMini })}
      </Drawer>
    </Box>
  );
}

// Extracted to reduce dynamic rendering complexity
function drawerContent({ isMini, pathname, theme, setIsMini }) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        pb: 4,
        backgroundColor: "transparent",
      }}
    >
      <List
        sx={{
          px: isMini ? 1 : 2,
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(theme.palette.text.primary, 0.1),
            borderRadius: "4px",
          },
        }}
      >
        {menuItems.map((item) => {
          const isActive =
            item.path === ROUTES.admin.dashboard.path
              ? pathname === item.path
              : pathname === item.path ||
                (item.path !== "/" && pathname?.startsWith(item.path + "/"));

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1.5 }}>
              <Tooltip title={isMini ? item.title : ""} placement="right" arrow>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  aria-current={isActive ? "page" : undefined}
                  suppressHydrationWarning
                  sx={{
                    borderRadius: isMini ? 8 : 16,
                    py: isMini ? 0 : 1.8,
                    px: isMini ? 0 : 3,
                    height: isMini ? 48 : "auto",
                    width: isMini ? 48 : "100%",
                    minWidth: isMini ? 48 : undefined,
                    mx: isMini ? "auto" : 0,
                    justifyContent: isMini ? "center" : "flex-start",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",

                    bgcolor: isActive ? "background.panel" : "transparent",
                    color: isActive ? "text.primary" : "text.muted",

                    border: "1px solid",
                    borderColor: isActive
                      ? alpha(theme.palette.primary.main, 0.3)
                      : "transparent",

                    boxShadow: isActive
                      ? `0 0 20px -5px ${alpha(theme.palette.primary.main, 0.3)}`
                      : "none",

                    "&:hover": {
                      bgcolor: isActive
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.text.primary, 0.03),
                      color: "text.primary",
                      transform: isMini ? "scale(1.05)" : "translateX(6px)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "primary.main" : "text.muted",
                      minWidth: isMini ? 0 : 40,
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.title}
                    sx={{
                      display: isMini ? "none" : "block",
                      opacity: isMini ? 0 : 1,
                      transition: "opacity 0.3s ease",
                    }}
                    slotProps={{
                      primary: {
                        fontWeight: isActive ? 800 : 500,
                        fontSize: "0.95rem",
                      },
                    }}
                  />

                  {isActive && !isMini && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        boxShadow: `0 0 10px 2px ${alpha(
                          theme.palette.primary.main,
                          0.4
                        )}`,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Collapse Button */}
      <Box
        sx={{
          px: isMini ? 1 : 3,
          mt: "auto",
          pt: 2,
          display: { xs: "none", md: "flex" },
          justifyContent: isMini ? "center" : "flex-end",
          borderTop: "1px solid",
          borderColor: alpha(theme.palette.text.primary, 0.05),
        }}
      >
        <IconButton
          onClick={() => setIsMini(!isMini)}
          aria-label={isMini ? "Expand sidebar" : "Collapse sidebar"}
          sx={{
            color: "text.muted",
            "&:hover": { color: "primary.main" },
          }}
        >
          {isMini ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
    </Box>
  );
}