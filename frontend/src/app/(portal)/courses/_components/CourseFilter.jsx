import { useState } from "react";
import { Chip, Stack, Typography } from "@mui/material";

export default function CourseFilter() {
  // Dummy filter state (you can change/remove values)
  const [filters, setFilters] = useState({
    // category: "Business & Management",
    // price_range: "$10 - $50",
    rating: 4,
  });

  const clearFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: null }));
  };

  const activeFilters = [
    filters.category && {
      label: `Category: ${filters.category}`,
      onDelete: () => clearFilter("category"),
    },
    filters.price_range && {
      label: `Price: ${filters.price_range}`,
      onDelete: () => clearFilter("price_range"),
    },
    filters.rating && {
      label: `Rating: ${filters.rating} star`,
      onDelete: () => clearFilter("rating"),
    },
  ].filter(Boolean);

  if (activeFilters.length === 0) return null;

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      alignItems={{ xs: "flex-start", sm: "center" }}
      flexWrap="wrap"
      sx={{ mb: 2, }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        Active Filters:
      </Typography>
      {activeFilters.map((filter, idx) => (
        <Chip
          key={idx}
          label={filter.label}
          onDelete={filter.onDelete}
          size="small"
          sx={{
            borderRadius: "50px",
            fontWeight: 600,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "& .MuiChip-deleteIcon": {
              color: "rgba(255, 255, 255, 0.7)",
              "&:hover": {
                color: "white",
              },
            },
          }}
        />
      ))}
    </Stack>
  );
}
