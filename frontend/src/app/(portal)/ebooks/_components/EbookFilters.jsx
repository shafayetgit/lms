"use client"
import React from "react"
import { Box, Grid, InputAdornment, Stack, Chip } from "@mui/material"
import { SearchOutlined } from "@mui/icons-material"

import CTextField from "@/components/form/CTextField"

const EbookFilters = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
}) => {
  return (
    <Box sx={{ mb: 6 }}>
      <Grid container spacing={3} alignItems="center">
        <Grid size={{ xs: 12, md: 5 }}>
          <CTextField
            fullWidth
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 1,
                bgcolor: "background.paper",
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              overflowX: "auto",
              pb: 1,
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {categories.map(cat => (
              <Chip
                key={cat}
                label={cat}
                onClick={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? "filled" : "outlined"}
                color={selectedCategory === cat ? "secondary" : "default"}
                sx={{
                  fontWeight: 800,
                  px: 1,
                  borderRadius: 1,
                  transition: "all 0.2s",
                }}
              />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default EbookFilters
