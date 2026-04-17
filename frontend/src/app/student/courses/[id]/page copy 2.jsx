"use client";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Avatar,
  Stack,
  Divider,
  Button,
  Chip,
  Grid,
} from "@mui/material";
import { PlayCircle, MenuBook, AccessTime } from "@mui/icons-material";
import { motion } from "framer-motion";

export default function EnrolledCourseDetail() {
  const course = {
    title: "Modern React Development",
    instructor: "John Doe",
    image:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    progress: 45,
    lessons: 12,
    duration: "8h 30m",
    lessonsList: [
      { title: "Introduction to React", duration: "15m", completed: true },
      { title: "Components & Props", duration: "25m", completed: true },
      { title: "State & Lifecycle", duration: "40m", completed: false },
      { title: "Hooks Overview", duration: "30m", completed: false },
    ],
  };

  return (
    <Box maxWidth="lg" mx="auto" mt={4} px={2}>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {course.title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        by {course.instructor}
      </Typography>

      {/* Cover */}
      <Card
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          mb: 4,
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            position: "relative",
            aspectRatio: "16/9",
            backgroundColor: "#f5f5f5",
          }}
        >
          <motion.img
            src={course.image}
            alt={course.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          />
          <Chip
            label={`${course.progress}% Completed`}
            color="primary"
            sx={{ position: "absolute", top: 16, right: 16 }}
          />
        </Box>
        <CardContent>
          {/* Progress */}
          <Typography variant="body2" mb={0.5}>
            Course Progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={course.progress}
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />

          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <MenuBook fontSize="small" color="action" />
                <Typography variant="body2">
                  {course.lessons} Lessons
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AccessTime fontSize="small" color="action" />
                <Typography variant="body2">{course.duration}</Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Continue Button */}
          <Button
            variant="contained"
            startIcon={<PlayCircle />}
            size="large"
            fullWidth
            sx={{ borderRadius: 2 }}
          >
            Continue Course
          </Button>
        </CardContent>
      </Card>

      {/* Lessons */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Lessons
      </Typography>
      <Stack spacing={2}>
        {course.lessonsList.map((lesson, index) => (
          <Card
            key={index}
            sx={{
              p: 2,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: 1,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar>{index + 1}</Avatar>
              <Box>
                <Typography variant="subtitle1">{lesson.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {lesson.duration}
                </Typography>
              </Box>
            </Stack>
            {lesson.completed ? (
              <Chip label="Completed" color="success" size="small" />
            ) : (
              <Chip label="Pending" color="warning" size="small" />
            )}
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

// Example dummy data
EnrolledCourseDetail.defaultProps = {
  course: {
    title: "Modern React Development",
    instructor: "John Doe",
    image: "/course-cover.jpg",
    progress: 45,
    lessons: 12,
    duration: "8h 30m",
    lessonsList: [
      { title: "Introduction to React", duration: "15m", completed: true },
      { title: "Components & Props", duration: "25m", completed: true },
      { title: "State & Lifecycle", duration: "40m", completed: false },
      { title: "Hooks Overview", duration: "30m", completed: false },
    ],
  },
};
