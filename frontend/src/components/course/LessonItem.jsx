"use client"

import React from "react"
import { ListItem, ListItemButton, ListItemIcon, ListItemText, Button, Box } from "@mui/material"
import {
  PlayCircleOutline,
  Article,
  HelpOutline,
  AssignmentOutlined,
  CheckCircleOutline,
  VisibilityOutlined,
} from "@mui/icons-material"

const LessonItem = React.memo(
  ({ lesson, isActive, isCompleted, isEnrolled, slug, onSelectLesson, onPreviewClick, router }) => {
    const getLessonIcon = type => {
      if (isCompleted) {
        return <CheckCircleOutline sx={{ fontSize: 18, color: "success.main" }} />
      }
      switch (type) {
        case "video":
          return <PlayCircleOutline sx={{ fontSize: 18, color: "error.main" }} />
        case "content":
          return <Article sx={{ fontSize: 18, color: "primary.main" }} />
        case "quiz":
          return <HelpOutline sx={{ fontSize: 18, color: "warning.main" }} />
        case "assignment":
          return <AssignmentOutlined sx={{ fontSize: 18, color: "success.main" }} />
        default:
          return <PlayCircleOutline sx={{ fontSize: 18, color: "text.secondary" }} />
      }
    }

    const content = (
      <>
        <ListItemIcon sx={{ minWidth: 32 }}>{getLessonIcon(lesson.lesson_type)}</ListItemIcon>
        <ListItemText
          primary={lesson.title}
          primaryTypographyProps={{
            variant: "body2",
            fontWeight: isActive ? 600 : 500,
            color: isActive ? "primary.main" : isCompleted ? "text.secondary" : "text.primary",
            textDecoration: isCompleted ? "line-through" : "none",
          }}
        />
      </>
    )

    if (isEnrolled) {
      return (
        <ListItemButton
          onClick={() => {
            if (onSelectLesson) {
              onSelectLesson(lesson)
            } else {
              router.push(`/academy/courses/${slug}/lessons/${lesson.public_id}`)
            }
          }}
          selected={isActive}
          sx={{
            py: { xs: 0.5, sm: 1 },
            pl: { xs: 0.5, sm: 1.5 },
            pr: 1,
            borderRadius: 1,
            mb: 0.5,
            "&.Mui-selected": {
              bgcolor: "action.selected",
              color: "primary.main",
              fontWeight: 600,
            },
          }}
        >
          {content}
        </ListItemButton>
      )
    }

    if (lesson.include_in_preview) {
      return (
        <ListItem
          sx={{
            py: { xs: 0.5, sm: 1 },
            pl: { xs: 0.5, sm: 1.5 },
            pr: { xs: 6, sm: 10 },
          }}
          secondaryAction={
            <Button
              size="small"
              variant="text"
              onClick={() => onPreviewClick(lesson)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                minWidth: { xs: 0, sm: 64 },
                p: { xs: 1, sm: "4px 8px" },
              }}
            >
              <VisibilityOutlined sx={{ fontSize: 18, mr: { xs: 0, sm: 0.5 } }} />
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Preview
              </Box>
            </Button>
          }
        >
          {content}
        </ListItem>
      )
    }

    return (
      <ListItem
        sx={{
          py: { xs: 0.5, sm: 1 },
          pl: { xs: 0.5, sm: 1.5 },
          pr: 1,
        }}
      >
        {content}
      </ListItem>
    )
  }
)

LessonItem.displayName = "LessonItem"

export default LessonItem
