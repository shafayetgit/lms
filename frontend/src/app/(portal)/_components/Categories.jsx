"use client";
import React from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";

// Components
import CategoryCard from "./Categories/CategoryCard";
import CategorySkeleton from "./Categories/CategorySkeleton";

// Data
// import { categories } from "./data";
import { useListQuery } from "@/features/category/categoryAPI";

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const CategoriesSection = () => {
  const { data: { items: categories } = {}, isLoading } = useListQuery({
    type: "featured",
    size: 8,
  });
  return (
    <Box
      id="categories"
      sx={{
        py: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="lg">
        {/* Section Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <Typography
            variant="h2"
            align="center"
            sx={{ fontWeight: 800, mb: 2 }}
          >
            Master Any Discipline
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: "auto", mb: 8 }}
          >
            Choose from thousands of expert-led courses across diverse
            categories. Your journey to excellence starts here.
          </Typography>
        </motion.div>

        {/* Categories Grid */}
        <Grid container spacing={4} justifyContent="center">
          {isLoading
            ? Array.from(new Array(8)).map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                  <CategorySkeleton />
                </Grid>
              ))
            : categories?.map((category, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                  <CategoryCard category={category} index={index} />
                </Grid>
              ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default CategoriesSection;
