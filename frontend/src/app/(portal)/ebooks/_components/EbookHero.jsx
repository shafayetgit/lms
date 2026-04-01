"use client";
import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { AutoStories } from "@mui/icons-material";
import { motion } from "framer-motion";

const EbookHero = () => {
    return (
        <Box sx={{ mb: 8, textAlign: "center" }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Chip
                    icon={<AutoStories sx={{ fontSize: "1rem !important", color: "inherit !important" }} />}
                    label="Now Live: Premium Library"
                    color="secondary"
                    variant="outlined"
                    sx={{
                        mb: 3,
                        fontWeight: 800,
                        borderRadius: "50px",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "1px",
                        px: 1,
                        borderColor: "secondary.main"
                    }}
                />
                <Typography
                    variant="h1"
                    sx={{
                        fontWeight: 900,
                        letterSpacing: "-0.04em",
                        mb: 2,
                        fontSize: { xs: "2.5rem", md: "4.5rem" },
                        lineHeight: 1.1,
                        color: "primary.main"
                    }}
                >
                    The Elite Library
                </Typography>
                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                        maxWidth: 700,
                        mx: "auto",
                        mb: 6,
                        fontWeight: 500,
                        fontSize: { xs: "1rem", md: "1.25rem" }
                    }}
                >
                    Master your craft with our curated selection of high-conversion digital guides and industry-tier architecture manuals.
                </Typography>
            </motion.div>
        </Box>
    );
};

export default EbookHero;
