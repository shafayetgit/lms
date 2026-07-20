import React from "react";
import { Box, Card, Typography, CircularProgress } from "@mui/material";
import ChapterAccordion from "@/components/course/CurriculumAccordion";

export default function CourseCurriculum({
  isChaptersLoading,
  sortedChapters,
  isEnrolled,
  slug,
  completedLessons,
}) {
  return (
    <Card variant="outlined" sx={{ p: 3, borderRadius: 1, mb: 3 }}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}>
        Curriculum
      </Typography>

      {isChaptersLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress />
        </Box>
      ) : sortedChapters.length === 0 ? (
        <Typography color="text.secondary">No curriculum available for this course yet.</Typography>
      ) : (
        sortedChapters.map((chapter, index) => (
          <ChapterAccordion
            key={chapter.id}
            chapter={chapter}
            index={index}
            isFirst={index === 0}
            isLast={index === sortedChapters.length - 1}
            isEnrolled={isEnrolled}
            slug={slug}
            completedLessons={completedLessons}
          />
        ))
      )}
    </Card>
  );
}
