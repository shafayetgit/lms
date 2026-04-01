"use client";
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Stack,
  LinearProgress,
  Chip,
  Grid,
} from "@mui/material";
import { MenuBook, AccessTime } from "@mui/icons-material";
import { motion } from "framer-motion";
import CButton from "@/components/CButton";
import Link from "next/link";

const cardHoverVariants = {
  rest: { y: 0, scale: 1, transition: { duration: 0.3, ease: "easeInOut" } },
  hover: { y: -8, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } },
};

const EnrolledCourseCard = ({ course }) => {
  return (
    <motion.div
      whileHover="hover"
      initial="rest"
      animate="rest"
      style={{ height: "100%" }}
    >
      <Card
        component={motion.div}
        variants={cardHoverVariants}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 2,
          position: "relative",
        }}
      >
        {/* Image */}
        <Box
          sx={{
            aspectRatio: "16 / 9",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.03)",
            position: "relative",
          }}
        >
          <motion.img
            src={course.image}
            alt={course.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)",
              display: "flex",
              alignItems: "flex-end",
              padding: 2,
            }}
          >
            <Chip
              label={course.category || "Course"}
              size="small"
              sx={{
                backgroundColor: "secondary.main",
                color: "white",
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        <CardContent>
          {/* Title */}
          <Typography variant="h6" component="h3" gutterBottom>
            {course.title}
          </Typography>

          {/* Instructor */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Avatar
              src={course.instructorAvatar}
              sx={{ width: 24, height: 24, mr: 1 }}
            />
            <Typography variant="body2" color="textSecondary">
              {course.instructor}
            </Typography>
          </Box>

          {/* Lessons & Duration */}
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Stack direction="row">
              <MenuBook
                sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
              />
              <Typography variant="body2" color="textSecondary">
                {course.lessons} Lessons
              </Typography>
            </Stack>
            <Stack direction="row">
              <AccessTime
                sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
              />
              <Typography variant="body2" color="textSecondary">
                {course.duration}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Continue Button */}
          <Grid
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Progress */}
            <Grid size={{ xs: 7, sm: 8 }}>
              <Typography variant="body2" mb={0.5}>
                Progress: {course.progress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={course.progress}
                sx={{ borderRadius: 1, height: 6 }}
              />
            </Grid>

            <Grid display="flex" justifyContent="flex-end">
              <CButton
                component={Link}
                href={`/accounts/courses/${course.id}`}
                label="Continue"
                size="small"
                color="secondary"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnrolledCourseCard;
