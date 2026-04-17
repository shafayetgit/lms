"use client";
import React from "react";
import { Box, Container, Grid, alpha } from "@mui/material";
import { motion } from "framer-motion";

// Components
import CourseCard from "@/components/ui/CourseCard";
import FeaturedHeader from "./Featured/FeaturedHeader";

// Data
import { featuredCourses as courses } from "./data";

const FeaturedCourses = () => {
  const [favorites, setFavorites] = React.useState({});

  const toggleFavorite = (courseId) => {
    setFavorites((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  return (
    <Box sx={{ py: 12, borderTop: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.04)}` }}>
      <Container maxWidth="lg">
        <FeaturedHeader />

        {/* Course Grid */}
        <Grid
          container
          spacing={4}
          justifyContent="center"
        >
          {courses.map((course, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <CourseCard
                  course={course}
                  isFavorite={favorites[course.id]}
                  onToggleFavorite={toggleFavorite}
                />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturedCourses;
