"use client";
import React from "react";
import { Box, Typography, Stack, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CSpinner Component
 * A premium, animated loading component featuring the EcoFin circle logo.
 * 
 * @param {boolean} fullPage - If true, covers the entire screen.
 * @param {string} label - Optional text to display below the loader.
 */
export default function CSpinner({ fullPage = true, label = "Loading Elite Content..." }) {
    const theme = useTheme();

    const loaderContent = (
        <Stack
            alignItems="center"
            justifyContent="center"
            spacing={4}
            sx={{
                width: "100%",
                height: fullPage ? "100vh" : "100%",
                bgcolor: fullPage ? "background.paper" : "transparent",
                zIndex: 9999,
                position: "relative"
            }}
        >
            <Box sx={{ position: "relative", width: 140, height: 140 }}>
                {/* Outer Rotating Rim */}
                <Box
                    component={motion.div}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        border: "3px solid transparent",
                        borderTopColor: "secondary.main", // Elite Green
                        borderBottomColor: "secondary.main",
                        opacity: 0.4
                    }}
                />

                {/* Second Pulse Layer */}
                <Box
                    component={motion.div}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    sx={{
                        position: "absolute",
                        inset: -10,
                        borderRadius: "50%",
                        bgcolor: "secondary.main",
                        filter: "blur(20px)",
                        zIndex: -1
                    }}
                />

                {/* Logo Seal */}
                <Box
                    component={motion.div}
                    animate={{ scale: [0.95, 1.05, 0.95] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        overflow: "hidden",
                        bgcolor: "white",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 1.5
                    }}
                >
                    <Box
                        component="img"
                        src="/images/ecofin-circle-logo.png"
                        alt="EcoFin Logo"
                        sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain"
                        }}
                    />
                </Box>
            </Box>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 800,
                        color: "text.secondary",
                        letterSpacing: 4,
                        textTransform: "uppercase",
                        opacity: 0.6
                    }}
                >
                    {label}
                </Typography>
            </motion.div>
        </Stack>
    );

    if (fullPage) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 10000,
                    background: theme.palette.background.paper
                }}
            >
                {loaderContent}
            </motion.div>
        );
    }

    return loaderContent;
}
