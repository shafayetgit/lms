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
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 2,
          position: "relative",
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
            backgroundColor: "#f5f5f5",
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
                backgroundColor: "primary.main",
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

          {/* Rating */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Rating
              value={course.rating}
              readOnly
              size="small"
              precision={0.1}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {course.rating}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
              ({course.students.toLocaleString()})
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

          {/* Price + Button */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" component="span">
                ${course.price}
              </Typography>
              {course.originalPrice && (
                <Typography
                  variant="body2"
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
            <CButton component={Link} href='/courses/detail' label="Enroll Now" size="small" />
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
