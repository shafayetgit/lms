"use client";
import React from "react";
import { Box, Typography, Button } from "@mui/material";

const EbookCTA = () => {
    return (
        <Box
            sx={{
                mt: 12,
                p: { xs: 6, md: 10 },
                borderRadius: 10,
                bgcolor: "primary.main",
                color: "white",
                textAlign: "center",
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 40px 80px rgba(30, 45, 68, 0.25)"
            }}
        >
            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-0.03em", mb: 3, color: "white" }}>
                    Unlock the Full Library
                </Typography>
                <Typography sx={{ mb: 6, opacity: 0.8, fontWeight: 500, fontSize: "1.2rem", maxWidth: 600, mx: "auto" }}>
                    Get lifetime access to every guide, template, and manual for one simple price. Upgrade your engineering career today.
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        bgcolor: "secondary.main",
                        color: "white",
                        borderRadius: "50px",
                        px: 6,
                        py: 2.5,
                        fontSize: "1.1rem",
                        fontWeight: 900,
                        "&:hover": { bgcolor: "secondary.dark", transform: "scale(1.05)" },
                        transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    }}
                >
                    Become a Member - $199
                </Button>
            </Box>
            {/* Decorative Background Elements */}
            <Box sx={{
                position: "absolute",
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                borderRadius: "50%",
                background: "rgba(118, 184, 42, 0.1)",
                filter: "blur(60px)"
            }} />
            <Box sx={{
                position: "absolute",
                bottom: -50,
                left: -50,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(118, 184, 42, 0.05)",
                filter: "blur(40px)"
            }} />
        </Box>
    );
};

export default EbookCTA;
