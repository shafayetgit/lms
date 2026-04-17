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
  alpha,
  useTheme
} from "@mui/material";
import { MenuBook, AccessTime, PlayCircleFilled } from "@mui/icons-material";
import { motion } from "framer-motion";
import CButton from "@/components/ui/CButton";
import Link from "next/link";
import NeuralPanel from "./NeuralPanel";

const cardHoverVariants = {
  rest: { y: 0, transition: { duration: 0.5, ease: "circOut" } },
  hover: { y: -12, transition: { duration: 0.5, ease: "circOut" } },
};

const EnrolledCourseCard = ({ course }) => {
  const theme = useTheme();

  return (
    <motion.div
      whileHover="hover"
      initial="rest"
      animate="rest"
      variants={cardHoverVariants}
      style={{ height: "100%" }}
    >
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: '28px',
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.06)",
          bgcolor: "rgba(255, 255, 255, 0.6) !important",
          backdropFilter: "blur(10px)",
          position: "relative",
          transition: "box-shadow 0.4s ease",
          "&:hover": {
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.12)",
          }
        }}
      >
        <NeuralPanel particleCount={15} opacity={0.05} />

        {/* Hero Image Section */}
        <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          <Box
            component="img"
            src={course.image}
            alt={course.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: 'transform 0.8s cubic-bezier(0.2, 1, 0.3, 1)',
              '.hover &': { transform: 'scale(1.1)' }
            }}
          />
          <Box sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)'
          }} />
          <Chip
            label={course.category || "Course"}
            size="small"
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              backgroundColor: alpha(theme.palette.secondary.main, 0.9),
              color: "white",
              fontWeight: 900,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: 1,
              backdropFilter: 'blur(4px)'
            }}
          />
          {course.progress === 100 && (
            <Chip
              label="Completed"
              size="small"
              sx={{
                position: 'absolute',
                top: 20,
                left: 20,
                backgroundColor: '#10b981',
                color: "white",
                fontWeight: 900,
                fontSize: '0.65rem',
                textTransform: 'uppercase'
              }}
            />
          )}
        </Box>

        <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Title */}
          <Typography variant="h6" component="h3" sx={{ fontWeight: 900, mb: 2, lineHeight: 1.3, color: 'primary.main' }}>
            {course.title}
          </Typography>

          {/* Instructor & Metadata */}
          <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <Avatar
              src={course.instructorAvatar}
              sx={{ width: 32, height: 32, border: '2px solid white', boxShadow: theme.shadows[1] }}
            />
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800, display: 'block' }}>
                {course.instructor}
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <MenuBook sx={{ fontSize: 14, color: alpha(theme.palette.primary.main, 0.4) }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{course.lessons} Lessons</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <AccessTime sx={{ fontSize: 14, color: alpha(theme.palette.primary.main, 0.4) }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{course.duration}</Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>

          <Box sx={{ mt: 'auto' }}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.65rem', letterSpacing: 0.5 }}>COURSE PROGRESS</Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'secondary.main' }}>{course.progress}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={course.progress}
                sx={{
                  borderRadius: 10,
                  height: 6,
                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'secondary.main',
                    borderRadius: 10
                  }
                }}
              />
            </Box>

            <CButton
              component={Link}
              href={`/panel/courses/${course.id}`}
              label={course.progress > 0 ? "Continue Learning" : "Start Course"}
              variant={course.progress > 0 ? "contained" : "outlined"}
              fullWidth
              color="secondary"
              sx={{
                borderRadius: '16px',
                py: 1.5,
                fontWeight: 900,
                boxShadow: course.progress > 0 ? `0 10px 20px -5px ${alpha(theme.palette.secondary.main, 0.3)}` : 'none'
              }}
              icon={<PlayCircleFilled fontSize="small" />}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnrolledCourseCard;
