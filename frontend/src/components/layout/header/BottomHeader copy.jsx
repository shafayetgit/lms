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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import CButton from "@/components/CButton";
import CSearchField from "@/components/CSearchField";
import CartDrawer from "./partials/CartDrawer";
import Navigation from "./partials/Navigation";
import AccountMenu from "./partials/AccountMenu";
import SignOut from "./partials/SignOut";

const navItems = [
  { label: "Home", url: "/" },
  { label: "Courses", url: "/courses/list" },
  { label: "Contact", url: "/blog/tag/list" },
  { label: "About", url: "/about" },
];

export default function TopBar() {
  // const isAuth = useSelector((state) => state.app.isAuth);
  const isAuth = false;

  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const drawerContent = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Stack direction="column" alignItems="center" my={2}>
        {navItems.map((item, index) => (
          <CButton
            key={index}
            label={item.label}
            component={Link}
            href={item.url}
            variant="text"
            sx={{ fontWeight: "bold" }}
          />
        ))}
      </Stack>
      <Divider />
      <Stack direction="row" spacing={1} justifyContent="center" my={2}>
        {!isAuth ? (
          <>
            <CButton
              label="Sign In"
              component={Link}
              href="/user/auth/sign-in"
              sx={{ fontWeight: "bold" }}
            />
            <Divider orientation="vertical" flexItem />
            <CButton
              label="Sign Up"
              component={Link}
              href="/signup"
              sx={{ fontWeight: "bold" }}
            />
          </>
        ) : (
          <>
            <CButton
              label="Profile"
              component={Link}
              href="/profile"
              sx={{ fontWeight: "bold" }}
            />
            <Divider orientation="vertical" flexItem />
            <SignOut />
          </>
        )}
      </Stack>
    </Box>
  );

  return (
    <AppBar
      component="nav"
      position="sticky"
      sx={{ background: "#fff", boxShadow: "none", top: 0 }}
    >
      <Container maxWidth="lg" sx={{ py: 1 }}>
        <Toolbar disableGutters>
          <CButton
            edge="start"
            onClick={handleDrawerToggle}
            icon={<MenuIcon color="primary" />}
            iconButton
            sx={{ display: { md: "none" }, mr: 2 }}
          />

          <Box
            sx={{
              flexGrow: 1,
              mx: 1,
              color: "text.primary",
              fontWeight: 600,
              fontSize: { xs: "1rem", md: "1.25rem" },
              letterSpacing: 0.5,
              textTransform: "capitalize",
            }}
          >
            E-Courses
          </Box>

          <Box sx={{ flexGrow: 1, mx: 1 }}>
            <Navigation />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <CartDrawer />

          {isAuth ? (
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
              </Stack>
            </Box>
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
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {drawerContent}
        </Box>
      </Drawer>
    </AppBar>
  );
}
