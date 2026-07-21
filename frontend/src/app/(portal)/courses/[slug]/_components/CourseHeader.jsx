import React from "react"
import { Typography, Stack, Rating } from "@mui/material"
import { MenuBook, FolderOpen } from "@mui/icons-material"

export default function CourseHeader({ course }) {
  return (
    <>
      <Typography
        variant="h2"
        component="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: "1.35rem", sm: "1.65rem", md: "1.85rem" },
          letterSpacing: "-0.02em",
          color: "text.primary",
          lineHeight: 1.2,
          mb: 1.5,
        }}
      >
        {course.title}
      </Typography>

      {/* Rating & Stats */}
      <Stack
        direction="row"
        spacing={{ xs: 1.5, sm: 2, md: 4 }}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Rating value={Number(course.avg_rating || 0)} readOnly size="small" precision={0.1} />
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
          >
            {Number(course.avg_rating || 0).toFixed(1)}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
          >
            ({course.total_reviews || 0} reviews)
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <MenuBook sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
            }}
          >
            {course.total_lessons || 0} Lessons
          </Typography>
        </Stack>

        {course.category && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <FolderOpen sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "text.secondary",
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              }}
            >
              {course.category.name}
            </Typography>
          </Stack>
        )}
      </Stack>
    </>
  )
}
