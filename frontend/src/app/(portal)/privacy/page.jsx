"use client";
import React from "react";
import { Container, Box, Typography, Chip, Divider, Stack } from "@mui/material";
import { Lock, Visibility, VerifiedUser, Security } from "@mui/icons-material";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    return (
        <Box sx={{ py: { xs: 8, md: 15 } }}>
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ mb: 10, textAlign: "left" }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Chip
                            icon={<Lock sx={{ fontSize: "1rem !important", color: "inherit !important" }} />}
                            label="Privacy Center"
                            color="secondary"
                            variant="outlined"
                            sx={{
                                mb: 2,
                                fontWeight: 800,
                                borderRadius: "50px",
                                textTransform: "uppercase",
                                fontSize: "0.75rem",
                                letterSpacing: "1px",
                                px: 1,
                                borderColor: "secondary.main"
                            }}
                        />
                        <Typography variant="h1" gutterBottom sx={{ mb: 3 }}>
                            Privacy Policy
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 4 }}>
                            At EcoFin Institute, your data privacy is our absolute priority.
                            We take rigor and transparency seriously, ensuring your learning journey is secure.
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                            Last Updated: March 31, 2026
                        </Typography>
                    </motion.div>
                </Box>

                <Divider sx={{ mb: 8, opacity: 0.05 }} />

                {/* Content Section */}
                <Stack spacing={6}>
                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                            <Box sx={{ bgcolor: "primary.main", color: "white", p: 1, borderRadius: "10px", display: "flex" }}>
                                <Visibility fontSize="small" />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                                Information We Collect
                            </Typography>
                        </Stack>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2, mb: 2 }}>
                            We collect personal information such as your name, email address, and billing details when you register for courses or purchase e-books.
                            This is strictly used for personalized education and transactional integrity.
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2 }}>
                            Additionally, we monitor technical data like device type and browser to optimize your learning experience on EcoFin platform.
                        </Typography>
                    </Box>

                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                            <Box sx={{ bgcolor: "secondary.main", color: "white", p: 1, borderRadius: "10px", display: "flex" }}>
                                <VerifiedUser fontSize="small" />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                                How We Use Data
                            </Typography>
                        </Stack>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2, mb: 2 }}>
                            Your data powers your education. It allows us to:
                        </Typography>
                        <Box component="ul" sx={{ color: "text.secondary", pl: 3, "& li": { mb: 2, lineHeight: 2 } }}>
                            <li>Deliver course materials and digital downloads instantly.</li>
                            <li>Personalize your learner dashboard based on your progress.</li>
                            <li>Send critical updates regarding certificate verification.</li>
                            <li>Enhance our platform based on overall user engagement trends.</li>
                        </Box>
                    </Box>

                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                            <Box sx={{ bgcolor: "primary.main", color: "white", p: 1, borderRadius: "10px", display: "flex" }}>
                                <Security fontSize="small" />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                                Data Security
                            </Typography>
                        </Stack>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2, mb: 2 }}>
                            EcoFin Institute utilizes industry-standard encryption (SSL/TLS) for all transactions and user-data storage.
                            Your financial information is never stored on our servers; it is handled by our PCI-compliant partners (Stripe/PayPal).
                        </Typography>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}
