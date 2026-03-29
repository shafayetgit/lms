"use client";
import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import CourseCard from "@/components/CourseCard";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const FeaturedCourses = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [favorites, setFavorites] = React.useState({});

  const toggleFavorite = (courseId) => {
    setFavorites((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  // Sample featured courses data
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

  return (
    <Box sx={{ py: 7 }}>
      <Container maxWidth="lg">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.mode === "dark" ? "white" : "#2d2d2d",
            }}
          >
            Featured Courses
          </Typography>
          <Typography
            variant="h6"
            component="p"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: "auto" }}
          >
            Discover our most popular and highly rated courses taught by
            industry experts
          </Typography>
        </motion.div>

        {/* Course Grid */}
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
      </Container>
    </Box>
  );
};

export default FeaturedCourses;
