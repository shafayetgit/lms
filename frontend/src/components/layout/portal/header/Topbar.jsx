"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@mui/material";
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
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "@/features/app/appSlice";

import CButton from "@/components/ui/CButton";
import CartDrawer from "./partials/CartDrawer";
import Navigation from "./partials/Navigation";
import AccountMenu from "@/components/ui/AccountMenu";
import SignOut from "./partials/SignOut";
import { LOGO, LOGO_HEIGHT, LOGO_WIDTH } from "@/lib/constants";
import { getCurrentUser, getProfileUser } from "@/lib/auth/client";
import Image from "next/image";
import { useReadSettingsQuery } from "@/features/settings/settingsApi";
import { useTheme } from "@mui/material";

import { useGetMeQuery } from "@/features/user/userAPI";
import { getCookie } from "@/utils/shared";
import { usePermissions } from "@/hooks/usePermissions";

const navItems = [
  { label: "Home", url: "/", icon: Home },
  { label: "Courses", url: "/courses", icon: MenuBook },
  { label: "E-Books", url: "/ebooks", icon: LibraryBooks },
  { label: "About", url: "/about", icon: Info },
  { label: "Contact", url: "/contact", icon: ContactSupport },
];

export default function Topbar({ dynamicColor }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.app?.mode || "light");
  const theme = useTheme();

  const { data: settingsData } = useReadSettingsQuery();
  const isDarkMode = theme.palette.mode === "dark";
  const dynamicLogo = isDarkMode
    ? settingsData?.site_logo_light || settingsData?.site_logo_dark
    : settingsData?.site_logo_dark || settingsData?.site_logo_light;

  const defaultLogo = isDarkMode
    ? "/images/logo/ecofin-light-logo.png"
    : "/images/logo/ecofin-dark-logo.png";

  const logoSrc = dynamicLogo
    ? (dynamicLogo.startsWith("http") ? dynamicLogo : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${dynamicLogo.replace(/^\//, "")}`)
    : defaultLogo;

  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
    setMobileOpen((prev) => !prev);
  };

  // Hydration-safe auth state
  const [mounted, setMounted] = useState(false);

  const hasToken = typeof window !== "undefined" && !!getCookie("accessToken");
  const { data: meResponse } = useGetMeQuery(undefined, { skip: !hasToken });
  const user = meResponse?.data || getCurrentUser();
  const { isSuperAdmin } = usePermissions();

  useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (active) setMounted(true);
    }, 0);
    return () => {
      active = false;
    };
  }, []);

  // Auth Menu State
  const [anchorElAuth, setAnchorElAuth] = useState(null);
  const authMenuOpen = Boolean(anchorElAuth);
  const handleAuthMenuClick = (event) => setAnchorElAuth(event.currentTarget);
  const handleAuthMenuClose = () => setAnchorElAuth(null);

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        bgcolor: "transparent",
        backgroundImage: (theme) =>
          `linear-gradient(${alpha(theme.palette.divider, 0.04)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(theme.palette.divider, 0.04)} 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        position: "relative",
      }}
    >
      {/* Minimalist Premium Header */}
      <Box sx={{ px: 3, pb: 4, display: "flex", justifyContent: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
            const isActive = pathname === item.url;
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
                  damping: 24
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
            );
          })}
        </Stack>
      </Box>

    </Box>
  );

  return (
    <AppBar
      component="nav"
      position="sticky"
      color="default"
      sx={{
        bgcolor: "background.default",
        boxShadow: "none",
        borderBottom: "none",
        top: 0,
        transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 1 }}>
        <Toolbar disableGutters>
          <Stack direction="row" alignItems="center" flexGrow={1}>
            {/* Desktop Logo */}
            <Box
              component={Link}
              href="/"
              sx={{
                display: { xs: "none", md: "block" },
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
                style={{ width: "auto", height: "44px", objectFit: "contain" }}
              />
            </Box>

            {/* Mobile Logo / Drawer Toggle */}
            <Box
              onClick={handleDrawerToggle}
              sx={{
                display: { xs: "block", md: "none" },
                cursor: "pointer",
                p: 0.5,
                ml: -0.5,
                borderRadius: 1,
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
                }
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
                style={{ width: "auto", height: "44px", objectFit: "contain" }}
              />
            </Box>
          </Stack>

          {/* Desktop Navigation */}
          <Box
            sx={{ flexGrow: 1, mx: 1, display: { xs: "none", md: "block" } }}
          >
            <Navigation />
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Cart */}
          {/* <CartDrawer /> */}
          {/* Universal Topbar Profile Action */}
          {mounted && user ? (
            <AccountMenu />
          ) : (
            <>
              <IconButton
                onClick={handleAuthMenuClick}
                size="small"
                sx={{
                  ml: 1,
                  p: 0.75,
                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  borderRadius: 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                    transform: "scale(1.05)",
                  },
                }}
              >
                <PersonOutline sx={{ fontSize: 22, color: "text.secondary" }} />
              </IconButton>
              <Menu
                anchorEl={anchorElAuth}
                open={authMenuOpen}
                onClose={handleAuthMenuClose}
                onClick={handleAuthMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      overflow: "visible",
                      boxShadow: "none",
                      mt: 1.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      "&::before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                        borderLeft: "1px solid",
                        borderTop: "1px solid",
                        borderColor: "divider",
                      },
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={handleAuthMenuClose}
                  component={Link}
                  href="/auth/sign-in"
                  sx={{ py: 1, px: 2, fontWeight: 700, fontSize: "0.875rem", mx: 0.5, borderRadius: 1 }}
                >
                  <Login
                    sx={{
                      mr: 1.5,
                      fontSize: "1.2rem",
                      color: "text.secondary",
                    }}
                  />{" "}
                  Sign In
                </MenuItem>
                <Divider sx={{ my: 0.5, mx: 1, opacity: 0.5 }} />
                <MenuItem
                  onClick={handleAuthMenuClose}
                  component={Link}
                  href="/auth/sign-up"
                  sx={{ py: 1, px: 2, fontWeight: 700, fontSize: "0.875rem", mx: 0.5, borderRadius: 1 }}
                >
                  <PersonAdd
                    sx={{
                      mr: 1.5,
                      fontSize: "1.2rem",
                      color: "text.secondary",
                    }}
                  />{" "}
                  Sign Up
                </MenuItem>
                <Divider sx={{ my: 0.5, mx: 1, opacity: 0.5 }} />
                <MenuItem
                  onClick={() => {
                    dispatch(toggleTheme());
                    handleAuthMenuClose();
                  }}
                  sx={{ py: 1, px: 2, fontWeight: 700, fontSize: "0.875rem", mx: 0.5, borderRadius: 1 }}
                >
                  {mode === "dark" ? (
                    <LightModeOutlined
                      sx={{
                        mr: 1.5,
                        fontSize: "1.2rem",
                        color: "text.secondary",
                      }}
                    />
                  ) : (
                    <DarkModeOutlined
                      sx={{
                        mr: 1.5,
                        fontSize: "1.2rem",
                        color: "text.secondary",
                      }}
                    />
                  )}
                  {mode === "dark" ? "Light Mode" : "Dark Mode"}
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <SwipeableDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        onOpen={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            backdropFilter: "blur(24px)",
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.75),
            boxShadow: "none",
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
    </AppBar>
  );
}
