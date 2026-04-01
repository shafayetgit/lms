"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
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
} from "@mui/icons-material";
import { motion } from "framer-motion";

import CButton from "@/components/CButton";
import CartDrawer from "./partials/CartDrawer";
import Navigation from "./partials/Navigation";
import AccountMenu from "./partials/AccountMenu";
import SignOut from "./partials/SignOut";
import { logo } from "@/constants";

const navItems = [
    { label: "Home", url: "/", icon: Home },
    { label: "Courses", url: "/courses", icon: MenuBook },
    { label: "E-Books", url: "/ebooks", icon: LibraryBooks },
    { label: "About", url: "/about", icon: Info },
];

export default function Topbar({ dynamicColor }) {
    const pathname = usePathname();
    // const isAuth = useSelector((state) => state.app.isAuth);
    const isAuth = false;

    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

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
                backgroundImage: "linear-gradient(rgba(118, 184, 42, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(118, 184, 42, 0.02) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                position: "relative"
            }}
        >
            {/* Minimalist Premium Header */}
            <Box sx={{ p: 4, pt: 6 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Box component={Link} href="/" onClick={handleDrawerToggle}>
                            <Box component="img" src={logo} alt="logo" sx={{ height: 48, width: "auto" }} />
                        </Box>
                    </motion.div>
                    <IconButton
                        onClick={handleDrawerToggle}
                        sx={{
                            bgcolor: "rgba(0,0,0,0.03)",
                            color: "text.primary",
                            p: 1.5,
                            borderRadius: 3,
                            "&:hover": { bgcolor: "rgba(0,0,0,0.06)" }
                        }}
                    >
                        <Close sx={{ fontSize: 22 }} />
                    </IconButton>
                </Stack>
                <Box sx={{ mt: 5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: "-0.04em" }}>
                        Navigation
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1, fontWeight: 500 }}>
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
                                        px: 2.5,
                                        py: 2.4,
                                        borderRadius: 3,
                                        textDecoration: "none",
                                        color: isActive ? "primary.main" : "text.primary",
                                        bgcolor: isActive ? "rgba(30, 45, 68, 0.04)" : "transparent",
                                        transition: "all 0.3s",
                                        "&:hover": {
                                            bgcolor: "rgba(0,0,0,0.02)",
                                            transform: "translateX(6px)",
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            color: isActive ? "secondary.main" : "rgba(0,0,0,0.2)",
                                            transition: "all 0.3s"
                                        }}
                                    >
                                        <item.icon sx={{ fontSize: 24 }} />
                                    </Box>
                                    <Typography sx={{
                                        fontWeight: isActive ? 900 : 700,
                                        fontSize: "1.2rem",
                                        flexGrow: 1,
                                        letterSpacing: "-0.02em"
                                    }}>
                                        {item.label}
                                    </Typography>
                                    {isActive && (
                                        <motion.div layoutId="activeDot">
                                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "secondary.main" }} />
                                        </motion.div>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Stack>
            </Box>

            {/* Seamless Action Footer */}
            <Box sx={{ p: 4, pt: 2 }}>
                {!isAuth ? (
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
                                bgcolor: "primary.main",
                                fontSize: "1rem",
                                boxShadow: "0 10px 30px rgba(30, 45, 68, 0.2)"
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
                                    borderColor: "rgba(0,0,0,0.08)",
                                    color: "text.primary"
                                }}
                            />
                            <CButton
                                label="Portal"
                                component={Link}
                                href="/accounts/profile"
                                onClick={handleDrawerToggle}
                                fullWidth
                                variant="text"
                                sx={{
                                    py: 1.8,
                                    fontWeight: 800,
                                    borderRadius: 4,
                                    color: "text.secondary"
                                }}
                            />
                        </Stack>
                    </Stack>
                ) : (
                    <Stack spacing={2}>
                        <CButton
                            label="Access Terminal"
                            component={Link}
                            href="/accounts/profile"
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
                                boxShadow: "0 10px 30px rgba(118, 184, 42, 0.2)"
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
            sx={{
                background: dynamicColor,
                boxShadow: "none",
                // borderBottom: dynamicColor === "transparent" ? "1px solid transparent" : "1px solid rgba(0,0,0,0.04)",
                top: 0,
                transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
                backdropFilter: dynamicColor === "transparent" ? "none" : "blur(12px)",
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
                                bgcolor: "rgba(0,0,0,0.03)",
                                "&:hover": { bgcolor: "rgba(0,0,0,0.06)" }
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
                            <Box component="img" src={logo} alt="logo" sx={{ height: { xs: 40, md: 55 }, width: "auto" }} />
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
                    {isAuth ? (
                        <AccountMenu />
                    ) : (
                        <>
                            <IconButton
                                onClick={handleAuthMenuClick}
                                size="small"
                                sx={{
                                    ml: 1,
                                    p: 0.5,
                                    border: "1px solid rgba(0,0,0,0.08)",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                        borderColor: "rgba(0,0,0,0.2)",
                                        bgcolor: "rgba(0,0,0,0.02)",
                                    }
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        border: "2px solid",
                                        borderColor: "rgba(0,0,0,0.06)",
                                        bgcolor: "rgba(0,0,0,0.03)",
                                        color: "primary.main",
                                        fontSize: "0.9rem",
                                        fontWeight: 800
                                    }}
                                >

                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorElAuth}
                                open={authMenuOpen}
                                onClose={handleAuthMenuClose}
                                onClick={handleAuthMenuClose}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                PaperProps={{
                                    elevation: 0,
                                    sx: {
                                        overflow: 'visible',
                                        filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.08))',
                                        mt: 1.5,
                                        borderRadius: 3,
                                        border: '1px solid rgba(0,0,0,0.04)',
                                        '&:before': {
                                            content: '""',
                                            display: 'block',
                                            position: 'absolute',
                                            top: 0,
                                            right: 14,
                                            width: 10,
                                            height: 10,
                                            bgcolor: 'background.paper',
                                            transform: 'translateY(-50%) rotate(45deg)',
                                            zIndex: 0,
                                        },
                                    },
                                }}
                            >
                                <MenuItem onClick={handleAuthMenuClose} component={Link} href="/sign-in" sx={{ py: 1.5, px: 4, fontWeight: 700 }}>
                                    <Login sx={{ mr: 1.5, fontSize: "1.2rem", color: "text.secondary" }} /> Sign In
                                </MenuItem>
                                <Divider sx={{ my: 0 }} />
                                <MenuItem onClick={handleAuthMenuClose} component={Link} href="/sign-up" sx={{ py: 1.5, px: 4, fontWeight: 700 }}>
                                    <PersonAdd sx={{ mr: 1.5, fontSize: "1.2rem", color: "text.secondary" }} /> Sign Up
                                </MenuItem>
                                <Divider sx={{ my: 0 }} />
                                <MenuItem onClick={handleAuthMenuClose} component={Link} href="/accounts/profile" sx={{ py: 1.5, px: 4, fontWeight: 700 }}>
                                    <AccountCircle sx={{ mr: 1.5, fontSize: "1.2rem", color: "text.secondary" }} /> My Account
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
