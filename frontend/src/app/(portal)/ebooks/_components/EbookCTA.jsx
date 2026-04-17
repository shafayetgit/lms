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
                borderRadius: 12,
                bgcolor: "primary.main",
                color: "white",
                textAlign: "center",
                overflow: "hidden",
                position: "relative",
                boxShadow: (theme) => `0 40px 100px ${alpha(theme.palette.primary.main, 0.4)}`,
                border: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
        >
            {/* Background Glows */}
            <Box sx={{
                position: "absolute",
                top: "-20%",
                right: "-10%",
                width: 400,
                height: 400,
                borderRadius: "50%",
                background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 70%)`,
                filter: "blur(60px)",
                zIndex: 0
            }} />

            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography
                    variant="h2"
                    sx={{
                        fontWeight: 900,
                        letterSpacing: "-0.04em",
                        mb: 3,
                        color: "white",
                        background: (theme) => `linear-gradient(to bottom, #FFFFFF 0%, ${alpha("#FFFFFF", 0.7)} 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}
                >
                    Unlock the Full Library
                </Typography>

                <Typography
                    sx={{
                        mb: 6,
                        color: alpha(theme.palette.common.white, 0.95), // Enhanced opacity for legibility
                        fontWeight: 400,
                        fontSize: "1.25rem",
                        maxWidth: 650,
                        mx: "auto",
                        lineHeight: 1.6,
                        letterSpacing: "-0.01em"
                    }}
                >
                    Get lifetime access to every guide, template, and manual for one simple price. <Box component="span" sx={{ color: "secondary.light", fontWeight: 700 }}>Upgrade your engineering career today.</Box>
                </Typography>

                <Button
                    variant="contained"
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{
                        bgcolor: "secondary.main",
                        color: "white",
                        borderRadius: "100px",
                        px: 8,
                        py: 2.5,
                        fontSize: "1.1rem",
                        fontWeight: 900,
                        boxShadow: (theme) => `0 15px 35px ${alpha(theme.palette.secondary.main, 0.4)}`,
                        "&:hover": {
                            bgcolor: "secondary.dark",
                        },
                        transition: "all 0.3s ease"
                    }}
                >
                    Become a Member - $199
                </Button>
            </Box>
        </Box>
    );
};

export default EbookCTA;
