"use client";

import CourseCard from "@/components/CourseCard";
import { Box, Container, Grid, Typography, Drawer, IconButton, Button, Chip } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import React, { useState } from "react";
import CourseFilter from "./_components/CourseFilter";
import CategoryFilter from "./_components/Categories";
import PriceRange from "./_components/PriceRange";
import RatingFilter from "./_components/RatingFilter";

export default function page() {
  const [favorites, setFavorites] = useState({});
  const [isMobileFilterOpen, setMobileFilterOpen] = useState(false);

  const toggleFavorite = (courseId) => {
    setFavorites((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const filtersContent = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <CourseFilter />
      <CategoryFilter />
      <PriceRange />
      <RatingFilter />
    </Box>
  );

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ mb: { xs: 4, md: 8 }, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <Box>
            <Chip
              icon={<SchoolIcon sx={{ fontSize: "1rem !important", color: "inherit !important" }} />}
              label="Premium Courses"
              color="secondary"
              variant="outlined"
              sx={{
                mb: 2,
                fontWeight: 800,
                borderRadius: "50px",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                letterSpacing: "1px",
                px: 1,
                borderColor: "secondary.main"
              }}
            />
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: "-0.02em", fontSize: { xs: "2.5rem", md: "3.75rem" } }}>
              Explore Our Courses
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 650, mx: "auto", fontWeight: 400, lineHeight: 1.6, fontSize: { xs: "1rem", md: "1.25rem" } }}>
              Discover hundreds of expert-led courses designed to elevate your career and expand your mind.
            </Typography>
          </Box>

          {/* Mobile Filter Toggle */}
          <Button
            variant="outlined"
            onClick={() => setMobileFilterOpen(true)}
            startIcon={<FilterListIcon />}
            sx={{
              display: { xs: "flex", md: "none" },
              borderRadius: "50px",
              px: 4,
              py: 1.5,
              fontWeight: 700,
              textTransform: "none",
              borderColor: "rgba(0,0,0,0.15)",
              color: "text.primary",
              width: { xs: "100%", sm: "auto" }
            }}
          >
            Filters
          </Button>
        </Box>

        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* Desktop Sidebar */}
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: "none", md: "block" } }}>
            <Box
              sx={{
                position: "sticky",
                top: 115,
                alignSelf: "flex-start",
              }}
            >
              {filtersContent}
            </Box>
          </Grid>
          <Grid
            container
            size={{ xs: 12, md: 9 }}
            spacing={4}
            alignItems="stretch"
          >
            {courses.map((course) => (
              <Grid size={{ xs: 12, sm: 6 }} key={course.id}>
                <CourseCard
                  course={course}
                  isFavorite={favorites[course.id]}
                  onToggleFavorite={toggleFavorite}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Mobile Filter Drawer */}
        <Drawer
          anchor="left"
          open={isMobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          PaperProps={{
            sx: { width: { xs: "100%", sm: "400px" }, p: 3, bgcolor: "background.paper" }
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Filters
            </Typography>
            <IconButton onClick={() => setMobileFilterOpen(false)} edge="end">
              <CloseIcon />
            </IconButton>
          </Box>
          {filtersContent}
        </Drawer>
      </Container>
    </Box>
  );
}

const courses = [
  {
    id: 1,
    title: "Learn JavaScript and Express to become a Expert",
    instructor: "Sarah Johnson",
    image: "images/course-16x9-1.jpg",
    rating: 4.8,
    students: 1245,
    duration: "22h 30m",
    lessons: 48,
    progress: 65,
    price: 89.99,
    originalPrice: 129.99,
    category: "Web Development",
    instructorAvatar: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    id: 2,
    title: "Machine Learning Fundamentals",
    instructor: "David Chen",
    image:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    rating: 4.9,
    students: 2876,
    duration: "35h 15m",
    lessons: 62,
    price: 94.99,
    originalPrice: 139.99,
    instructorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass",
    instructor: "Emily Rodriguez",
    image:
      "https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    rating: 4.7,
    students: 1893,
    duration: "28h 45m",
    lessons: 54,
    progress: 100,
    price: 79.99,
    originalPrice: 119.99,
    category: "Design",
    instructorAvatar: "https://randomuser.me/api/portraits/women/43.jpg",
  },
  {
    id: 4,
    title: "Business Analytics Bootcamp",
    instructor: "Michael Thompson",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    rating: 4.6,
    students: 2156,
    duration: "42h 10m",
    lessons: 78,
    progress: 30,
    price: 99.99,
    originalPrice: 149.99,
    category: "Business",
    instructorAvatar: "https://randomuser.me/api/portraits/men/65.jpg",
  },
];
