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
} from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  MenuBook,
  AccessTime,
  ArrowForward,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import CButton from "@/components/CButton";
import Link from "next/link";

const cardHoverVariants = {
  rest: { y: 0, scale: 1, transition: { duration: 0.3, ease: "easeInOut" } },
  hover: { y: -8, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } },
};

const CourseCard = ({ course, isFavorite, onToggleFavorite }) => {
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
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          position: "relative",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
          }
        }}
      >
        {/* Favorite Button */}
        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(255,255,255,0.8)",
            zIndex: 2,
            "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(course.id);
          }}
        >
          {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>

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
                "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)",
              display: "flex",
              alignItems: "flex-end",
              padding: 2,
            }}
          >
            <Chip
              label={course.category || "Course"}
              size="small"
              sx={{
                backgroundColor: "rgba(0,0,0,0.85)",
                color: "#ffffff",
                backdropFilter: "blur(4px)",
                fontWeight: 700,
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                borderRadius: "50px",
              }}
            />
          </Box>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Title */}
          <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.3, height: 48, overflow: "hidden" }}>
            {course.title}
          </Typography>

          {/* Instructor */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              src={course.instructorAvatar}
              sx={{ width: 22, height: 22, mr: 1 }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
              {course.instructor}
            </Typography>
          </Box>

          {/* Rating */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Rating
              value={course.rating}
              readOnly
              size="small"
              precision={0.1}
              sx={{ mt: 0.2 }}
            />
            <Typography variant="caption" sx={{ ml: 1, fontWeight: 700 }}>
              {course.rating}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
              ({course.students.toLocaleString()})
            </Typography>
          </Box>

          <Divider sx={{ mb: 2, opacity: 0.1 }} />

          {/* Lessons & Duration */}
          <Stack direction="row" spacing={2} mb={3}>
            <Stack direction="row" alignItems="center">
              <MenuBook
                sx={{ fontSize: 14, mr: 0.5, color: "text.secondary" }}
              />
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                {course.lessons} Lessons
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center">
              <AccessTime
                sx={{ fontSize: 14, mr: 0.5, color: "text.secondary" }}
              />
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                {course.duration}
              </Typography>
            </Stack>
          </Stack>

          {/* Price + Button */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
                ${course.price}
              </Typography>
              {course.originalPrice && (
                <Typography
                  variant="caption"
                  component="span"
                  sx={{
                    textDecoration: "line-through",
                    color: "text.secondary",
                    ml: 1,
                  }}
                >
                  ${course.originalPrice}
                </Typography>
              )}
            </Box>
            <CButton
              component={Link}
              href='/courses/detail'
              label="Enroll"
              size="small"
              color="secondary"
              endIcon={<ArrowForward sx={{ fontSize: "1.1rem" }} />}
              sx={{
                borderRadius: "50px",
                px: 3,
                py: 0.8,
                fontWeight: 700,
              }}
            />
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
