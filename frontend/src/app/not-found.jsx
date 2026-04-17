"use client";
import React from "react";
import { Container, Box, Typography, Stack, useTheme, Grid, Divider, Paper } from "@mui/material";
import { Home, School, LibraryBooks, Info, Search, ArrowForward } from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";
import CButton from "@/components/ui/CButton";

export default function NotFound() {
    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 12,
                position: "relative",
                overflow: "hidden",
                textAlign: "center"
            }}
        >

            <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1, mt: -10 }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Box sx={{ position: "relative", mb: 4 }}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 900,
                                fontSize: { xs: "8rem", md: "12rem" },
                                lineHeight: 1,
                                color: "primary.main",
                                opacity: 0.08,
                                userSelect: "none"
                            }}
                        >
                            404
                        </Typography>
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: "100%"
                            }}
                        >
                            <Box
                                component={motion.div}
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                sx={{
                                    mx: "auto",
                                    width: 120,
                                    height: 120,
                                    borderRadius: 5,
                                    bgcolor: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
                                    border: "1px solid rgba(0,0,0,0.03)"
                                }}
                            >
                                <Search sx={{ fontSize: 60, color: "secondary.main" }} />
                            </Box>
                        </Box>
                    </Box>

                    <Typography
                        variant="overline"
                        sx={{
                            fontWeight: 800,
                            color: "secondary.main",
                            letterSpacing: 3,
                            mb: 1,
                            display: "block"
                        }}
                    >
                        PAGE NOT FOUND
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 900,
                            mb: 2,
                            fontSize: { xs: "2.5rem", md: "3.5rem" },
                            color: "primary.main",
                            letterSpacing: "-0.02em"
                        }}
                    >
                        Let's get you <br /> back on track.
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: "text.secondary",
                            mb: 6,
                            fontWeight: 400,
                            lineHeight: 1.6,
                            maxWidth: 480,
                            mx: "auto"
                        }}
                    >
                        We couldn't find the page you were looking for. It might have been moved or doesn't exist anymore, but we can help you find what you need.
                    </Typography>

                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        sx={{ justifyContent: "center" }}
                    >
                        <CButton
                            label="Return Home"
                            component={Link}
                            href="/"
                            variant="contained"
                            sx={{
                                px: 4,
                                py: 1.8,
                                borderRadius: "50px",
                                fontWeight: 800,
                                boxShadow: "0 10px 20px rgba(30, 45, 68, 0.1)"
                            }}
                        />
                        <CButton
                            label="Browse Courses"
                            component={Link}
                            href="/courses"
                            variant="outlined"
                            sx={{
                                px: 4,
                                py: 1.8,
                                borderRadius: "50px",
                                fontWeight: 800,
                                borderColor: "rgba(0,0,0,0.1)",
                                color: "text.primary",
                                "&:hover": { borderColor: "secondary.main" }
                            }}
                        />
                    </Stack>

                </motion.div>
            </Container>
        </Box>
    );
}
