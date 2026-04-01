"use client";
import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Tabs,
  Tab,
  Stack,
  Paper,
  LinearProgress,
  useTheme
} from "@mui/material";
import {
  School,
  EmojiEvents,
  HistoryEdu,
  PlayCircleOutline
} from "@mui/icons-material";
import AccountsLayout from "../AccountsLayout";
import EnrolledCourseCard from "@/components/EnrolledCourseCard";
import CButton from "@/components/CButton";

const courses = [
  {
    id: 1,
    title: "Learn JavaScript and Express to become a Expert",
    instructor: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&q=80&w=400",
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
    title: "Machine Learning Fundamentals",
    instructor: "David Chen",
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=400",
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
    title: "UI/UX Design Masterclass",
    instructor: "Emily Rodriguez",
    image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&q=80&w=400",
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
    title: "Business Analytics Bootcamp",
    instructor: "Michael Thompson",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400",
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

export default function MyCoursesPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();

  const filteredCourses = courses.filter((course) => {
    if (tabIndex === 1) return course.progress > 0 && course.progress < 100;
    if (tabIndex === 2) return course.progress === 100;
    return true;
  });

  const lastActiveCourse = courses[0]; // Logic for last active course placeholder

  return (
    <AccountsLayout pageTitle="My Learning">
      <Stack spacing={4}>
        {/* Weekly Progress Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 6,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
            border: "1px solid",
            borderColor: "rgba(0,0,0,0.06)",
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box sx={{ p: 1, bgcolor: 'secondary.main', color: 'white', borderRadius: 2 }}>
                  <PlayCircleOutline />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main', textTransform: 'uppercase' }}>
                    Resume Learning
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {lastActiveCourse.title}
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ width: '100%', mb: 1 }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Overall Progress</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.main' }}>{lastActiveCourse.progress}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={lastActiveCourse.progress}
                  sx={{ height: 8, borderRadius: 5, bgcolor: 'rgba(0,0,0,0.05)', '& .MuiLinearProgress-bar': { borderRadius: 5 } }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <CButton
                  label="Continue"
                  variant="contained"
                  color="secondary"
                  sx={{ borderRadius: '50px', px: 4 }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabIndex}
            onChange={(e, v) => setTabIndex(v)}
            sx={{
              "& .MuiTabs-indicator": { height: 3, borderRadius: '3px 3px 0 0' },
              "& .MuiTab-root": { fontWeight: 700, fontSize: '0.9rem' }
            }}
          >
            <Tab label={`All (${courses.length})`} />
            <Tab label="In Progress" />
            <Tab label="Completed" />
          </Tabs>
        </Box>

        {/* Courses Grid */}
        <Grid container spacing={3}>
          {filteredCourses.map((course) => (
            <Grid size={{ xs: 12, sm: 6 }} key={course.id}>
              <EnrolledCourseCard course={course} />
            </Grid>
          ))}
          {filteredCourses.length === 0 && (
            <Grid size={12}>
              <Stack spacing={2} py={12} alignItems="center">
                <School sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.15 }} />
                <Typography variant="h6" color="text.secondary" fontWeight={700}>
                  No courses found in this category.
                </Typography>
                <CButton
                  label="Explore Courses"
                  variant="outlined"
                  sx={{ borderRadius: '50px', mt: 2 }}
                />
              </Stack>
            </Grid>
          )}
        </Grid>
      </Stack>
    </AccountsLayout>
  );
}
