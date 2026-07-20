"use client";
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Rating,
  IconButton,
  Divider,
  Stack,
  Chip,
  alpha,
  useTheme
} from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  MenuBook,
  AccessTime,
  ArrowForward,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import CButton from "@/components/ui/CButton";
import Link from "next/link";
import NeuralPanel from "./NeuralPanel";
import Image from "next/image";

const cardHoverVariants = {
  rest: { y: 0, transition: { duration: 0.5, ease: "circOut" } },
  hover: { y: -12, transition: { duration: 0.5, ease: "circOut" } },
};

const CourseCard = ({ course, isFavorite, onToggleFavorite }) => {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 1,
        overflow: "hidden",
        bgcolor: "background.paper",
        position: "relative",
      }}
    >
        <NeuralPanel particleCount={15} opacity={0.03} />

        {/* Favorite Button */}
        <IconButton
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.8)",
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            "&:hover": { backgroundColor: "white" },
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(course.id);
          }}
        >
          {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>

        {/* Image Section */}
        <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              position: 'relative'
            }}
          >
            <Image
              src={course.thumbnail?.startsWith('http') ? course.thumbnail : `/${course.thumbnail || 'default.jpg'}`}
              alt={course.title}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Box>
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
              bottom: 20,
              left: 20,
              backgroundColor: alpha(theme.palette.secondary.main, 1),
              color: "white",
              fontWeight: 900,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: 1,
              borderRadius: '6px'
            }}
          />
        </Box>

        <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Title */}
          <Typography variant="h6" component="h3" sx={{ fontWeight: 900, mb: 1, lineHeight: 1.3, color: 'primary.main', height: 48, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {course.title}
          </Typography>

          {/* Instructor and Rating */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src={course.instructorAvatar}
                sx={{ width: 28, height: 28, border: '2px solid white', boxShadow: theme.shadows[1] }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
                {course.instructor}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Rating value={course.rating} readOnly size="small" precision={0.1} />
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main' }}>{course.rating}</Typography>
            </Stack>
          </Stack>

          <Divider sx={{ mb: 3, opacity: 0.1 }} />

          <Stack direction="row" spacing={3} mb={4}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <MenuBook sx={{ fontSize: 14, color: alpha(theme.palette.primary.main, 0.4) }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{course.lessons} Lessons</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <AccessTime sx={{ fontSize: 14, color: alpha(theme.palette.primary.main, 0.4) }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{course.duration}</Typography>
            </Stack>
          </Stack>

          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -0.5 }}>
                ${course.price}
              </Typography>
              {course.originalPrice && (
                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.disabled', fontWeight: 700 }}>
                  ${course.originalPrice}
                </Typography>
              )}
            </Box>
            <CButton
              component={Link}
              href={`/courses/${course.id}`}
              label="Enroll Now"
              variant="contained"
              color="secondary"
              icon={<ArrowForward fontSize="small" />}
            />
          </Box>
        </CardContent>
      </Card>
  );
};

export default CourseCard;
