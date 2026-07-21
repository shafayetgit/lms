"use client"

import React, { useMemo, useEffect, useState } from "react"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  CircularProgress,
  List,
} from "@mui/material"
import { ExpandMore, MenuBookOutlined } from "@mui/icons-material"
import { useReadLessonsByChapterQuery } from "@/features/lesson/lessonAPI"
import { useRouter } from "next/navigation"
import LessonItem from "./LessonItem"
import LessonPreviewDialog from "./LessonPreviewDialog"

export default function CurriculumAccordion({
  chapter,
  index,
  isEnrolled,
  slug,
  completedLessons,
  activeLessonId,
  onSelectLesson,
  onLessonLoaded,
}) {
  const router = useRouter()
  const [previewLesson, setPreviewLesson] = useState(null)
  const { data: { data: lessons = [] } = {}, isLoading } = useReadLessonsByChapterQuery(
    { chapterId: chapter.public_id },
    { skip: !chapter.public_id }
  )

  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  }, [lessons])

  useEffect(() => {
    if (sortedLessons.length > 0 && onLessonLoaded) {
      onLessonLoaded(chapter.id, sortedLessons)
    }
  }, [sortedLessons, chapter.id, onLessonLoaded])

  return (
    <Accordion
      defaultExpanded={index === 0}
      disableGutters
      elevation={0}
      sx={{
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
        "&:before": { display: "none" },
        margin: "0 !important",
        "&.Mui-expanded": { margin: "0 !important" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          px: 0,
          py: 0,
          minHeight: 0,
          "&.Mui-expanded": {
            minHeight: 0,
          },
          "& .MuiAccordionSummary-content": {
            margin: "8px 0 !important",
          },
          "& .MuiAccordionSummary-expandIconWrapper": {
            transform: "none",
          },
          "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
            transform: "rotate(180deg)",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography
            fontWeight="bold"
            sx={{ pr: { sm: 2 }, fontSize: { xs: "0.9rem", sm: "1rem" } }}
          >
            {index + 1}. {chapter.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 0.5 }}
          >
            {isLoading ? (
              "..."
            ) : (
              <>
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  {sortedLessons.length} {sortedLessons.length === 1 ? "lesson" : "lessons"}
                </Box>
                <Box
                  component="span"
                  sx={{ display: { xs: "flex", sm: "none" }, alignItems: "center", gap: 0.5 }}
                >
                  {sortedLessons.length}
                  <MenuBookOutlined sx={{ fontSize: 16 }} />
                </Box>
              </>
            )}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : sortedLessons.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
            No lessons in this chapter
          </Typography>
        ) : (
          <List dense disablePadding>
            {sortedLessons.map(lesson => {
              const isActive = activeLessonId === lesson.public_id
              const isCompleted = completedLessons && !!completedLessons[lesson.id]
              return (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  isEnrolled={isEnrolled}
                  slug={slug}
                  onSelectLesson={onSelectLesson}
                  onPreviewClick={setPreviewLesson}
                  router={router}
                />
              )
            })}
          </List>
        )}
      </AccordionDetails>

      <LessonPreviewDialog lesson={previewLesson} onClose={() => setPreviewLesson(null)} />
    </Accordion>
  )
}
