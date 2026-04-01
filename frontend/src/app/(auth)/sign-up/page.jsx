"use client";
import React, { useState } from "react";
import {
    Container, Box, Typography, TextField, Button,
    Stack, Divider, IconButton, InputAdornment
} from "@mui/material";
import { Visibility, VisibilityOff, Google } from "@mui/icons-material";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignUpPage() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", py: 8 }}>
            <Container maxWidth="sm">
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    sx={{
                        bgcolor: "background.paper",
                        p: { xs: 4, md: 6 },
                        borderRadius: 6,
                        boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                        border: "1px solid rgba(0,0,0,0.04)"
                    }}
                >
                    <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                            color: "text.primary",
                            textAlign: "center",
                            mb: 1
                        }}
                    >
                        Create an Account
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mb: 4 }}>
                        Join E-Courses and accelerate your career.
                    </Typography>

                    <form noValidate autoComplete="off">
                        <Stack spacing={3} sx={{ mb: 4 }}>
                            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    variant="outlined"
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                                />
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    variant="outlined"
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                                />
                            </Box>
                            <TextField
                                fullWidth
                                label="Email Address"
                                variant="outlined"
                                type="email"
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                variant="outlined"
                                type={showPassword ? "text" : "password"}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                            />
                        </Stack>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{
                                py: 1.5,
                                borderRadius: "50px",
                                fontWeight: 700,
                                fontSize: "1rem",
                                bgcolor: "text.primary",
                                color: "background.paper",
                                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                                "&:hover": {
                                    transform: "translateY(-2px)",
                                    bgcolor: "text.primary",
                                    boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                                },
                                transition: "all 0.3s ease",
                                mb: 3
                            }}
                        >
                            Sign Up
                        </Button>
                    </form>

                    <Divider sx={{ mb: 3, color: "text.secondary", fontSize: "0.875rem", fontWeight: 500 }}>
                        OR CONTINUE WITH
                    </Divider>

                    <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Google />}
                            sx={{
                                py: 1.2,
                                borderRadius: "50px",
                                fontWeight: 600,
                                color: "text.primary",
                                borderColor: "rgba(0,0,0,0.15)",
                                "&:hover": { borderColor: "text.primary", bgcolor: "rgba(0,0,0,0.02)" }
                            }}
                        >
                            Google
                        </Button>
                    </Stack>

                    <Typography variant="body2" align="center" color="text.secondary">
                        Already have an account?{" "}
                        <Typography
                            component={Link}
                            href="/sign-in"
                            variant="body2"
                            sx={{ color: "text.primary", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                        >
                            Sign in here
                        </Typography>
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
