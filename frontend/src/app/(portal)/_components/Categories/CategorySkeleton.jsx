"use client";
import React from "react";
import {
    Box,
    Card,
    CardContent,
    Skeleton,
    alpha,
} from "@mui/material";

const CategorySkeleton = () => {
    return (
        <Card
            sx={{
                borderRadius: 4,
                overflow: "hidden",
                height: "100%",
                border: (theme) =>
                    `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                boxShadow: (theme) =>
                    `0 4px 12px ${alpha(theme.palette.text.primary, 0.02)}`,
            }}
        >
            {/* Image Skeleton */}
            <Box
                sx={{
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    animation="wave"
                    sx={{ bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04) }}
                />
            </Box>

            {/* Content Skeleton */}
            <CardContent
                sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1 }}
            >
                <Skeleton
                    variant="text"
                    width="80%"
                    height={28}
                    animation="wave"
                    sx={{ bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04) }}
                />
            </CardContent>
        </Card>
    );
};

export default CategorySkeleton;
