"use client";
import React from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";

const HeroVisuals = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
            <Box
                sx={{
                    position: "relative",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: -15,
                        border: "2px dashed rgba(0,0,0,0.1)",
                        borderRadius: "32px",
                        zIndex: -1,
                    },
                }}
            >
                <Box
                    sx={{
                        position: "relative",
                        width: "100%",
                        height: { xs: 400, md: 550 },
                        borderRadius: "24px",
                        overflow: "hidden",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                    }}
                >
                    <Image
                        src="/images/banners/hero-girl.png"
                        alt="A smiling woman looking at a laptop"
                        fill
                        priority
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </Box>
            </Box>
        </motion.div>
    );
};

export default HeroVisuals;
