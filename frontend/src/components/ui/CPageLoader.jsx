"use client";
import React from "react";
import { Box, Typography, Stack, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";

/**
 * CPageLoader Component
 * A premium, animated loading component featuring the EcoFin circle logo.
 *
 * @param {boolean} fullPage - If true, covers the entire screen.
 * @param {string} label - Optional text to display below the loader.
 */
export default function CPageLoader({ fullPage = true, label = "Loading..." }) {
    const theme = useTheme();
    const navy = theme.palette.primary.main;
    const navyLight = theme.palette.primary.light;

    const loaderContent = (
        <Stack
            alignItems="center"
            justifyContent="center"
            spacing={3.5}
            sx={{
                width: "100%",
                height: fullPage ? "80vh" : "100%",
                minHeight: fullPage ? "none" : "60vh",
                flexGrow: 1,
                zIndex: 9999,
                position: "relative",
            }}
        >
            {/* Logo Container with Orbiting Rings */}
            <Box sx={{ position: "relative", width: 160, height: 160 }}>

                {/* Ambient Glow Pulse */}
                <Box
                    component={motion.div}
                    animate={{
                        scale: [1, 1.35, 1],
                        opacity: [0.15, 0.05, 0.15],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    sx={{
                        position: "absolute",
                        inset: -20,
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${navy} 0%, transparent 70%)`,
                        zIndex: 0,
                    }}
                />

                {/* Outer Orbit Ring — clockwise */}
                <Box
                    component={motion.div}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    sx={{
                        position: "absolute",
                        inset: -6,
                        borderRadius: "50%",
                        border: "2.5px solid transparent",
                        borderTopColor: navy,
                        borderRightColor: navy,
                        opacity: 0.6,
                        zIndex: 1,
                    }}
                />

                {/* Inner Orbit Ring — counter-clockwise */}
                <Box
                    component={motion.div}
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    sx={{
                        position: "absolute",
                        inset: 4,
                        borderRadius: "50%",
                        border: "2px solid transparent",
                        borderBottomColor: navyLight,
                        borderLeftColor: navyLight,
                        opacity: 0.45,
                        zIndex: 1,
                    }}
                />

                {/* Orbiting Dot */}
                <Box
                    component={motion.div}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    sx={{
                        position: "absolute",
                        inset: -6,
                        borderRadius: "50%",
                        zIndex: 2,
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: navy,
                            boxShadow: `0 0 10px 2px ${navy}`,
                        }}
                    />
                </Box>

                {/* Logo Seal */}
                <Box
                    component={motion.div}
                    animate={{ scale: [0.97, 1.03, 0.97] }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        overflow: "hidden",
                        bgcolor: "white",
                        boxShadow: `0 8px 32px rgba(26, 39, 87, 0.12)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    <Image
                        src="/images/ecofin-logo-circle.png"
                        alt="EcoFin Logo"
                        fill
                        style={{ objectFit: "contain", padding: "18px" }}
                        priority
                    />
                </Box>
            </Box>

            {/* Loading Dots */}
            <Stack direction="row" spacing={1} alignItems="center">
                {[0, 1, 2].map((i) => (
                    <Box
                        key={i}
                        component={motion.div}
                        animate={{
                            y: [0, -8, 0],
                            opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.15,
                        }}
                        sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            bgcolor: navy,
                        }}
                    />
                ))}
            </Stack>

            {/* Label Text */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 700,
                        color: "text.secondary",
                        letterSpacing: 3,
                        textTransform: "uppercase",
                        opacity: 0.55,
                        fontSize: "0.7rem",
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
                    background: theme.palette.background.paper,
                }}
            >
                {loaderContent}
            </motion.div>
        );
    }

    return loaderContent;
}
