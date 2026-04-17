"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Stack,
  LinearProgress,
  useTheme,
  alpha,
  Grid,
  Avatar,
  Chip,
  Card,
  CardContent,
  IconButton
} from "@mui/material";
import {
  School,
  PlayCircleOutline,
  TrendingUp,
  BookmarkBorder,
  AutoStoriesOutlined,
  EmojiEventsOutlined,
  SearchOutlined
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import StudentLayout from "../StudentLayout";
import EnrolledCourseCard from "@/components/ui/EnrolledCourseCard";
import CButton from "@/components/ui/CButton";
import NeuralPanel from "@/components/ui/NeuralPanel";

const courses = [
  {
    id: 1,
    title: "Learn JavaScript and Express to become a Expert",
    instructor: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    students: 1245,
    duration: "22h 30m",
    lessons: 48,
    progress: 65,
    price: 89.99,
    category: "Web Development",
    instructorAvatar: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    id: 2,
    title: "Machine Learning Fundamentals for FinTech",
    instructor: "David Chen",
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    students: 2876,
    duration: "35h 15m",
    lessons: 62,
    progress: 15,
    price: 94.99,
    category: "Data Science",
    instructorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass & Case Studies",
    instructor: "Emily Rodriguez",
    image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    students: 1893,
    duration: "28h 45m",
    lessons: 54,
    progress: 100,
    price: 79.99,
    category: "Design",
    instructorAvatar: "https://randomuser.me/api/portraits/women/43.jpg",
  },
  {
    id: 4,
    title: "Business Analytics Bootcamp with Tableau",
    instructor: "Michael Thompson",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    students: 2156,
    duration: "42h 10m",
    lessons: 78,
    progress: 0,
    price: 99.99,
    category: "Business",
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

export default function MyCoursesPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();

  const filteredCourses = courses.filter((course) => {
    if (tabIndex === 1) return course.progress > 0 && course.progress < 100;
    if (tabIndex === 2) return course.progress === 100;
    return true;
  });

  const lastActiveCourse = courses[0];

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
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              letterSpacing: "-0.04em",
              color: 'primary.main',
              mb: 1
            }}
          >
            My Learning Console
          </Typography>
          <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: -0.5 }}>
            Manage your academic journey and track your progression milestones.
          </Typography>
        </Box>

        {/* Premium Resume Learning Hero */}
        <motion.div variants={itemVariants}>
          <Card
            elevation={0}
            sx={{
              p: 0,
              borderRadius: '32px',
              position: 'relative',
              overflow: 'hidden',
              mb: 8,
              background: theme.palette.mode === 'light' ? 'white' : alpha(theme.palette.primary.main, 0.1),
              border: '1px solid rgba(0,0,0,0.06)',
              minHeight: 240,
              display: 'flex'
            }}
          >
            <NeuralPanel particleCount={30} opacity={0.1} />
            <Grid container spacing={0} sx={{ flexGrow: 1 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ position: 'relative', height: '100%', minHeight: 200 }}>
                  <Box
                    component="img"
                    src={lastActiveCourse.image}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, rgba(255,255,255,1))' }} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <CardContent sx={{ p: 5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Chip
                      icon={<TrendingUp sx={{ fontSize: 14 }} />}
                      label="Most Active"
                      size="small"
                      sx={{ fontWeight: 900, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main', borderRadius: '6px' }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>RESUME LEARNING</Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, color: 'primary.main', letterSpacing: -1 }}>
                    {lastActiveCourse.title}
                  </Typography>

                  <Box sx={{ width: '100%', maxWidth: 500, mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.7rem' }}>MODULE COMPLETION</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'secondary.main' }}>{lastActiveCourse.progress}% REACHED</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={lastActiveCourse.progress}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        bgcolor: alpha(theme.palette.secondary.main, 0.05),
                        '& .MuiLinearProgress-bar': { borderRadius: 5, bgcolor: 'secondary.main' }
                      }}
                    />
                  </Box>

                  <Stack direction="row" spacing={2}>
                    <CButton
                      label="Continue Session"
                      variant="contained"
                      color="secondary"
                      sx={{ borderRadius: '16px', px: 5, py: 1.5, fontWeight: 900 }}
                    />
                    <IconButton sx={{ bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '16px', width: 54 }}>
                      <BookmarkBorder />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </motion.div>

        {/* Content Section */}
        <Stack spacing={4}>
          {/* Custom Interactive Tabs */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            pb: 0
          }}>
            <Tabs
              value={tabIndex}
              onChange={(e, v) => setTabIndex(v)}
              sx={{
                "& .MuiTabs-indicator": {
                  height: 4,
                  borderRadius: '4px 4px 0 0',
                  bgcolor: 'secondary.main'
                },
                "& .MuiTab-root": {
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  letterSpacing: 0,
                  minWidth: 100,
                  px: 3,
                  py: 2.5,
                  color: 'text.secondary',
                  transition: 'all 0.3s ease',
                  "&.Mui-selected": {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <Tab
                icon={<AutoStoriesOutlined sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label={`All Courses (${courses.length})`}
              />
              <Tab
                icon={<PlayCircleOutline sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label="Active Progress"
              />
              <Tab
                icon={<EmojiEventsOutlined sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label="Achievements"
              />
            </Tabs>

            <Stack direction="row" spacing={2}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'rgba(0,0,0,0.03)',
                borderRadius: '12px',
                px: 2,
                py: 0.5,
                width: 240
              }}>
                <SearchOutlined sx={{ fontSize: 20, color: 'text.disabled', mr: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>Search courses...</Typography>
              </Box>
            </Stack>
          </Box>

          {/* Courses Grid with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tabIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={4}>
                {filteredCourses.map((course) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={course.id}>
                    <EnrolledCourseCard course={course} />
                  </Grid>
                ))}

                {filteredCourses.length === 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{
                      py: 15,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      bgcolor: 'rgba(0,0,0,0.01)',
                      borderRadius: '40px',
                      border: '1px dashed rgba(0,0,0,0.05)'
                    }}>
                      <Avatar sx={{ width: 80, height: 80, bgcolor: alpha(theme.palette.secondary.main, 0.1), mb: 3 }}>
                        <School sx={{ fontSize: 40, color: 'secondary.main' }} />
                      </Avatar>
                      <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: 'primary.main' }}>No Courses Found</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center', maxWidth: 300 }}>
                        You don't have any courses in this category yet. Start a new journey today!
                      </Typography>
                      <CButton
                        label="Explore Catalog"
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: '16px', px: 5 }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </motion.div>
          </AnimatePresence>
        </Stack>
      </Box>
    </StudentLayout>
  );
}
