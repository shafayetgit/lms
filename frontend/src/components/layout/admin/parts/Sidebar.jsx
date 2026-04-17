"use client";

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
  Divider,
  alpha,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardOutlined,
  SchoolOutlined,
  AutoStoriesOutlined,
  ReceiptLongOutlined,
  FavoriteBorderOutlined,
  SupportAgentOutlined,
  PersonOutline,
  Close,
} from "@mui/icons-material";
import Image from "next/image";
import { LOGO, LOGO_HEIGHT, LOGO_WIDTH } from "@/lib/constants";
import { menuItems } from "../navigation";

export default function Sidebar({
  mobileOpen,
  handleDrawerToggle,
  drawerWidth,
}) {
  const theme = useTheme();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        pt: isMobile ? 2 : 0,
        position: "relative",
        backgroundColor: "transparent",
      }}
    >
      {isMobile && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Menu
          </Typography>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              color: "text.primary",
              bgcolor: "rgba(0,0,0,0.03)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
            }}
            size="small"
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Branding Module */}
      <Box sx={{ px: 0 }}>
        <Box
          sx={{
            p: "1px",
            borderRadius: "24px",
            background: "transparent",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(20px)",
              borderRadius: "23px",
              p: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 2,
            }}
          >
            <Link
              href="/"
              style={{ textDecoration: "none", display: "flex", width: "100%" }}
            >
              {/* <Box
                component="img"
                src={LOGO}
                alt="logo"
                sx={{ height: { xs: 40, md: 55 }, width: "auto" }}
              /> */}
              <Image
                src={LOGO}
                width={LOGO_WIDTH}
                height={LOGO_HEIGHT}
                style={{
                  width: "auto",
                  height: "auto",
                }}
                alt="Logo"
                priority
              />{" "}
            </Link>
          </Box>
        </Box>
      </Box>

      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.title} disablePadding sx={{ mb: 1 }}>
              <Link
                href={item.path}
                passHref
                style={{ width: "100%", textDecoration: "none" }}
              >
                <ListItemButton
                  sx={{
                    borderRadius: "16px",
                    py: 1.5,
                    px: 2.5,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    bgcolor: isActive
                      ? alpha(theme.palette.secondary.main, 0.08)
                      : "transparent",
                    color: isActive ? "secondary.main" : "text.secondary",
                    border: "1px solid",
                    borderColor: isActive
                      ? alpha(theme.palette.secondary.main, 0.1)
                      : "transparent",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.secondary.main, 0.05),
                      color: "secondary.main",
                      transform: "translateX(6px)",
                      "& .MuiListItemIcon-root": { color: "secondary.main" },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "secondary.main" : "text.disabled",
                      minWidth: 40,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 900 : 600,
                      fontSize: "0.9rem",
                    }}
                  />
                  {isActive && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "secondary.main",
                        boxShadow: (theme) =>
                          `0 0 15px 4px ${alpha(theme.palette.secondary.main, 0.4)}`,
                      }}
                    />
                  )}
                </ListItemButton>
              </Link>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: drawerWidth },
        flexShrink: { md: 0 },
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
              bgcolor: "white",
              backdropFilter: "blur(20px)",
              borderRight: "1px solid",
              borderColor: (theme) => alpha(theme.palette.common.black, 0.05),
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
            bgcolor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid",
            borderColor: (theme) => alpha(theme.palette.common.black, 0.03),
            boxShadow: (theme) =>
              `0 20px 40px -10px ${alpha(theme.palette.common.black, 0.05)}`,
            overflow: "hidden",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
