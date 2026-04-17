"use client";
import React from "react";
import { Box, alpha } from "@mui/material";
import { motion } from "framer-motion";

const HeroBackground = () => {
    return (
        <>
            <Box
                component={motion.div}
                animate={{ y: [0, -20, 0], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                sx={{
                    position: "absolute",
                    top: "-15%",
                    right: "-5%",
                    width: "500px",
                    height: "500px",
                    borderRadius: "50%",
                    background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.text.primary, 0.03)} 0%, transparent 70%)`,
                    filter: "blur(60px)",
                    zIndex: 0,
                }}
            />
            <Box
                component={motion.div}
                animate={{ y: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                sx={{
                    position: "absolute",
                    bottom: "-10%",
                    left: "-10%",
                    width: "400px",
                    height: "400px",
                    borderRadius: "50%",
                    background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.text.primary, 0.04)} 0%, transparent 70%)`,
                    filter: "blur(50px)",
                    zIndex: 0,
                }}
            />
        </>
    );
};

export default HeroBackground;
