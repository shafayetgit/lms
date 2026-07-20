"use client"

import React from "react"
import { Box, Typography } from "@mui/material"
import CDialog from "@/components/ui/CDialog"
import { getYouTubeEmbedUrl } from "@/utils/shared"

const LessonPreviewDialog = React.memo(({ lesson, onClose }) => {
  return (
    <CDialog
      open={Boolean(lesson)}
      handleCDialogClose={onClose}
      title={lesson ? `Preview: ${lesson.title}` : ""}
      maxWidth="md"
    >
      {lesson && (
        <Box>
          {lesson.lesson_type === "video" && lesson.youtube ? (
            (() => {
              const youtubeEmbedUrl = getYouTubeEmbedUrl(lesson.youtube)
              if (youtubeEmbedUrl) {
                return (
                  <iframe
                    width="100%"
                    src={youtubeEmbedUrl}
                    title={lesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{
                      display: "block",
                      border: "none",
                      width: "100%",
                      aspectRatio: "16 / 9",
                      borderRadius: 4,
                    }}
                  />
                )
              }
              return (
                <video
                  width="100%"
                  controls
                  autoPlay
                  src={lesson.youtube}
                  style={{
                    display: "block",
                    borderRadius: 4,
                    backgroundColor: "black",
                    width: "100%",
                    aspectRatio: "16 / 9",
                  }}
                />
              )
            })()
          ) : (
            <Box sx={{ color: "text.primary" }}>
              <Typography variant="body1">
                {lesson.description || "No preview description available."}
              </Typography>
              {lesson.content && (
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                  <Typography variant="body2" color="text.secondary">
                    {lesson.content}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
    </CDialog>
  )
})

LessonPreviewDialog.displayName = "LessonPreviewDialog"

export default LessonPreviewDialog
