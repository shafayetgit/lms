"use client"

import React from "react"
import { Box } from "@mui/material"
import CVideoPlayer from "@/components/ui/CVideoPlayer"

export default function VideoPlayer({
  activeLesson,
  isCinemaMode,
  settings = {},
  onVideoEnded,
  startTime = 0,
  onTimeUpdate,
}) {
  if (activeLesson?.lesson_type !== "video") return null

  const videoUrl = activeLesson.body || activeLesson.youtube
  const preventSkipping = !!settings.prevent_skipping_videos

  if (isCinemaMode) {
    return (
      <Box sx={{ width: "100%", mb: 3 }}>
        <CVideoPlayer
          videoUrl={videoUrl}
          preventSkipping={preventSkipping}
          onEnded={onVideoEnded}
          startTime={startTime}
          onTimeUpdate={onTimeUpdate}
          sx={{ boxShadow: 3, borderRadius: 1 }}
        />
      </Box>
    )
  }

  return (
    <Box sx={{ mb: { xs: 0, md: 3 } }}>
      <CVideoPlayer
        videoUrl={videoUrl}
        preventSkipping={preventSkipping}
        onEnded={onVideoEnded}
        startTime={startTime}
        onTimeUpdate={onTimeUpdate}
      />
    </Box>
  )
}
