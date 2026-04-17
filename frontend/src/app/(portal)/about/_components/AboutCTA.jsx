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
            viewport={{ once: true, amount: 0.3 }}
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
                        sx={{
                            borderRadius: "50px",
                            px: { xs: 4, md: 5 },
                            py: { xs: 1.5, md: 2 },
                            fontWeight: 700,
                            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                            color: "white",
                            bgcolor: "secondary.main",
                            "&:hover": {
                                bgcolor: "secondary.dark",
                                transform: "translateY(-2px)",
                                boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
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
                            borderRadius: "50px",
                            px: { xs: 4, md: 5 },
                            py: { xs: 1.5, md: 2 },
                            fontWeight: 700,
                            borderColor: "rgba(0,0,0,0.15)",
                            color: "text.primary",
                            "&:hover": {
                                borderColor: "text.primary",
                                bgcolor: "rgba(0,0,0,0.03)",
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
