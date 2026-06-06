"use client";
import React from "react";
import { Box, Typography, Stack, Button, useTheme, alpha } from "@mui/material";
import { motion } from "framer-motion";
import { Refresh, Home, ErrorOutline } from "@mui/icons-material";
import Image from "next/image";

/**
 * CError Component
 * A premium error state component with animated visuals and action buttons.
 *
 * @param {string}   title       - Main error heading.
 * @param {string}   message     - Descriptive error message.
 * @param {function} onRetry     - Callback for the "Try Again" button.
 * @param {boolean}  showHome    - Whether to show "Go Home" button.
 * @param {boolean}  fullPage    - If true, occupies the full viewport.
 * @param {object}   sx          - Additional styles for the root container.
 */
export default function CError({
    title = "Something Went Wrong",
    message = "An unexpected error occurred. Please try again or contact support if the problem persists.",
    onRetry,
    showHome = false,
    fullPage = true,
    sx = {},
}) {
    const theme = useTheme();
    const navy = theme.palette.primary.main;
    const errorColor = theme.palette.error.main;

    return (
        <Stack
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            alignItems="center"
            justifyContent="center"
            sx={{
                width: "100%",
                minHeight: fullPage ? "80vh" : 400,
                py: fullPage ? 0 : 6,
                px: 3,
                // bgcolor: fullPage ? "background.default" : "transparent",
                position: "relative",
                overflow: "hidden",
                ...sx,
            }}
        >

            <Stack
                alignItems="center"
                spacing={3}
                sx={{
                    position: "relative",
                    zIndex: 1,
                    maxWidth: 480,
                    textAlign: "center",
                }}
            >
                {/* Animated Error Icon Area */}
                <Box sx={{ position: "relative", width: 140, height: 140, mb: 1 }}>
                    {/* Pulsing background ring */}
                    <Box
                        component={motion.div}
                        animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.12, 0.04, 0.12],
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        sx={{
                            position: "absolute",
                            inset: -16,
                            borderRadius: "50%",
                            bgcolor: errorColor,
                            zIndex: 0,
                        }}
                    />

                    {/* Outer dashed ring */}
                    <Box
                        component={motion.div}
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        sx={{
                            position: "absolute",
                            inset: -4,
                            borderRadius: "50%",
                            border: `2px dashed ${alpha(errorColor, 0.25)}`,
                            zIndex: 1,
                        }}
                    />

                    {/* Logo container */}
                    <Box
                        component={motion.div}
                        animate={{ scale: [0.97, 1.02, 0.97] }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        sx={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            overflow: "hidden",
                            bgcolor: "white",
                            boxShadow: `0 8px 32px ${alpha(errorColor, 0.15)}`,
                            border: `2px solid ${alpha(errorColor, 0.12)}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            zIndex: 2,
                        }}
                    >
                        <Image
                            src="/images/ecofin-logo-circle.png"
                            alt="EcoFin Logo"
                            fill
                            style={{
                                objectFit: "contain",
                                padding: "18px",
                                filter: "grayscale(40%)",
                            }}
                            priority
                        />

                        {/* Error badge */}
                        <Box
                            component={motion.div}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 15,
                                delay: 0.3,
                            }}
                            sx={{
                                position: "absolute",
                                bottom: 4,
                                right: 4,
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                bgcolor: errorColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: `0 3px 12px ${alpha(errorColor, 0.4)}`,
                                zIndex: 3,
                            }}
                        >
                            <ErrorOutline
                                sx={{ color: "white", fontSize: 20 }}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            lineHeight: 1.3,
                        }}
                    >
                        {title}
                    </Typography>
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.secondary",
                            lineHeight: 1.7,
                            maxWidth: 380,
                            mx: "auto",
                        }}
                    >
                        {message}
                    </Typography>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <Stack
                        direction="row"
                        spacing={1.5}
                        justifyContent="center"
                        sx={{ mt: 1 }}
                    >
                        {onRetry && (
                            <Button
                                variant="contained"
                                startIcon={<Refresh />}
                                onClick={onRetry}
                                sx={{
                                    px: 3,
                                    py: 1,
                                    fontWeight: 600,
                                    borderRadius: 2.5,
                                    textTransform: "none",
                                    boxShadow: `0 4px 14px ${alpha(navy, 0.25)}`,
                                    "&:hover": {
                                        boxShadow: `0 6px 20px ${alpha(navy, 0.35)}`,
                                    },
                                }}
                            >
                                Try Again
                            </Button>
                        )}
                        {showHome && (
                            <Button
                                variant="outlined"
                                startIcon={<Home />}
                                href="/"
                                sx={{
                                    px: 3,
                                    py: 1,
                                    fontWeight: 600,
                                    borderRadius: 2.5,
                                    textTransform: "none",
                                    borderColor: alpha(navy, 0.3),
                                    color: navy,
                                    "&:hover": {
                                        borderColor: navy,
                                        bgcolor: alpha(navy, 0.04),
                                    },
                                }}
                            >
                                Go Home
                            </Button>
                        )}
                    </Stack>
                </motion.div>

                {/* Error code hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.55 }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: "text.disabled",
                            letterSpacing: 1.5,
                            textTransform: "uppercase",
                            fontSize: "0.65rem",
                            mt: 1,
                        }}
                    >
                        If this keeps happening, please contact support
                    </Typography>
                </motion.div>
            </Stack>
        </Stack>
    );
}
