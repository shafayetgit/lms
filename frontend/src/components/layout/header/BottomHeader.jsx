"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
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
} from "@mui/material";
import {
  MenuOpen,
  Close,
  PersonAdd,
  Login,
  AccountCircle,
} from "@mui/icons-material";

import CButton from "@/components/CButton";
import CartDrawer from "./partials/CartDrawer";
import Navigation from "./partials/Navigation";
import AccountMenu from "./partials/AccountMenu";
import SignOut from "./partials/SignOut";

const navItems = [
  { label: "Home", url: "/" },
  { label: "Courses", url: "/courses" },
  { label: "E-Books", url: "/ebooks" },
  { label: "About", url: "/about" },
  { label: "Contact", url: "/contact" },
];

export default function TopBar({ dynamicColor }) {
  // const isAuth = useSelector((state) => state.app.isAuth);
  const isAuth = false;

  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Drawer Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2 }}
      >
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
          EcoFin Institute
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          <Close />
        </IconButton>
      </Stack>
      <Divider />

      {/* Navigation Links */}
      <Stack sx={{ flexGrow: 1, p: 2 }} spacing={1.5}>
        {navItems.map((item, index) => (
          <CButton
            key={index}
            label={item.label}
            component={Link}
            href={item.url}
            onClick={handleDrawerToggle}
            fullWidth
            variant="text"
            sx={{
              justifyContent: "flex-start",
              fontWeight: 600,
              color: "text.primary",
              borderRadius: 2,
              px: 2,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          />
        ))}
      </Stack>
      <Divider />

      {/* Auth Buttons */}
      <Box sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          {!isAuth ? (
            <>
              <CButton
                label="Sign In"
                component={Link}
                href="/user/auth/sign-in"
                fullWidth
                variant="contained"
                startIcon={<Login />}
                sx={{ py: 1.2, fontWeight: 600 }}
              />
              <CButton
                label="Sign Up"
                component={Link}
                href="/signup"
                fullWidth
                variant="outlined"
                startIcon={<PersonAdd />}
                sx={{ py: 1.2, fontWeight: 600 }}
              />
            </>
          ) : (
            <>
              <CButton
                label="Profile"
                component={Link}
                href="/profile"
                fullWidth
                variant="contained"
                startIcon={<AccountCircle />}
                sx={{ py: 1.2, fontWeight: 600 }}
              />
              <SignOut />
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );

  return (
    <AppBar
      component="nav"
      position="sticky"
      // sx={{ background: "#fff", boxShadow: "none", top: 0 }}
      sx={{ background: dynamicColor, boxShadow: "none", top: 0 }}
    >
      <Container maxWidth="lg" sx={{ py: 1 }}>
        <Toolbar disableGutters>
          <Stack direction="row" alignItems="center" flexGrow={1}>
            {/* Mobile menu button */}
            <CButton
              edge="start"
              onClick={handleDrawerToggle}
              icon={<MenuOpen color="primary" />}
              iconButton
              sx={{ display: { xs: "block", sm: "none" }, mr: 1 }}
            />

            {/* Logo */}
            <Box
              component={Link}
              href="/"
              sx={{
                color: "text.primary",
                fontWeight: 800,
                fontSize: { xs: "1rem", md: "1.25rem" },
                letterSpacing: "-0.01em",
                cursor: "pointer",
                userSelect: "none",
                textDecoration: "none",
              }}
            >
              EcoFin Institute
            </Box>
          </Stack>

          {/* Desktop Navigation */}
          <Box
            sx={{ flexGrow: 1, mx: 1, display: { xs: "none", sm: "block" } }}
          >
            <Navigation />
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Cart */}
          <CartDrawer />
          <IconButton
            component={Link}
            href="/accounts/profile"
            size="small"
            sx={{
              ml: 1,
              transition: "all 0.2s ease",
              "&:hover": { transform: "scale(1.05)" }
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                border: "2px solid",
                borderColor: "rgba(0,0,0,0.06)",
                bgcolor: "rgba(0,0,0,0.03)",
                color: "primary.main",
                fontSize: "1rem",
                fontWeight: 800
              }}
            >
              U
            </Avatar>
          </IconButton>
          {/* <AccountMenu /> */}

          {/* Auth */}
          {/* {isAuth ? (
            <AccountMenu />
          ) : (
            <Box sx={{ display: { xs: "none", md: "block" }, ml: 2 }}>
              <Stack direction="row" spacing={1}>
                <CButton
                  label="Sign In"
                  component={Link}
                  href="/accounts/auth/signin"
                  variant="outlined"
                />
                <CButton
                  label="Sign Up"
                  component={Link}
                  href="/accounts/auth/signin"
                  // variant="outlined"
                />
              </Stack>
            </Box>
          )} */}
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
