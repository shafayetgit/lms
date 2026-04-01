"use client";
import React, { useState } from "react";
import {
    Container, Box, Typography, Grid, Card, CardMedia,
    CardContent, Button, Stack, Chip, Divider, IconButton,
    Avatar, Rating, Tab, Tabs, List, ListItem, ListItemIcon, ListItemText,
    Paper, useTheme, Breadcrumbs, Dialog, DialogContent, DialogTitle,
    AppBar, Toolbar, Slide
} from "@mui/material";
import {
    Star, ArrowForward, LocalLibrary,
    AutoStories, EmojiEvents, Favorite, FavoriteBorder,
    Share, Download, ShoppingBag, CheckCircle,
    Person, CalendarMonth, Language, MenuBook,
    NavigateNext, Close, Visibility
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";

const ebooks = [
    {
        id: 1,
        title: "The Frontend Architecture Elite",
        author: "Marcus Aurelius",
        authorRole: "Senior Systems Architect",
        price: 49.99,
        rating: 4.9,
        reviews: 128,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
        category: "Architecture",
        languages: ["English", "Spanish"],
        pages: 342,
        lastUpdated: "March 2024",
        description: "Master the art of building scalable, premium React applications with advanced design patterns. This comprehensive guide covers everything from state management to performance optimization in large-scale Next.js environments.",
        longDescription: "In 'The Frontend Architecture Elite', Marcus Aurelius breaks down the complex world of modern web architecture into manageable, high-impact strategies. Whether you're building the next breakthrough SaaS or managing a legacy enterprise system, this book provides the blueprint for excellence. You'll learn how to implement atomic design, master server-side rendering patterns, and build a component library that scales with your team.",
        highlights: [
            "Advanced React Design Patterns",
            "Next.js 15 App Router Mastery",
            "Scalable State Management Strategies",
            "Performance Optimization at Scale",
            "Testing Premium User Interfaces"
        ],
        tableOfContents: [
            { chapter: 1, title: "Foundations of Modern Architecture", pages: "1-45" },
            { chapter: 2, title: "The React Ecosystem Ecosystem", pages: "46-92" },
            { chapter: 3, title: "Next.js Deep Dive", pages: "93-156" },
            { chapter: 4, title: "Design Systems & Componentry", pages: "157-210" },
            { chapter: 5, title: "Data Flow & State", pages: "211-285" },
            { chapter: 6, title: "Security & Optimization", pages: "286-342" }
        ]
    },
    // ... we can add more later or just use ID 1 for now
];

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function EbookDetailPage() {
    const { id } = useParams();
    const theme = useTheme();
    const [isFavorite, setIsFavorite] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // For demo purposes, we'll find the book or default to the first one
    const book = ebooks.find(b => b.id === parseInt(id)) || ebooks[0];

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ py: { xs: 4, md: 8 }, minHeight: "100vh" }}>
            <Container maxWidth="lg">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    separator={<NavigateNext fontSize="small" />}
                    sx={{
                        mb: 4,
                        color: "text.secondary",
                        fontWeight: 600,
                        "& a": {
                            textDecoration: 'none',
                            color: 'inherit',
                            "&:hover": { color: "secondary.main" }
                        }
                    }}
                >
                    <Link href="/">Home</Link>
                    <Link href="/ebooks">E-Books</Link>
                    <Typography color="text.primary" sx={{ fontWeight: 800 }}>{book.title}</Typography>
                </Breadcrumbs>

                {/* Mobile Title Section (Visible only on XS/SM) */}
                <Box sx={{ display: { xs: "block", md: "none" }, mb: 4 }}>
                    <Chip
                        label={book.category}
                        color="secondary"
                        variant="outlined"
                        sx={{ mb: 2, fontWeight: 800, borderRadius: "50px", textTransform: "uppercase", fontSize: "0.7rem" }}
                    />
                    <Typography
                        variant="h1"
                        sx={{
                            fontWeight: 900,
                            mb: 2,
                            fontSize: "2.2rem",
                            lineHeight: 1.2,
                            letterSpacing: "-0.04em",
                            color: "primary.main"
                        }}
                    >
                        {book.title}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Rating value={book.rating} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{book.rating}</Typography>
                        <Divider orientation="vertical" flexItem sx={{ height: 16, my: "auto" }} />
                        <Typography variant="body2" sx={{ fontWeight: 800, color: "secondary.main" }}>{book.author}</Typography>
                    </Stack>
                </Box>

                <Grid container spacing={{ xs: 4, md: 8 }}>
                    {/* Left Column: Image & Quick Info */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Box sx={{ position: { md: "sticky" }, top: 100 }}>
                                <Card
                                    sx={{
                                        borderRadius: 8,
                                        overflow: "hidden",
                                        boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
                                        border: "1px solid rgba(0,0,0,0.05)",
                                        position: "relative"
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        image={book.image}
                                        alt={book.title}
                                        sx={{
                                            aspectRatio: "3/4",
                                            objectFit: "cover"
                                        }}
                                    />
                                    {/* Glass Overlay for Category on Image */}
                                    <Box sx={{
                                        position: "absolute",
                                        top: 20,
                                        left: 20,
                                        bgcolor: "rgba(255,255,255,0.9)",
                                        backdropFilter: "blur(4px)",
                                        px: 2, py: 0.5, borderRadius: "50px",
                                        display: { xs: "none", md: "block" }
                                    }}>
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: "primary.main" }}>{book.category}</Typography>
                                    </Box>
                                </Card>

                                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<ShoppingBag />}
                                        sx={{
                                            bgcolor: "secondary.main",
                                            color: "white",
                                            borderRadius: 4,
                                            py: 2.2,
                                            fontWeight: 900,
                                            fontSize: "1.05rem",
                                            boxShadow: "0 10px 25px rgba(118, 184, 42, 0.25)",
                                            "&:hover": {
                                                bgcolor: "secondary.dark",
                                                transform: "translateY(-2px)"
                                            },
                                            transition: "all 0.3s ease"
                                        }}
                                    >
                                        Buy Now — ${book.price}
                                    </Button>
                                    <IconButton
                                        onClick={() => setIsFavorite(!isFavorite)}
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 4,
                                            border: "2px solid",
                                            borderColor: isFavorite ? "#FF2D55" : "rgba(0,0,0,0.08)",
                                            color: isFavorite ? "#FF2D55" : "text.secondary",
                                            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                            "&:hover": { transform: "scale(1.05)", bgcolor: "rgba(0,0,0,0.02)" }
                                        }}
                                    >
                                        {isFavorite ? <Favorite fontSize="medium" /> : <FavoriteBorder fontSize="medium" />}
                                    </IconButton>
                                </Stack>

                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<Visibility />}
                                    onClick={() => setIsPreviewOpen(true)}
                                    sx={{
                                        mt: 2,
                                        py: 1.8,
                                        borderRadius: 4,
                                        fontWeight: 800,
                                        borderColor: "rgba(0,0,0,0.1)",
                                        color: "text.primary",
                                        "&:hover": {
                                            borderColor: "secondary.main",
                                            bgcolor: "rgba(118, 184, 42, 0.05)"
                                        }
                                    }}
                                >
                                    Read Preview
                                </Button>

                                <Box sx={{ mt: 4, p: 3, borderRadius: 5, bgcolor: "rgba(118, 184, 42, 0.03)", border: "1px dashed rgba(118, 184, 42, 0.2)" }}>
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <Download sx={{ color: "secondary.main", mt: 0.3 }} />
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>Instant Digital Access</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                Unlock PDF, EPUB, and MOBI formats immediately after secure checkout. Compatible with Kindle and Apple Books.
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Box>
                        </motion.div>
                    </Grid>

                    {/* Right Column: Details */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Box sx={{ display: { xs: "none", md: "block" } }}>
                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontWeight: 900,
                                        mb: 2,
                                        fontSize: { xs: "2.5rem", md: "3.8rem" },
                                        lineHeight: 1.1,
                                        letterSpacing: "-0.04em",
                                        color: "primary.main"
                                    }}
                                >
                                    {book.title}
                                </Typography>
                            </Box>

                            <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 4, display: { xs: "none", md: "flex" } }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Rating value={book.rating} precision={0.1} readOnly size="small" />
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{book.rating}</Typography>
                                    <Typography variant="body2" color="text.secondary">({book.reviews} Reviews)</Typography>
                                </Stack>
                                <Divider orientation="vertical" flexItem />
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" color="text.secondary">By</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: "secondary.main" }}>{book.author}</Typography>
                                </Stack>
                            </Stack>

                            <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
                                {book.description}
                            </Typography>

                            <Grid container spacing={3} sx={{ mb: 6 }}>
                                {[
                                    { icon: <MenuBook />, label: "Pages", value: book.pages },
                                    { icon: <CalendarMonth />, label: "Updated", value: book.lastUpdated },
                                    { icon: <Language />, label: "Language", value: book.languages[0] },
                                    { icon: <Person />, label: "Format", value: "PDF & EPUB" }
                                ].map((item, i) => (
                                    <Grid size={{ xs: 6, sm: 3 }} key={i}>
                                        <Stack spacing={0.5}>
                                            <Box sx={{ color: "secondary.main", mb: 0.5 }}>{item.icon}</Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>{item.label}</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 800 }}>{item.value}</Typography>
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>

                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs
                                        value={tabValue}
                                        onChange={handleTabChange}
                                        textColor="secondary"
                                        indicatorColor="secondary"
                                        sx={{
                                            '& .MuiTab-root': {
                                                fontWeight: 800,
                                                textTransform: "none",
                                                fontSize: "1rem"
                                            }
                                        }}
                                    >
                                        <Tab label="About" />
                                        <Tab label="Table of Contents" />
                                        <Tab label="Author" />
                                    </Tabs>
                                </Box>
                                <Box sx={{ py: 4 }}>
                                    <AnimatePresence mode="wait">
                                        {tabValue === 0 && (
                                            <motion.div
                                                key="about"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>Master Modern Development</Typography>
                                                <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 4 }}>
                                                    {book.longDescription}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Course Highlights:</Typography>
                                                <List>
                                                    {book.highlights.map((text, i) => (
                                                        <ListItem key={i} sx={{ px: 0 }}>
                                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                                <CheckCircle color="secondary" fontSize="small" />
                                                            </ListItemIcon>
                                                            <ListItemText primary={text} primaryTypographyProps={{ fontWeight: 600 }} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </motion.div>
                                        )}
                                        {tabValue === 1 && (
                                            <motion.div
                                                key="toc"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <Stack spacing={2}>
                                                    {book.tableOfContents.map((item, i) => (
                                                        <Paper
                                                            key={i}
                                                            elevation={0}
                                                            sx={{
                                                                p: 2.5,
                                                                borderRadius: 4,
                                                                border: "1px solid",
                                                                borderColor: "divider",
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center"
                                                            }}
                                                        >
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32, fontSize: "0.8rem" }}>{item.chapter}</Avatar>
                                                                <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
                                                            </Stack>
                                                            <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary" }}>{item.pages}</Typography>
                                                        </Paper>
                                                    ))}
                                                </Stack>
                                            </motion.div>
                                        )}
                                        {tabValue === 2 && (
                                            <motion.div
                                                key="author"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
                                                    <Avatar sx={{ width: 80, height: 80, fontSize: "1.5rem", bgcolor: "secondary.main" }}>{book.author[0]}</Avatar>
                                                    <Box>
                                                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{book.author}</Typography>
                                                        <Typography color="secondary" sx={{ fontWeight: 700 }}>{book.authorRole}</Typography>
                                                    </Box>
                                                </Stack>
                                                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                                    Marcus Aurelius is a world-renowned software architect and design expert with over 15 years of experience in the industry. He has led engineering teams at Fortune 500 companies and is a frequent speaker at major tech conferences worldwide.
                                                </Typography>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Box>
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>

            {/* Preview Modal */}
            <Dialog
                fullScreen
                open={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative', bgcolor: 'primary.main', color: 'white' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={() => setIsPreviewOpen(false)}
                            aria-label="close"
                        >
                            <Close />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1, fontWeight: 800 }} variant="h6" component="div">
                            Preview: {book.title}
                        </Typography>
                        <Button autoFocus color="inherit" onClick={() => setIsPreviewOpen(false)} sx={{ fontWeight: 800 }}>
                            Buy Full Version
                        </Button>
                    </Toolbar>
                </AppBar>
                <DialogContent sx={{ bgcolor: '#F5F5F7', p: { xs: 2, md: 6 } }}>
                    <Container maxWidth="md">
                        <Stack spacing={4}>
                            {[1, 2, 3].map((page) => (
                                <Paper
                                    key={page}
                                    elevation={0}
                                    sx={{
                                        p: { xs: 4, md: 8 },
                                        borderRadius: 4,
                                        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                                        minHeight: "800px",
                                        position: "relative",
                                        overflow: "hidden"
                                    }}
                                >
                                    <Box sx={{ position: "absolute", top: 40, right: 40, opacity: 0.1 }}>
                                        <Typography variant="h1" sx={{ fontWeight: 900 }}>{page}</Typography>
                                    </Box>

                                    <Box sx={{ mb: 6 }}>
                                        <Typography variant="overline" sx={{ fontWeight: 800, color: "secondary.main", letterSpacing: 2 }}>
                                            CHAPTER {page}: {book.tableOfContents[page - 1].title}
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 900, mb: 4, mt: 1 }}>
                                            Building Excellence
                                        </Typography>
                                        <Divider />
                                    </Box>

                                    <Typography sx={{ lineHeight: 2, fontSize: "1.1rem", color: "text.secondary", mb: 4 }}>
                                        Experience the future of web development. In this chapter, we explore the foundational principles that separate average frontend engineers from elite architects. We'll dive deep into modularity, state management, and the emotional resonance of modern UI design.
                                    </Typography>
                                    <Typography sx={{ lineHeight: 2, fontSize: "1.1rem", color: "text.secondary", mb: 4 }}>
                                        The key to building a scalable system is to think beyond the immediate requirements. We must design for the unknown. This means creating components that are not just reusable, but extensible. We'll look at how to leverage React's latest features to achieve this at scale without sacrificing performance.
                                    </Typography>

                                    <Box sx={{ my: 6, p: 4, bgcolor: "rgba(0,0,0,0.02)", borderRadius: 3, borderLeft: "4px solid", borderColor: "secondary.main" }}>
                                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Architecture Insight</Typography>
                                        <Typography variant="body1" sx={{ fontStyle: "italic", color: "text.primary" }}>
                                            "A well-architected system is one where the cost of change remains low throughout the lifetime of the project."
                                        </Typography>
                                    </Box>

                                    <Typography sx={{ lineHeight: 2, fontSize: "1.1rem", color: "text.secondary" }}>
                                        As we progress through these pages, keep in mind that these patterns are not dogma. They are tools in your belt. The elite engineer knows when to follow the rules, and when the requirements demand a more creative approach.
                                    </Typography>

                                    <Box sx={{ mt: 8, textAlign: "center" }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.disabled" }}>
                                            ECOFIN INSTITUTE • ELITE E-BOOK SERIES • PAGE {page} OF {book.pages}
                                        </Typography>
                                    </Box>
                                </Paper>
                            ))}

                            {/* Upsell End Section */}
                            <Box sx={{ py: 10, textAlign: "center" }}>
                                <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>Enjoying the Preview?</Typography>
                                <Typography sx={{ mb: 4, color: "text.secondary", maxWidth: 500, mx: "auto" }}>
                                    Purchase the full version to unlock all {book.pages} pages of architectural mastery and private resource files.
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    sx={{ borderRadius: "50px", px: 6, fontWeight: 800 }}
                                    onClick={() => setIsPreviewOpen(false)}
                                >
                                    Get Full Lifetime Access - ${book.price}
                                </Button>
                            </Box>
                        </Stack>
                    </Container>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
