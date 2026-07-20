"use client";
import React from "react";
import { Box, Typography, Stack, useTheme, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";
import CButton from "@/components/ui/CButton";

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
};

const AboutCTA = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={itemVariants}
        >
            <Box sx={{ my: { xs: 6, md: 8 }, textAlign: "center" }}>
                <Typography
                    variant="h3"
                    gutterBottom
                    sx={{ fontWeight: 800, color: "text.primary" }}
                >
                    Ready to Begin Your Journey?
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" alignItems="center" mt={5}>
                    <CButton
                        label="Explore Courses"
                        variant="contained"
                        size={isMobile ? "medium" : "large"}
                        href="/courses"
                        fullWidth={isMobile}
                        color="secondary"
                        sx={{
                            borderRadius: 1,
                            px: { xs: 4, md: 5 },
                            py: { xs: 1.5, md: 2 },
                            fontWeight: 700,
                            boxShadow: "none",
                            "&:hover": {
                                transform: "translateY(-2px)",
                            },
                        }}
                    />
                    <CButton
                        label="Contact Us"
                        variant="outlined"
                        href="/contact"
                        size={isMobile ? "medium" : "large"}
                        fullWidth={isMobile}
                        sx={{
                            borderRadius: 1,
                            px: { xs: 4, md: 5 },
                            py: { xs: 1.5, md: 2 },
                            fontWeight: 700,
                            borderColor: "divider",
                            color: "text.primary",
                            "&:hover": {
                                borderColor: "text.primary",
                                bgcolor: "action.hover",
                                transform: "translateY(-2px)",
                            },
                        }}
                    />
                </Stack>
            </Box>
        </motion.div>
    );
};

export default AboutCTA;
