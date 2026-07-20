"use client";
import React from "react";
import { Box, Typography, Button, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";

const EbookCTA = () => {
    const theme = useTheme();

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{
                mt: 12,
                p: { xs: 6, md: 10 },
                borderRadius: 1,
                textAlign: "center",
                overflow: "hidden",
                position: "relative",
                bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
                backgroundImage: (theme) => theme.palette.mode === "dark" 
                    ? "radial-gradient(circle at top center, rgba(255,255,255,0.05) 0%, transparent 70%)"
                    : "radial-gradient(circle at top center, rgba(0,0,0,0.03) 0%, transparent 70%)",
                border: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
            }}
        >


            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography
                    variant="h2"
                    sx={{
                        fontWeight: 900,
                        letterSpacing: "-0.04em",
                        mb: 3,
                        color: "text.primary"
                    }}
                >
                    Unlock the Full Library
                </Typography>

                <Typography
                    sx={{
                        mb: 6,
                        color: "text.secondary",
                        fontWeight: 400,
                        fontSize: "1.25rem",
                        maxWidth: 650,
                        mx: "auto",
                        lineHeight: 1.6,
                        letterSpacing: "-0.01em"
                    }}
                >
                    Get lifetime access to every guide, template, and manual for one simple price. <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>Upgrade your career today.</Box>
                </Typography>

                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        borderRadius: 1,
                        px: 4,
                        py: 1.2,
                        fontSize: "0.95rem",
                        fontWeight: 900,
                    }}
                >
                    Become a Member - $199
                </Button>
            </Box>
        </Box>
    );
};

export default EbookCTA;
