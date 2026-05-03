"use client";
import React from "react";
import { Box, Card, CardMedia, CardContent, Typography, Stack, Chip, IconButton, Button } from "@mui/material";
import { Favorite, FavoriteBorder, Star, ArrowForward } from "@mui/icons-material";
import { motion } from "framer-motion";

import Image from "next/image";

const EbookCard = ({ book, index, isFavorite, onToggleFavorite, onClick }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card
                onClick={() => onClick(book.id)}
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    borderRadius: 6,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 30px 60px rgba(0,0,0,0.1)",
                        borderColor: "secondary.main"
                    }
                }}
            >
                <Box
                    sx={{
                        width: { xs: "100%", md: 220 },
                        height: { xs: 280, md: "auto" },
                        minHeight: { md: 320 },
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Image
                        src={book.image.startsWith('http') ? book.image : `/${book.image}`}
                        alt={book.title}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, 220px"
                    />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <CardContent sx={{ p: 4, flex: "1 0 auto" }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Chip
                                label={book.category}
                                size="small"
                                sx={{ borderRadius: "50px", fontWeight: 800, fontSize: "0.65rem", bgcolor: "rgba(0,0,0,0.04)" }}
                            />
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <IconButton
                                    size="small"
                                    onClick={(e) => onToggleFavorite(e, book.id)}
                                    sx={{
                                        color: isFavorite ? "#FF2D55" : "text.secondary",
                                        transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                        "&:hover": { transform: "scale(1.2)" }
                                    }}
                                >
                                    {isFavorite ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                                </IconButton>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Star sx={{ color: "#FFCE00", fontSize: 16 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 800 }}>{book.rating}</Typography>
                                </Stack>
                            </Stack>
                        </Stack>

                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 900, letterSpacing: "-0.02em", mb: 1, color: "primary.main" }}
                        >
                            {book.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600, mb: 2 }}>
                            By {book.author}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, opacity: 0.8 }}>
                            {book.description}
                        </Typography>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: "secondary.main" }}>${book.price.toFixed(0)}</Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>USD</Typography>
                            </Box>
                            <Button
                                variant="text"
                                endIcon={<ArrowForward />}
                                sx={{
                                    fontWeight: 900,
                                    color: "primary.main",
                                    "&:hover": { bgcolor: "transparent", color: "secondary.main" }
                                }}
                            >
                                View Details
                            </Button>
                        </Stack>
                    </CardContent>
                </Box>
            </Card>
        </motion.div>
    );
};

export default EbookCard;
