"use client";
import React from "react";
import {
    Container,
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Chip,
    Stack
} from "@mui/material";
import { ExpandMore, HelpOutline, Payments, School, Lock, MenuBook } from "@mui/icons-material";
import { motion } from "framer-motion";

const faqs = [
    {
        category: "General",
        icon: <HelpOutline />,
        items: [
            {
                q: "What is EcoFin Institute?",
                a: "EcoFin Institute is a leading digital learning platform specializing in professional finance, banking, and elite-tier architecture manuals. We provide expert-led courses and e-books designed for career mastery."
            },
            {
                q: "How do I start a course?",
                a: "Simply browse our Course Directory, select the course that fits your needs, and click 'Get Started'. Once enrolled, you'll have lifetime access to the content."
            }
        ]
    },
    {
        category: "Payments",
        icon: <Payments />,
        items: [
            {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard), PayPal, and Stripe for secure global transactions."
            },
            {
                q: "Is there a refund policy?",
                a: "Yes, we offer a 14-day satisfaction guarantee on most courses. Please review our Terms of Service for specific eligibility criteria."
            }
        ]
    },
    {
        category: "Learning",
        icon: <School />,
        items: [
            {
                q: "Can I access courses offline?",
                a: "While streaming requires an internet connection, our e-books can be downloaded for offline reading on any device."
            },
            {
                q: "Do I get a certificate?",
                a: "Yes, upon successful completion of any professional course, you will receive a verified digital certificate from EcoFin Institute."
            }
        ]
    }
];

export default function FAQPage() {
    return (
        <Box sx={{ py: { xs: 8, md: 12 } }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 12, textAlign: "center" }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <Chip
                            label="📖 Helpful Resources"
                            color="secondary"
                            variant="outlined"
                            sx={{
                                mb: 4,
                                fontWeight: 800,
                                borderRadius: "50px",
                                textTransform: "uppercase",
                                fontSize: "0.75rem",
                                letterSpacing: "1px",
                                px: 1,
                                borderColor: "secondary.main",
                                height: "36px"
                            }}
                        />
                        <Typography
                            variant="h1"
                            gutterBottom
                            sx={{
                                mb: 3,
                                fontSize: { xs: "2.5rem", md: "4.5rem" },
                                lineHeight: 1.1
                            }}
                        >
                            Frequently Asked Questions
                        </Typography>
                        <Typography
                            variant="h5"
                            color="text.secondary"
                            sx={{ maxWidth: 800, mx: "auto", fontWeight: 400, lineHeight: 1.6 }}
                        >
                            Everything you need to know about EcoFin Institute platform, courses, and premium resources.
                        </Typography>
                    </motion.div>
                </Box>

                <Grid container spacing={6}>
                    {faqs.map((cat, catIdx) => (
                        <Grid size={{ xs: 12 }} key={catIdx} sx={{ mb: 4 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                                <Box sx={{ bgcolor: "primary.main", color: "white", p: 1, borderRadius: "10px", display: "flex" }}>
                                    {cat.icon}
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                                    {cat.category}
                                </Typography>
                            </Stack>

                            <Box>
                                {cat.items.map((faq, idx) => (
                                    <Accordion
                                        key={idx}
                                        sx={{
                                            mb: 2,
                                            borderRadius: "16px !important",
                                            border: "1px solid rgba(0,0,0,0.06)",
                                            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                                            "&:hover": { borderColor: "primary.main" },
                                            transition: "all 0.3s ease"
                                        }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMore color="primary" />}>
                                            <Typography sx={{ fontWeight: 700, py: 1 }}>{faq.q}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ bgcolor: "rgba(0,0,0,0.01)", borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                                {faq.a}
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
