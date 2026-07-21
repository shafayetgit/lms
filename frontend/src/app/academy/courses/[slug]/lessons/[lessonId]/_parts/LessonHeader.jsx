import React from "react"
import { Box, Typography, Avatar, Tooltip, IconButton, CircularProgress } from "@mui/material"
import {
  CloseFullscreen,
  OpenInFull,
  DoneAll,
  Check,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material"

export default function LessonHeader({
  course,
  activeLesson,
  isCinemaMode,
  handleToggleCinemaMode,
  completedLessons,
  handleMarkComplete,
  isCompleting,
  prevLesson,
  nextLesson,
  handleSelectLesson,
  settings = {},
}) {
  const isVideoEnforced =
    activeLesson.lesson_type === "video" && (settings.enforce_video_completion ?? true)

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "flex-start" },
        mb: 2.5,
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight="800" sx={{ mb: 0.5 }}>
          {activeLesson.title}
        </Typography>
        {course.instructors && course.instructors.length > 0 && (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              src={course.instructors[0].avatar}
              sx={{ width: 20, height: 20, fontSize: "0.75rem" }}
            >
              {course.instructors[0].first_name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {`${course.instructors[0].first_name || ""} ${course.instructors[0].last_name || ""}`.trim()}
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: { xs: "flex-start", sm: "flex-end" },
          flexShrink: 0,
          width: { xs: "100%", sm: "auto" },
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Tooltip title={isCinemaMode ? "Exit theater mode" : "Theater mode"}>
          <IconButton
            size="small"
            onClick={handleToggleCinemaMode}
            sx={{
              display: { xs: "none", md: "inline-flex" },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "50%",
              p: 0.75,
              color: "text.secondary",
              "&:hover": {
                borderColor: "text.primary",
                color: "text.primary",
                bgcolor: "action.hover",
              },
            }}
          >
            {isCinemaMode ? (
              <CloseFullscreen sx={{ fontSize: 18 }} />
            ) : (
              <OpenInFull sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>

        {/* Mark as Completed / Completed Button */}
        {["video", "content"].includes(activeLesson.lesson_type) && (
          <>
            {completedLessons[activeLesson.id] ? (
              <Tooltip title="Completed">
                <span>
                  <IconButton
                    size="small"
                    disabled
                    sx={{
                      border: "1px solid",
                      borderColor: "success.light",
                      borderRadius: "50%",
                      p: 0.75,
                      color: "success.main",
                      bgcolor: "transparent",
                      "&.Mui-disabled": {
                        borderColor: "success.light",
                        color: "success.main",
                      },
                    }}
                  >
                    <DoneAll sx={{ fontSize: 18 }} />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <Tooltip
                title={isVideoEnforced ? "Watch the video fully to complete" : "Mark as Completed"}
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={handleMarkComplete}
                    disabled={isCompleting || isVideoEnforced}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "50%",
                      p: 0.75,
                      color: isVideoEnforced ? "text.disabled" : "text.secondary",
                      "&:hover": {
                        borderColor: isVideoEnforced ? "divider" : "primary.main",
                        color: isVideoEnforced ? "text.disabled" : "primary.main",
                        bgcolor: isVideoEnforced ? "transparent" : "action.hover",
                      },
                    }}
                  >
                    {isCompleting ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <Check sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </>
        )}

        {prevLesson && (
          <Tooltip title={prevLesson.title || "Previous Lesson"}>
            <IconButton
              size="small"
              onClick={() => handleSelectLesson(prevLesson)}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "50%",
                p: 0.75,
                color: "text.secondary",
                "&:hover": {
                  borderColor: "text.primary",
                  color: "text.primary",
                  bgcolor: "action.hover",
                },
              }}
            >
              <NavigateBefore sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={nextLesson ? nextLesson.title || "Next Lesson" : "No Next Lesson"}>
          <span>
            <IconButton
              size="small"
              disabled={!nextLesson}
              onClick={() => handleSelectLesson(nextLesson)}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "50%",
                p: 0.75,
                color: "text.primary",
                "&:hover": {
                  borderColor: "text.primary",
                  color: "text.primary",
                  bgcolor: "action.hover",
                },
              }}
            >
              <NavigateNext sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  )
}
