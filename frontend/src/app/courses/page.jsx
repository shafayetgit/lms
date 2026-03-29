"use client";

import CourseCard from "@/components/CourseCard";
import { Box, Container, Grid } from "@mui/material";
import React from "react";
import CourseFilter from "./_partials/CourseFilter";
import CategoryFilter from "./_partials/Categories";
import PriceRange from "./_partials/PriceRange";
import RatingFilter from "./_partials/RatingFilter";

export default function page() {
  const [favorites, setFavorites] = React.useState({});

  const toggleFavorite = (courseId) => {
    setFavorites((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Box
              sx={{
                position: "sticky",
                top: 115, 
                alignSelf: "flex-start",
              }}
            >
              <CourseFilter />
              <CategoryFilter />
              <PriceRange />
              <RatingFilter />
            </Box>
          </Grid>
          <Grid
            container
            size={{ xs: 12, sm: 8, md: 9 }}
            spacing={3}
            justifyContent="center"
            alignItems="stretch"
          >
            {courses.map((course) => (
              <Grid size={{ xs: 12, sm: 6, md: 6 }} key={course.id}>
                <CourseCard
                  course={course}
                  isFavorite={favorites[course.id]}
                  onToggleFavorite={toggleFavorite}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
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
