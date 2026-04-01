"use client";
import React from "react";
import { Box, Grid, TextField, InputAdornment, Stack, Chip } from "@mui/material";
import { Search } from "@mui/icons-material";

const EbookFilters = ({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories }) => {
    return (
        <Box sx={{ mb: 6 }}>
            <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 5 }}>
                    <TextField
                        fullWidth
                        placeholder="Search by title or author..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: "text.secondary" }} />
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: "50px",
                                bgcolor: "background.paper",
                                "& fieldset": { borderColor: "rgba(0,0,0,0.1) !important" }
                            }
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1, "&::-webkit-scrollbar": { display: "none" } }}>
                        {categories.map((cat) => (
                            <Chip
                                key={cat}
                                label={cat}
                                onClick={() => setSelectedCategory(cat)}
                                variant={selectedCategory === cat ? "filled" : "outlined"}
                                color={selectedCategory === cat ? "secondary" : "default"}
                                sx={{
                                    fontWeight: 800,
                                    px: 1,
                                    borderRadius: "12px",
                                    transition: "all 0.2s"
                                }}
                            />
                        ))}
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default EbookFilters;
