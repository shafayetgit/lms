"use client";
import React, { useState } from "react";
import {
    Box, Grid, Typography, Card, CardMedia, CardContent,
    Button, Stack, Chip, Divider, IconButton, Paper, Tab, Tabs,
    LinearProgress
} from "@mui/material";
import {
    Download, MenuBook, Star, MoreVert,
    Share, Favorite, FavoriteBorder, Search,
    FilterList, AutoStories
} from "@mui/icons-material";
import { motion } from "framer-motion";
import AccountsLayout from "../AccountsLayout";

const purchasedEbooks = [
    {
        id: 1,
        title: "The Frontend Architecture Elite",
        author: "Marcus Aurelius",
        purchaseDate: "Oct 12, 2023",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
        progress: 100,
        category: "Architecture",
        fileSize: "12.4 MB"
    },
    {
        id: 2,
        title: "Mastering Next.js 15 Foundations",
        author: "Sarah Jenkins",
        purchaseDate: "Jan 05, 2024",
        image: "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=800",
        progress: 45,
        category: "Development",
        fileSize: "8.2 MB"
    }
];

export default function MyEbooksPage() {
    const [tabValue, setTabValue] = useState(0);

    return (
        <AccountsLayout pageTitle="My E-Books">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: "-0.02em" }}>
                    My Library
                </Typography>
                <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                    Access and manage all your purchased digital guides.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {purchasedEbooks.map((book, index) => (
                    <Grid size={{ xs: 12 }} key={book.id}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    borderRadius: 5,
                                    border: "1px solid rgba(0,0,0,0.06)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                                    overflow: "hidden",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
                                        borderColor: "secondary.main"
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    sx={{
                                        width: { xs: "100%", sm: 160 },
                                        height: { xs: 200, sm: "auto" },
                                        objectFit: "cover"
                                    }}
                                    image={book.image}
                                    alt={book.title}
                                />
                                <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, p: 3 }}>
                                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                                        <Box>
                                            <Chip
                                                label={book.category}
                                                size="small"
                                                sx={{ mb: 1.5, fontWeight: 800, fontSize: "0.65rem", borderRadius: "6px" }}
                                            />
                                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>{book.title}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>By {book.author}</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: { md: "right" } }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block" }}>
                                                PURCHASED ON
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{book.purchaseDate}</Typography>
                                        </Box>
                                    </Stack>

                                    <Box sx={{ mb: 3 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary" }}>
                                                Reading Progress
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: "secondary.main" }}>
                                                {book.progress}%
                                            </Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={book.progress}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: "rgba(0,0,0,0.05)",
                                                "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: "secondary.main" }
                                            }}
                                        />
                                    </Box>

                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Button
                                            variant="contained"
                                            startIcon={<MenuBook />}
                                            sx={{
                                                bgcolor: "primary.main",
                                                color: "white",
                                                borderRadius: "10px",
                                                px: 3,
                                                fontWeight: 800,
                                                "&:hover": { bgcolor: "primary.dark" }
                                            }}
                                        >
                                            Read Online
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Download />}
                                            sx={{
                                                borderColor: "rgba(0,0,0,0.1)",
                                                color: "text.primary",
                                                borderRadius: "10px",
                                                px: 3,
                                                fontWeight: 800,
                                                "&:hover": { borderColor: "secondary.main", bgcolor: "transparent", color: "secondary.main" }
                                            }}
                                        >
                                            Download PDF
                                        </Button>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                            {book.fileSize}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {/* Empty Library State (if no books) */}
            {purchasedEbooks.length === 0 && (
                <Paper
                    sx={{
                        p: 8,
                        textAlign: "center",
                        borderRadius: 6,
                        border: "2px dashed rgba(0,0,0,0.05)",
                        bgcolor: "transparent",
                        mt: 4
                    }}
                >
                    <AutoStories sx={{ fontSize: 64, color: "rgba(0,0,0,0.1)", mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Your library is empty</Typography>
                    <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: "auto" }}>
                        Start building your elite collection of architecture manuals and development guides.
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        href="/ebooks"
                        sx={{ borderRadius: "50px", px: 4, fontWeight: 800 }}
                    >
                        Browse Store
                    </Button>
                </Paper>
            )}
        </AccountsLayout>
    );
}
