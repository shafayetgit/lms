"use client"

import React, { useMemo } from "react"
import { Box, Alert } from "@mui/material"
import YouTubePlayer from "./YouTubePlayer"
import HTML5Player from "./HTML5Player"

export default function CVideoPlayer({ videoUrl, preventSkipping = false, onEnded, startTime = 0, onTimeUpdate, sx = {} }) {
  const isYouTube = useMemo(() => {
    if (!videoUrl) return false
    return !!(videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"))
  }, [videoUrl])

  if (!videoUrl) {
    return (
      <Alert severity="info" sx={{ borderRadius: 1, ...sx }}>
        No video URL found.
      </Alert>
    )
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        borderRadius: 1,
        overflow: "hidden",
        boxShadow: 2,
        bgcolor: "black",
        ...sx,
      }}
    >
      {isYouTube ? (
        <YouTubePlayer
          videoUrl={videoUrl}
          preventSkipping={preventSkipping}
          onEnded={onEnded}
          startTime={startTime}
          onTimeUpdate={onTimeUpdate}
        />
      ) : (
        <HTML5Player
          src={videoUrl}
          preventSkipping={preventSkipping}
          onEnded={onEnded}
          startTime={startTime}
          onTimeUpdate={onTimeUpdate}
        />
      )}
    </Box>
  )
}
