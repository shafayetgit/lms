import React from "react"
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import { useRouter } from "next/navigation"
import { OfflinePin, HelpOutline, Lightbulb } from "@mui/icons-material"
import ChapterAccordionItem from "./ChapterAccordionItem"

export default function CourseSidebar({
  course,
  courseProgressPercent,
  sortedChapters,
  activeLesson,
  handleSelectLesson,
  completedLessons,
  lockedLessons = {},
  handleLessonLoaded,
}) {
  const router = useRouter()

  return (
    <Box
      sx={{
        position: { md: "sticky" },
        top: { md: 88 },
        mt: { xs: 0, md: 0 },
        maxHeight: { xs: "none", md: "calc(100vh - 120px)" },
        overflowY: { xs: "visible", md: "auto" },
        pr: { md: 1 },
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "divider",
          borderRadius: 2,
        },
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          bgcolor: "background.paper",
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight="800"
          color="text.primary"
          onClick={() => router.push(`/academy/courses/${course.slug}`)}
          sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
        >
          {course.title}
        </Typography>
        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Course Progress
            </Typography>
            <Typography variant="caption" color="primary.main" fontWeight={700}>
              {courseProgressPercent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={courseProgressPercent}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "action.hover",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
              }
            }}
          />
        </Box>
      </Paper>

      <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden", mb: 3 }}>
        <Box>
          {sortedChapters.map((chapter, index) => (
            <ChapterAccordionItem
              key={chapter.id}
              chapter={chapter}
              index={index}
              activeLessonId={activeLesson?.public_id}
              onSelectLesson={handleSelectLesson}
              completedLessons={completedLessons}
              lockedLessons={lockedLessons}
              onLessonLoaded={handleLessonLoaded}
            />
          ))}
        </Box>
      </Box>

      {/* Helpline / Info Sidebar (Required by Rule: Always keep helpline sidebar to the right) */}
      <HelplineCard />
    </Box>
  )
}

function HelplineCard() {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 1,
        bgcolor: "background.paper",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="subtitle2"
        fontWeight={800}
        sx={{ mb: 2, letterSpacing: 0.5, textTransform: "uppercase", color: "text.secondary", fontSize: "0.75rem" }}
      >
        Player Helpline & Tips
      </Typography>
      <List disablePadding>
        {[
          {
            icon: <OfflinePin sx={{ color: "success.main", fontSize: 20 }} />,
            primary: "Lesson Completion",
            secondary: "Complete reading material or video to auto-check. You can manually complete them with the top check button.",
          },
          {
            icon: <HelpOutline sx={{ color: "info.main", fontSize: 20 }} />,
            primary: "Interactive Quizzes",
            secondary: "Save draft answers automatically. Mark tricky questions for review. Check feedback once submitted.",
          },
          {
            icon: <Lightbulb sx={{ color: "warning.main", fontSize: 20 }} />,
            primary: "Community Q&A",
            secondary: "Ask questions, share insights, or start a new thread directly in the Community tab.",
          },
        ].map((item, index) => (
          <ListItem key={index} sx={{ px: 0, alignItems: "flex-start", mb: index === 2 ? 0 : 2 }}>
            <ListItemIcon sx={{ minWidth: 28, mt: 0.25 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.primary}
              secondary={item.secondary}
              primaryTypographyProps={{ fontWeight: 700, variant: "body2", color: "text.primary" }}
              secondaryTypographyProps={{ variant: "caption", color: "text.secondary", sx: { mt: 0.25, display: "block", lineHeight: 1.4 } }}
              sx={{ m: 0 }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}
