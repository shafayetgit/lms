"use client";
import React from "react";
import { Box, Typography, Stack, useTheme, alpha } from "@mui/material";
import { Refresh, Home, ErrorOutline } from "@mui/icons-material";
import CButton from "@/components/ui/CButton";

/**
 * CError Component
 * A clean, standard error state component with optional retry and home actions.
 *
 * @param {string}   title       - Main error heading.
 * @param {string}   message     - Descriptive error message.
 * @param {function} onRetry     - Callback for the "Try Again" button.
 * @param {boolean}  showHome    - Whether to show "Go Home" button.
 * @param {boolean}  fullPage    - If true, occupies full viewport height.
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

    return (
        <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
                width: "100%",
                minHeight: fullPage ? "70vh" : 320,
                py: 4,
                px: 2,
                textAlign: "center",
                ...sx,
            }}
        >
            <Box
                sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                }}
            >
                <ErrorOutline sx={{ fontSize: 40 }} />
            </Box>

            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                {title}
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 420, mb: 3 }}
            >
                {message}
            </Typography>

            <Stack direction="row" spacing={1.5} justifyContent="center">
                {onRetry && (
                    <CButton
                        variant="contained"
                        startIcon={<Refresh />}
                        onClick={onRetry}
                    >
                        Try Again
                    </CButton>
                )}
                {showHome && (
                    <CButton
                        variant="outlined"
                        startIcon={<Home />}
                        href="/"
                    >
                        Go Home
                    </CButton>
                )}
            </Stack>
        </Stack>
    );
}
