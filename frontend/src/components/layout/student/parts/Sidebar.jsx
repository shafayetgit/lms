"use client"

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha,
  Divider,
  Tooltip,
} from "@mui/material"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Close, ChevronLeft, ChevronRight } from "@mui/icons-material"
import { menuItems } from "../navigation"
import { ROUTES } from "@/lib/constants/routes"

export default function Sidebar({
  mobileOpen,
  handleDrawerToggle,
  drawerWidth,
  isMini,
  setIsMini,
}) {
  const theme = useTheme()
  const pathname = usePathname()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        pb: 4,
        position: "relative",
        backgroundColor: "transparent",
      }}
    >
      {/* {isMobile && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2, mb: 1 }}>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ color: "rgba(255,255,255,0.5)", zIndex: 2 }}
          >
            <Close />
          </IconButton>
        </Box>
      )} */}

      <List
        sx={{
          px: isMini ? 1 : 2,
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
          transition: "padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.1),
            borderRadius: "4px",
          },
        }}
      >
        {menuItems.map(item => {
          const isActive =
            item.path === ROUTES.admin.dashboard.path
              ? pathname === item.path
              : pathname === item.path ||
              (item.path !== "/" && pathname?.startsWith(item.path + "/"))
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1.5 }}>
              <Tooltip
                  title={isMini ? item.title : ""}
                  placement="right"
                  arrow
                  slotProps={{
                    tooltip: {
                      sx: {
                        bgcolor: theme => alpha(theme.palette.background.paper, 0.9),
                        color: "text.primary",
                        boxShadow: theme => `0 4px 20px ${alpha(theme.palette.common.black, 0.5)}`,
                        border: "1px solid",
                        borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                        borderRadius: "10px",
                        fontWeight: 800,
                        px: 2,
                        py: 1,
                        backdropFilter: "blur(10px)",
                        fontSize: "0.85rem",
                      },
                    },
                    arrow: {
                      sx: {
                        color: theme => alpha(theme.palette.background.paper, 0.9),
                        "&::before": {
                          border: "1px solid",
                          borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                        },
                      },
                    },
                  }}
                >
                  <ListItemButton
                    component={Link}
                    href={item.path}
                    aria-current={isActive ? "page" : undefined}
                    sx={{
                      borderRadius: isMini ? "8px" : "16px",
                      p: isMini ? 0 : undefined,
                      py: isMini ? 0 : 1.8,
                      px: isMini ? 0 : 3,
                      height: isMini ? 48 : "auto",
                      width: isMini ? 48 : "100%",
                      minHeight: isMini ? 48 : undefined,
                      minWidth: isMini ? 48 : undefined,
                      maxHeight: isMini ? 48 : undefined,
                      maxWidth: isMini ? 48 : undefined,
                      boxSizing: "border-box",
                      flexShrink: 0,
                      mx: isMini ? "auto" : 0,
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: isMini ? "center" : "flex-start",
                      alignItems: "center",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      bgcolor: isActive ? "background.panel" : "transparent",
                      color: isActive ? "text.primary" : "text.muted",
                      border: "1px solid",
                      borderColor: isActive
                        ? theme => alpha(theme.palette.primary.main, 0.3)
                        : "transparent",
                      boxShadow: isActive
                        ? theme => `0 0 20px -5px ${alpha(theme.palette.primary.main, 0.3)}`
                        : "none",
                      "&:hover": {
                        bgcolor: isActive
                          ? theme => alpha(theme.palette.primary.main, 0.12)
                          : theme => alpha(theme.palette.text.primary, 0.03),
                        color: "text.primary",
                        transform: isMini ? "scale(1.05)" : "translateX(6px)",
                        "& .MuiListItemIcon-root": { color: "primary.main" },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? "primary.main" : "text.muted",
                        minWidth: isMini ? 0 : 40,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transition: "all 0.3s ease",
                        filter: isActive
                          ? theme =>
                            `drop-shadow(0 0 5px ${alpha(theme.palette.primary.main, 0.5)})`
                          : "none",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      sx={{
                        display: isMini ? "none" : "block",
                        opacity: isMini ? 0 : 1,
                        maxWidth: isMini ? 0 : 200,
                        flexGrow: 1,
                        m: isMini ? 0 : undefined,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      slotProps={{
                        primary: {
                          fontWeight: isActive ? 800 : 500,
                          fontSize: "0.95rem",
                          letterSpacing: isActive ? 1 : 0.2,
                        },
                      }}
                    />
                    {isActive && (
                      <Box
                        sx={{
                          width: isMini ? 0 : 6,
                          height: isMini ? 0 : 6,
                          opacity: isMini ? 0 : 1,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          boxShadow: theme =>
                            `0 0 10px 2px ${alpha(theme.palette.primary.main, 0.4)}`,
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
            </ListItem>
          )
        })}
      </List>

      <Box
        sx={{
          px: isMini ? 1 : 3,
          mt: "auto",
          pt: 2,
          display: { xs: "none", md: "flex" },
          justifyContent: isMini ? "center" : "flex-end",
          borderTop: "1px solid",
          borderColor: theme => alpha(theme.palette.text.primary, 0.05),
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
  )

  return (
    <Box
      component="nav"
      sx={{
        width: { md: drawerWidth },
        flexShrink: { md: 0 },
        transition: "width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}
    >
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
              borderRight: "1px solid",
              borderColor: theme => alpha(theme.palette.text.primary, 0.05),
              backgroundImage: "none",
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            },
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            height: "calc(100vh - 48px)",
            top: 24,
            left: 24,
            borderRadius: "32px",
            bgcolor: "transparent",
            backdropFilter: "blur(2px)",
            borderColor: theme => alpha(theme.palette.text.primary, 0.03),
            overflow: "hidden",
            transition: "width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  )
}
