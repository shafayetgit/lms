"use client";
import React from "react";
import { Container, Box, Typography, Chip, Divider, Stack } from "@mui/material";
import { ListAlt, Gavel, LocalAtm, LibraryBooks } from "@mui/icons-material";
import { motion } from "framer-motion";

export default function TermsPage() {
    return (
        <Box sx={{ py: { xs: 8, md: 15 } }}>
            <Container maxWidth="md">
                {/* Header Section */}
                <Box sx={{ mb: 10, textAlign: "left" }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Chip
                            icon={<Gavel sx={{ fontSize: "1rem !important", color: "inherit !important" }} />}
                            label="Legal Hub"
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
                            Terms of Service
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 4 }}>
                            By participating in EcoFin Institute’s educational ecosystem,
                            you agree to maintain the standards and guidelines outlined below.
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                            Last Updated: March 31, 2026
                        </Typography>
                    </motion.div>
                </Box>

                <Divider sx={{ mb: 8, opacity: 0.05 }} />

                <Stack spacing={8}>
                    {/* General Usage */}
                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                            <Box sx={{ bgcolor: "primary.main", color: "white", p: 1, borderRadius: "10px", display: "flex" }}>
                                <ListAlt fontSize="small" />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                                General Usage
                            </Typography>
                        </Stack>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2, mb: 2 }}>
                            EcoFin Institute provides a digital platform for financial and professional education.
                            Users must provide accurate, up-to-date information during license registration and course enrollment.
                            You are responsible for maintaining the confidentiality of your account credentials.
                        </Typography>
                    </Box>

                    {/* Intellectual Property */}
                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                            <Box sx={{ bgcolor: "secondary.main", color: "white", p: 1, borderRadius: "10px", display: "flex" }}>
                                <LibraryBooks fontSize="small" />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                                Intellectual Property
                            </Typography>
                        </Stack>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2, mb: 2 }}>
                            All course materials, e-books, and instructional videos are the exclusive property of EcoFin Institute.
                            Purchasing a course grants you a personal, non-transferable license for learning purposes.
                            Redistribution or commercial use of our intellectual property is strictly prohibited and protected by international law.
                        </Typography>
                    </Box>

                    {/* Refunds & Fees */}
                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                            <Box sx={{ bgcolor: "primary.main", color: "white", p: 1, borderRadius: "10px", display: "flex" }}>
                                <LocalAtm fontSize="small" />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                                Refunds & Fees
                            </Typography>
                        </Stack>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2, mb: 2 }}>
                            Payments are due at the time of purchase. While we offer a 14-day refund window for our digital courses,
                            e-books are considered non-refundable once downloaded due to their digital nature.
                            For any billing inquiries, our support team is available at legal@ecofin.institute.
                        </Typography>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}
