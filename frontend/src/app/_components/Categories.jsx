"use client";
import React from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";

// Components
import CategoryCard from "./Categories/CategoryCard";

// Data
import { categories } from "./data";

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const CategoriesSection = () => {
  return (
    <Box
      id="categories"
      sx={{
        py: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="lg">
        {/* Section Heading */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <Typography variant="h2" align="center" sx={{ fontWeight: 800, mb: 2 }}>
            Master Any Discipline
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: "auto", mb: 8 }}
          >
            Choose from thousands of expert-led courses across diverse categories.
            Your journey to excellence starts here.
          </Typography>
        </motion.div>

        {/* Categories Grid */}
        <Grid container spacing={4} justifyContent="center">
          {categories.map((category, index) => (
            <Grid key={category.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <CategoryCard category={category} index={index} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default CategoriesSection;
