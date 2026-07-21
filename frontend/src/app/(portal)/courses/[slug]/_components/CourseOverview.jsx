import React from "react"
import { Box, Typography } from "@mui/material"
import { renderMarkdownOrHTML } from "@/utils/markdown"

export default function CourseOverview({ course }) {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography
        variant="h4"
        component="h2"
        sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}
      >
        Overview
      </Typography>
      {course.overview ? (
        <Box
          dangerouslySetInnerHTML={{ __html: renderMarkdownOrHTML(course.overview) }}
          sx={{
            color: "text.secondary",
            lineHeight: 1.8,
            fontSize: "1rem",
            textAlign: "justify",
            "& p": { my: 1.5 },
            "& ul, & ol": { pl: 3, my: 1.5 },
            "& li": { mb: 0.5 },
            "& h1, & h2, & h3": { color: "text.primary", mt: 2, mb: 1, fontWeight: 700 },
          }}
        />
      ) : (
        <Typography variant="body1" color="text.secondary" lineHeight={1.8} textAlign="justify">
          {course.short_introduction || "No description available."}
        </Typography>
      )}
    </Box>
  )
}
