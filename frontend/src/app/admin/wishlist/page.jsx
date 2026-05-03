"use client";

import CourseCard from "@/components/ui/CourseCard";
import { Box, Typography, Stack, Grid, useTheme, alpha, Avatar } from "@mui/material";
import React, { useState } from "react";
import StudentLayout from "@/app/student/StudentLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Favorite, FavoriteBorder, SearchOutlined, ReceiptLong as ReceiptLongIcon, BookmarkOutlined } from "@mui/icons-material";
import CButton from "@/components/ui/CButton";

const initialCourses = [
  {
    id: 1,
    title: "Learn JavaScript and Express to become a Elite Architect",
    instructor: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    students: 1245,
    duration: "22h 30m",
    lessons: 48,
    progress: 65,
    price: 89.99,
    originalPrice: 129.99,
    category: "Web Engineering",
    instructorAvatar: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    id: 2,
    title: "Machine Learning Fundamentals for Global Finance",
    instructor: "David Chen",
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    students: 2876,
    duration: "35h 15m",
    lessons: 62,
    price: 94.99,
    originalPrice: 139.99,
    category: "Data Science",
    instructorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass & Modern Case Studies",
    instructor: "Emily Rodriguez",
    image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    students: 1893,
    duration: "28h 45m",
    lessons: 54,
    progress: 100,
    price: 79.99,
    originalPrice: 119.99,
    category: "Visual Design",
    instructorAvatar: "https://randomuser.me/api/portraits/women/43.jpg",
  },
  {
    id: 4,
    title: "Business Analytics Bootcamp with Real-world Data",
    instructor: "Michael Thompson",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    students: 2156,
    duration: "42h 10m",
    lessons: 78,
    progress: 30,
    price: 99.99,
    originalPrice: 149.99,
    category: "Data Analysis",
    instructorAvatar: "https://randomuser.me/api/portraits/men/65.jpg",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function WishlistPage() {
  const [favorites, setFavorites] = useState({ 1: true, 2: true, 3: true, 4: true });
  const theme = useTheme();

  const toggleFavorite = (courseId) => {
    setFavorites((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const wishlistedCourses = initialCourses.filter(course => favorites[course.id]);

  return (
    <StudentLayout>
      <Box
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        sx={{ width: "100%", pb: 10 }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Typography
              variant="h3"
              fontWeight="900"
              sx={{
                letterSpacing: "-0.04em",
                color: 'primary.main',
                mb: 1
              }}
            >
              Academic Watchlist
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: -0.5 }}>
              A curated collection of pursuits you intend to master in the future.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'rgba(0,0,0,0.03)',
              borderRadius: '12px',
              px: 2,
              py: 0.5,
              width: 280,
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <SearchOutlined sx={{ fontSize: 20, color: 'text.disabled', mr: 1 }} />
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>Search in watchlist...</Typography>
            </Box>
          </Box>
        </Box>

        {/* Wishlist Grid */}
        <AnimatePresence mode="popLayout">
          <Grid container spacing={4} sx={{ position: 'relative' }}>
            {wishlistedCourses.map((course) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={course.id}>
                <motion.div
                  variants={itemVariants}
                  layout
                  transition={{ duration: 0.4 }}
                  exit={{ opacity: 0, scale: 0.8 }}
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
        </AnimatePresence>

        {wishlistedCourses.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{
              py: 15,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'rgba(0,0,0,0.01)',
              borderRadius: '40px',
              border: '2px dashed rgba(0,0,0,0.05)',
              mt: 4
            }}>
              <Avatar sx={{ width: 100, height: 100, bgcolor: alpha(theme.palette.secondary.main, 0.1), mb: 4 }}>
                <BookmarkOutlined sx={{ fontSize: 50, color: 'secondary.main' }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: 'primary.main' }}>Watchlist Clear</Typography>
              <Typography variant="body1" sx={{ color: "text.secondary", mb: 5, textAlign: "center", maxWidth: 450 }}>
                Your academic watchlist is currently empty. Start exploring the marketplace to frame your next big achievement.
              </Typography>
              <CButton
                label="Explore Full Marketplace"
                variant="contained"
                color="primary"
                sx={{ borderRadius: "50px", px: 6, py: 2 }}
              />
            </Box>
          </motion.div>
        )}
      </Box>
    </StudentLayout>
  );
}
