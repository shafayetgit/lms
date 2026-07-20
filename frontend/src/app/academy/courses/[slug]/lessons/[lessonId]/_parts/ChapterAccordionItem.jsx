import React, { useMemo, useEffect } from "react"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material"
import {
  ExpandMore,
  OndemandVideoOutlined,
  ArticleOutlined,
  HelpOutline,
  AssignmentOutlined,
  CheckCircle,
  LockOutlined,
} from "@mui/icons-material"
import { useReadLessonsByChapterQuery } from "@/features/lesson/lessonAPI"

export default function ChapterAccordionItem({
  chapter,
  index,
  activeLessonId,
  onSelectLesson,
  completedLessons,
  lockedLessons = {},
  onLessonLoaded,
}) {
  const { data: { data: lessons = [] } = {}, isLoading } = useReadLessonsByChapterQuery(
    { chapterId: chapter.public_id },
    { skip: !chapter.public_id }
  )

  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  }, [lessons])

  const [expanded, setExpanded] = React.useState(false)
  const [prevActiveLessonId, setPrevActiveLessonId] = React.useState(null)
  const [prevSortedLessons, setPrevSortedLessons] = React.useState([])

  if (activeLessonId !== prevActiveLessonId || sortedLessons !== prevSortedLessons) {
    setPrevActiveLessonId(activeLessonId)
    setPrevSortedLessons(sortedLessons)
    if (activeLessonId && sortedLessons.length > 0) {
      const hasActive = sortedLessons.some((l) => l.public_id === activeLessonId)
      setExpanded(hasActive)
    }
  }

  useEffect(() => {
    if (sortedLessons.length > 0 && onLessonLoaded) {
      onLessonLoaded(chapter.id, sortedLessons)
    }
  }, [sortedLessons, chapter.id, onLessonLoaded])

  const handleAccordionChange = (event, isExpanded) => {
    setExpanded(isExpanded)
  }

  const getLessonIcon = (type, isActive) => {
    const color = isActive ? "primary.main" : "text.secondary"
    switch (type) {
      case "video":
        return <OndemandVideoOutlined sx={{ fontSize: 18, color }} />
      case "content":
        return <ArticleOutlined sx={{ fontSize: 18, color }} />
      case "quiz":
        return <HelpOutline sx={{ fontSize: 18, color }} />
      case "assignment":
        return <AssignmentOutlined sx={{ fontSize: 18, color }} />
      default:
        return <OndemandVideoOutlined sx={{ fontSize: 18, color }} />
    }
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={handleAccordionChange}
      disableGutters
      elevation={0}
      sx={{
        backgroundColor: "transparent",
        border: "none",
        "&:before": { display: "none" },
        margin: "0 !important",
        "&.Mui-expanded": { margin: "0 !important" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore sx={{ fontSize: 18 }} />}
        sx={{
          px: 2,
          py: 0.5,
          minHeight: 0,
          borderBottom: "1px solid",
          borderColor: "divider",
          "&.Mui-expanded": { minHeight: 0 },
          flexDirection: "row-reverse",
          "& .MuiAccordionSummary-expandIconWrapper": {
            marginRight: 1,
            marginLeft: -0.5,
          }
        }}
      >
        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle2" fontWeight="600">
            {chapter.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
            {isLoading ? "..." : sortedLessons.length}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : sortedLessons.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ p: 2, display: "block", textAlign: "center" }}>
            No lessons in this chapter
          </Typography>
        ) : (
          <List dense disablePadding sx={{ px: 1, py: 0.5 }}>
            {sortedLessons.map((lesson) => {
              const isActive = activeLessonId === lesson.public_id
              const isCompleted = !!completedLessons[lesson.id]
              const isLocked = !!lockedLessons[lesson.id]
              return (
                <ListItemButton
                  key={lesson.id}
                  selected={isActive}
                  disabled={isLocked}
                  onClick={() => !isLocked && onSelectLesson(lesson)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderRadius: 1,
                    mb: 0.5,
                    "&:last-child": { mb: 0 },
                    bgcolor: isActive ? "action.selected" : "transparent",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                    "&.Mui-selected": {
                      bgcolor: "action.selected",
                      "&:hover": {
                        bgcolor: "action.selected",
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    {getLessonIcon(lesson.lesson_type, isActive)}
                  </ListItemIcon>
                  <ListItemText
                    primary={lesson.title}
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: isActive ? 600 : 500,
                      color: isLocked ? "text.disabled" : isActive ? "primary.main" : "text.primary",
                    }}
                  />
                  <Box sx={{ ml: 1, display: "flex", alignItems: "center" }}>
                    {isLocked ? (
                      <LockOutlined sx={{ fontSize: 16, color: "text.disabled" }} />
                    ) : isCompleted ? (
                      <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
                    ) : (
                      <Box sx={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid", borderColor: "text.disabled" }} />
                    )}
                  </Box>
                </ListItemButton>
              )
            })}
          </List>
        )}
      </AccordionDetails>
    </Accordion>
  )
}
