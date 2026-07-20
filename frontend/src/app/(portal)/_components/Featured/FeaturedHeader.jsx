"use client";
import React from "react";
import { Box, Typography, alpha } from "@mui/material";
import { motion } from "framer-motion";
import CButton from "@/components/ui/CButton";

import Link from "next/link";

const FeaturedHeader = () => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "center", md: "flex-end" },
                textAlign: { xs: "center", md: "left" },
                gap: { xs: 3, md: 4 },
                mb: { xs: 4, md: 6 }
            }}
        >
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        fontWeight: 800,
                        mb: 2,
                    }}
                >
                    Featured Courses
                </Typography>
                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ maxWidth: 600 }}
                >
                    Advance your career with our curated selection of premium, expert-led training programs.
                </Typography>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <CButton
                    component={Link}
                    href="/courses"
                    label="Explore All Courses"
                    variant="outlined"
                    size="large"
                    sx={{
                        borderRadius: 1,
                        px: { xs: 3, md: 5 },
                        py: 1.5,
                        fontSize: "1rem",
                        textTransform: "none",
                        fontWeight: 700,
                        borderColor: (theme) => alpha(theme.palette.text.primary, 0.15),
                        color: "text.primary",
                        "&:hover": {
                            borderColor: "text.primary",
                            bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
                        },
                    }}
                />
            </motion.div>
        </Box>
    );
};

export default FeaturedHeader;
