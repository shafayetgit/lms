"use client";
import React from "react";
import { Chip, Typography, Stack, alpha } from "@mui/material";
import { AutoAwesome, Verified, ArrowForward, PlayCircleOutline } from "@mui/icons-material";
import { motion } from "framer-motion";
import CButton from "@/components/ui/CButton";

const HeroContent = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <Stack
                spacing={{ xs: 3, md: 4 }}
                alignItems={{ xs: "center", md: "flex-start" }}
                textAlign={{ xs: "center", md: "left" }}
            >
                <Chip
                    icon={<AutoAwesome sx={{ fontSize: "1rem !important", color: "inherit !important" }} />}
                    label="The Elite Learning Experience"
                    color="secondary"
                    variant="outlined"
                    sx={{
                        fontWeight: 800,
                        borderRadius: "50px",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "1.2px",
                        px: 1,
                        borderColor: "secondary.main",
                    }}
                />
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.2rem" },
                        lineHeight: 1.15,
                        fontWeight: 900
                    }}
                >
                    Master Your Future In Finance.
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        color: "text.secondary",
                        fontSize: { xs: "1rem", md: "1.25rem" },
                        lineHeight: 1.6,
                        maxWidth: { xs: "100%", md: "90%" },
                    }}
                >
                    Online learning and teaching marketplace with 5K+ courses & 10M
                    students. Taught by experts to help you acquire new skills.
                </Typography>

                <Stack
                    direction="row"
                    spacing={{ xs: 2, md: 3 }}
                    flexWrap="wrap"
                    useFlexGap
                    justifyContent={{ xs: "center", md: "flex-start" }}
                    sx={{ mt: { xs: 0, md: 1 } }}
                >
                    {["Learn with experts", "Get certificate", "Get membership"].map((text, idx) => (
                        <Typography
                            key={idx}
                            variant="body2"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                fontWeight: 600,
                                fontSize: { xs: "0.85rem", md: "0.95rem" },
                            }}
                        >
                            <Verified sx={{ color: "text.primary", fontSize: "1.2rem" }} />
                            {text}
                        </Typography>
                    ))}
                </Stack>

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    sx={{ pt: { xs: 1, md: 2 }, width: { xs: "100%", sm: "auto" } }}
                >
                    <CButton
                        label="Get Started"
                        size="large"
                        color="secondary"
                        endIcon={<ArrowForward />}
                        sx={{
                            px: { xs: 2, md: 4 },
                            py: { xs: 1.5, md: 1.8 },
                            fontSize: { xs: "1rem", md: "1.05rem" },
                            borderRadius: "50px",
                            textTransform: "none",
                            fontWeight: 700,
                            boxShadow: (theme) => `0 10px 20px ${alpha(theme.palette.text.primary, 0.1)}`,
                            "&:hover": {
                                transform: "translateY(-3px)",
                                boxShadow: (theme) => `0 15px 30px ${alpha(theme.palette.text.primary, 0.15)}`,
                            },
                        }}
                    />
                    <CButton
                        label="Watch Video"
                        variant="outlined"
                        size="large"
                        startIcon={<PlayCircleOutline />}
                        sx={{
                            px: { xs: 2, md: 4 },
                            py: { xs: 1.5, md: 1.8 },
                            fontSize: { xs: "1rem", md: "1.05rem" },
                            borderRadius: "50px",
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
                </Stack>
            </Stack>
        </motion.div>
    );
};

export default HeroContent;
