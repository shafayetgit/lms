"use client";
import React from "react";
import { Box, Typography, alpha } from "@mui/material";
import { motion } from "framer-motion";
import CButton from "@/components/ui/CButton";

const FeaturedHeader = () => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "flex-end" },
                gap: 4,
                mb: 8
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
                    Unlock Your Potential
                </Typography>
                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ maxWidth: 600 }}
                >
                    Explore our curated list of featured courses, meticulously designed to
                    provide you with practical skills and recognized certifications.
                </Typography>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <CButton
                    label="Explore All Courses"
                    variant="outlined"
                    size="large"
                    sx={{
                        borderRadius: "50px",
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
