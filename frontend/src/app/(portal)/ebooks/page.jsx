"use client";
import React, { useState, useMemo } from "react";
import { Container, Box, Typography, Button, Grid } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// Components
import EbookHero from "./_components/EbookHero";
import EbookFilters from "./_components/EbookFilters";
import EbookCard from "./_components/EbookCard";
import EbookCTA from "./_components/EbookCTA";

// Data
import { ebooks, categories } from "./_components/data";

export default function EbooksPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [favorites, setFavorites] = useState({});

    const toggleFavorite = (e, id) => {
        e.stopPropagation();
        setFavorites(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const filteredBooks = useMemo(() => {
        return ebooks.filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    const handleCardClick = (id) => {
        router.push(`/ebooks/${id}`);
    };

    return (
        <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "transparent", minHeight: "100vh" }}>
            <Container maxWidth="lg">
                <EbookHero />

                <EbookFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categories={categories}
                />

                <Grid container spacing={4}>
                    <AnimatePresence mode="popLayout">
                        {filteredBooks.map((book, index) => (
                            <Grid size={{ xs: 12, sm: 12, md: 6 }} key={book.id}>
                                <EbookCard
                                    book={book}
                                    index={index}
                                    isFavorite={favorites[book.id]}
                                    onToggleFavorite={toggleFavorite}
                                    onClick={handleCardClick}
                                />
                            </Grid>
                        ))}
                    </AnimatePresence>
                </Grid>

                {/* Empty State */}
                {filteredBooks.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 10 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: "text.secondary" }}>
                            No e-books found matching your criteria.
                        </Typography>
                        <Button
                            onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                            sx={{ mt: 2, fontWeight: 700, color: "secondary.main" }}
                        >
                            Clear all filters
                        </Button>
                    </Box>
                )}

                <EbookCTA />
            </Container>
        </Box>
    );
}
