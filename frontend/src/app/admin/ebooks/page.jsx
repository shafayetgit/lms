"use client";
import React, { useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardMedia,
    CardContent,
    Stack,
    Chip,
    Divider,
    IconButton,
    Paper,
    Tab,
    Tabs,
    LinearProgress,
    useTheme,
    alpha,
    Grid,
    Avatar
} from "@mui/material";
import {
    Download,
    MenuBook,
    AutoStories,
    ArrowForward,
    SearchOutlined,
    BookmarkBorder,
    PlayCircleFilled
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import StudentLayout from "@/app/student/StudentLayout";
import CButton from "@/components/ui/CButton";
import NeuralPanel from "@/components/ui/NeuralPanel";

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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function MyEbooksPage() {
    const theme = useTheme();

    return (
        <StudentLayout>
            <Box
                component={motion.div}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                sx={{ width: "100%", pb: 10 }}
            >
                {/* Header Section */}
                <Box sx={{ mb: 6 }}>
                    <Typography
                        variant="h3"
                        fontWeight="900"
                        sx={{
                            letterSpacing: "-0.04em",
                            color: 'primary.main',
                            mb: 1
                        }}
                    >
                        Elite Library
                    </Typography>
                    <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: -0.5 }}>
                        Your curated collection of high-fidelity architectural guides.
                    </Typography>
                </Box>

                {/* Library Search & Filter Bar */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                    pb: 1,
                    borderBottom: '1px solid rgba(0,0,0,0.06)'
                }}>
                    <Stack direction="row" spacing={4} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 900, pb: 2, borderBottom: '3px solid', borderColor: 'secondary.main', color: 'primary.main' }}>
                            Purchased Guides
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, pb: 2, color: 'text.disabled', cursor: 'pointer', "&:hover": { color: 'text.secondary' } }}>
                            Wishlist
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, pb: 2, color: 'text.disabled', cursor: 'pointer', "&:hover": { color: 'text.secondary' } }}>
                            Archived
                        </Typography>
                    </Stack>

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'rgba(0,0,0,0.03)',
                        borderRadius: '12px',
                        px: 2,
                        py: 0.5,
                        width: 280
                    }}>
                        <SearchOutlined sx={{ fontSize: 20, color: 'text.disabled', mr: 1 }} />
                        <Typography variant="body2" sx={{ color: 'text.disabled' }}>Search my library...</Typography>
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    {purchasedEbooks.map((book, index) => (
                        <Grid size={{ xs: 12 }} key={book.id}>
                            <motion.div variants={itemVariants}>
                                <Card
                                    sx={{
                                        display: "flex",
                                        flexDirection: { xs: "column", md: "row" },
                                        borderRadius: '32px',
                                        border: "1px solid rgba(0,0,0,0.06)",
                                        bgcolor: "rgba(255, 255, 255, 0.6) !important",
                                        backdropFilter: "blur(10px)",
                                        overflow: "hidden",
                                        position: 'relative',
                                        transition: "all 0.5s cubic-bezier(0.2, 1, 0.3, 1)",
                                        "&:hover": {
                                            transform: "translateY(-8px)",
                                            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.12)",
                                            borderColor: alpha(theme.palette.secondary.main, 0.2)
                                        }
                                    }}
                                >
                                    <NeuralPanel particleCount={20} opacity={0.05} />

                                    <Box sx={{ position: 'relative', width: { xs: '100%', md: 240 }, minHeight: 300 }}>
                                        <CardMedia
                                            component="img"
                                            sx={{ height: '100%', objectFit: "cover" }}
                                            image={book.image}
                                            alt={book.title}
                                        />
                                        <Box sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(to right, transparent, rgba(255,255,255,1) 95%)',
                                            display: { xs: 'none', md: 'block' }
                                        }} />
                                    </Box>

                                    <CardContent sx={{ p: 5, flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                                            <Box>
                                                <Chip
                                                    label={book.category}
                                                    size="small"
                                                    sx={{
                                                        mb: 1.5,
                                                        fontWeight: 900,
                                                        fontSize: "0.6rem",
                                                        borderRadius: "6px",
                                                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                                        color: 'secondary.main',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 1
                                                    }}
                                                />
                                                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1, color: 'primary.main' }}>
                                                    {book.title}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.7rem' }}>{book.author[0]}</Avatar>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>{book.author}</Typography>
                                                </Stack>
                                            </Box>

                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: "text.disabled", textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}>
                                                    ACQUIRED
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{book.purchaseDate}</Typography>
                                            </Box>
                                        </Stack>

                                        <Box sx={{ width: '100%', maxWidth: 600, mb: 4, mt: 'auto' }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.65rem' }}>
                                                    READING PROGRESS
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: "secondary.main" }}>
                                                    {book.progress}% {book.progress === 100 ? 'FINISHED' : 'REMAINING'}
                                                </Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={book.progress}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: alpha(theme.palette.secondary.main, 0.05),
                                                    "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: "secondary.main" }
                                                }}
                                            />
                                        </Box>

                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <CButton
                                                label={book.progress > 0 ? "Continue Reading" : "Start Reading"}
                                                variant="contained"
                                                color="primary"
                                                sx={{ borderRadius: "16px", px: 4, py: 1.5, fontWeight: 900 }}
                                                icon={<AutoStories fontSize="small" />}
                                            />
                                            <CButton
                                                label={`Download PDF (${book.fileSize})`}
                                                variant="outlined"
                                                color="secondary"
                                                sx={{ borderRadius: "16px", px: 4, py: 1.5, fontWeight: 900 }}
                                                icon={<Download fontSize="small" />}
                                            />
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {/* Empty State */}
                {purchasedEbooks.length === 0 && (
                    <Box sx={{
                        py: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: 'rgba(0,0,0,0.01)',
                        borderRadius: '40px',
                        border: '2px dashed rgba(0,0,0,0.05)',
                        mt: 4
                    }}>
                        <Avatar sx={{ width: 100, height: 100, bgcolor: alpha(theme.palette.secondary.main, 0.1), mb: 4 }}>
                            <AutoStories sx={{ fontSize: 50, color: 'secondary.main' }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: 'primary.main' }}>Your Library is Empty</Typography>
                        <Typography variant="body1" sx={{ color: "text.secondary", mb: 5, textAlign: "center", maxWidth: 450 }}>
                            It seems you haven't added any premium guides to your collection yet. Start building your knowledge engine today.
                        </Typography>
                        <CButton
                            label="Browse Elite Bookstore"
                            variant="contained"
                            color="primary"
                            sx={{ borderRadius: "50px", px: 6, py: 2 }}
                        />
                    </Box>
                )}
            </Box>
        </StudentLayout>
    );
}
