"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Drawer,
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
  Login,
  AccountCircle,
  Home,
  MenuBook,
  Info,
  ChevronRight,
  LibraryBooks,
  ContactSupport,
} from "@mui/icons-material";
import { motion } from "framer-motion";

import CButton from "@/components/ui/CButton";
import CartDrawer from "./partials/CartDrawer";
import Navigation from "./partials/Navigation";
import AccountMenu from "@/components/ui/AccountMenu";
import SignOut from "./partials/SignOut";
import { LOGO, LOGO_HEIGHT, LOGO_WIDTH } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth/client";
import Image from "next/image";

const navItems = [
  { label: "Home", url: "/", icon: Home },
  { label: "Courses", url: "/courses", icon: MenuBook },
  { label: "E-Books", url: "/ebooks", icon: LibraryBooks },
  { label: "About", url: "/about", icon: Info },
  { label: "Contact", url: "/contact", icon: ContactSupport },
];

export default function Topbar({ dynamicColor }) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  // Hydration-safe auth state
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setMounted(true);
    setUser(getCurrentUser());
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
        bgcolor: "background.paper",
        backgroundImage: (theme) =>
          `linear-gradient(${alpha(theme.palette.secondary.main, 0.02)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(theme.palette.secondary.main, 0.02)} 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        position: "relative",
      }}
    >
      {/* Minimalist Premium Header */}
      <Box sx={{ p: 4, pt: 6 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Box component={Link} href="/" onClick={handleDrawerToggle}>
              <Image
                src={LOGO}
                width={LOGO_WIDTH}
                height={LOGO_HEIGHT}
                alt="Logo"
                style={{ width: "auto", height: "48px" }}
              />
            </Box>
          </motion.div>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
              color: "text.primary",
              p: 1.5,
              borderRadius: 3,
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
              },
            }}
          >
            <Close sx={{ fontSize: 22 }} />
          </IconButton>
        </Stack>
        <Box sx={{ mt: 5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "secondary.main",
              letterSpacing: "-0.04em",
            }}
          >
            Navigation
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mt: 1, fontWeight: 500 }}
          >
            Welcome to the EcoFin Elite Terminal
          </Typography>
        </Box>
      </Box>

      {/* Refined Navigation Links */}
      <Box sx={{ flexGrow: 1, px: 3, mt: 2 }}>
        <Stack spacing={0.5}>
          {navItems.map((item, index) => {
            const isActive = pathname === item.url;
            return (
              <Box
                key={index}
                component={motion.div}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Box
                  component={Link}
                  href={item.url}
                  onClick={handleDrawerToggle}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2.5,
                    px: 3,
                    py: 2.2,
                    borderRadius: 3.5,
                    textDecoration: "none",
                    position: "relative",
                    overflow: "hidden",
                    color: isActive ? "primary.main" : "text.secondary",
                    bgcolor: (theme) =>
                      isActive
                        ? alpha(theme.palette.primary.main, 0.04)
                        : "transparent",
                    border: (theme) =>
                      isActive
                        ? `1px solid ${alpha(theme.palette.text.primary, 0.06)}`
                        : "1px solid transparent",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: (theme) =>
                        isActive
                          ? alpha(theme.palette.primary.main, 0.06)
                          : alpha(theme.palette.text.primary, 0.03),
                      transform: "translateX(8px)",
                      color: "primary.main",
                    },
                  }}
                >
                  {/* Left Active Indicator */}
                  {isActive && (
                    <Box
                      component={motion.div}
                      layoutId="drawerIndicator"
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: "20%",
                        bottom: "20%",
                        width: 5,
                        borderRadius: "50px",
                        bgcolor: "secondary.main",
                        boxShadow: (theme) =>
                          `0 4px 15px ${alpha(theme.palette.secondary.main, 0.25)}`,
                        zIndex: -1,
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      color: isActive ? "secondary.main" : "text.disabled",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s",
                      transform: isActive ? "scale(1.1)" : "none",
                    }}
                  >
                    <item.icon sx={{ fontSize: 26 }} />
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: isActive ? 900 : 600,
                      fontSize: "1.15rem",
                      flexGrow: 1,
                      letterSpacing: "-0.03em",
                      transition: "all 0.3s",
                    }}
                  >
                    {item.label}
                  </Typography>

                  <ChevronRight
                    sx={{
                      fontSize: 18,
                      opacity: isActive ? 1 : 0.3,
                      transform: isActive
                        ? "translateX(0)"
                        : "translateX(-5px)",
                      transition: "all 0.3s ease",
                      color: isActive ? "primary.main" : "inherit",
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Seamless Action Footer */}
      <Box sx={{ p: 4, pt: 2 }}>
        {!mounted || !user ? (
          <Stack spacing={2}>
            <CButton
              label="Sign In"
              component={Link}
              href="/sign-in"
              onClick={handleDrawerToggle}
              fullWidth
              variant="contained"
              sx={{
                py: 2.2,
                fontWeight: 900,
                borderRadius: 4,
                bgcolor: "secondary.main",
                fontSize: "1rem",
                boxShadow: (theme) =>
                  `0 10px 30px ${alpha(theme.palette.secondary.main, 0.2)}`,
              }}
            />
            <Stack direction="row" spacing={2}>
              <CButton
                label="Register"
                component={Link}
                href="/sign-up"
                onClick={handleDrawerToggle}
                fullWidth
                variant="outlined"
                sx={{
                  py: 1.8,
                  fontWeight: 800,
                  borderRadius: 4,
                  borderColor: (theme) =>
                    alpha(theme.palette.text.primary, 0.08),
                  color: "text.primary",
                }}
              />
              <CButton
                label="My Panel"
                component={Link}
                href="/panel"
                onClick={handleDrawerToggle}
                fullWidth
                variant="text"
                sx={{
                  py: 1.8,
                  fontWeight: 800,
                  borderRadius: 4,
                  color: "text.secondary",
                }}
              />
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <CButton
              label="Student Panel"
              component={Link}
              href="/panel"
              onClick={handleDrawerToggle}
              fullWidth
              variant="contained"
              color="secondary"
              sx={{
                py: 2.2,
                fontWeight: 900,
                borderRadius: 4,
                color: "white",
                fontSize: "1rem",
                boxShadow: (theme) =>
                  `0 10px 30px ${alpha(theme.palette.secondary.main, 0.25)}`,
              }}
            />
            <SignOut fullWidth />
          </Stack>
        )}
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
            {/* Mobile menu button */}
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                display: { xs: "flex", md: "none" },
                mr: 1,
                color: "text.primary",
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
                },
              }}
            >
              <MenuOpen />
            </IconButton>

            {/* Logo */}
            <Box
              component={Link}
              href="/"
              sx={{
                color: "text.primary",
                fontWeight: 600,
                fontSize: { xs: "1rem", md: "1.25rem" },
                letterSpacing: 0.5,
                textTransform: "capitalize",
                cursor: "pointer",
                userSelect: "none",
                textDecoration: "none",
              }}
            >
              {/* <Box
                component="img"
                src={LOGO}
                alt="logo"
                sx={{ height: { xs: 40, md: 55 }, width: "auto" }}
              /> */}

              {/* <Image
                src={LOGO}
                width={100}
                height={69}
                alt="Logo"
                style={{ width: "60px", height: "auto" }}
              /> */}

              <Image
                src={LOGO}
                width={LOGO_WIDTH}
                height={LOGO_HEIGHT}
                alt="Logo"
                style={{ width: "auto", height: "auto" }}
                priority
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
          <CartDrawer />
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
                  p: 0.5,
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    borderColor: (theme) =>
                      alpha(theme.palette.text.primary, 0.2),
                    bgcolor: (theme) => alpha(theme.palette.text.primary, 0.02),
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    border: "2px solid",
                    borderColor: (theme) =>
                      alpha(theme.palette.text.primary, 0.06),
                    bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
                    color: "primary.main",
                    fontSize: "0.9rem",
                    fontWeight: 800,
                  }}
                ></Avatar>
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
                      filter: (theme) =>
                        `drop-shadow(0px 4px 20px ${alpha(theme.palette.text.primary, 0.08)})`,
                      mt: 1.5,
                      borderRadius: 3,
                      border: (theme) =>
                        `1px solid ${alpha(theme.palette.text.primary, 0.04)}`,
                      "&:before": {
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
                      },
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={handleAuthMenuClose}
                  component={Link}
                  href="/auth/sign-in"
                  sx={{ py: 1.5, px: 4, fontWeight: 700 }}
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
                <Divider sx={{ my: 0 }} />
                <MenuItem
                  onClick={handleAuthMenuClose}
                  component={Link}
                  href="/auth/sign-up"
                  sx={{ py: 1.5, px: 4, fontWeight: 700 }}
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
              </Menu>
            </>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
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
      </Drawer>
    </AppBar>
  );
}
