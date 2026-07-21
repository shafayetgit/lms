"use client"

import React, { useEffect, useRef } from "react"
import { Box } from "@mui/material"

export default function HTML5Player({
  src,
  preventSkipping,
  onEnded,
  startTime = 0,
  onTimeUpdate,
}) {
  const maxTimeRef = useRef(startTime || 0)
  const videoRef = useRef(null)
  const hasSeekedRef = useRef(false)

  useEffect(() => {
    hasSeekedRef.current = false
  }, [src])

  useEffect(() => {
    maxTimeRef.current = startTime || 0
    if (videoRef.current && startTime > 0 && !hasSeekedRef.current) {
      videoRef.current.currentTime = startTime
      hasSeekedRef.current = true
    }
  }, [src, startTime])

  const handleTimeUpdate = e => {
    const video = e.target
    if (onTimeUpdate) {
      onTimeUpdate(video.currentTime)
    }
    if (preventSkipping) {
      if (video.currentTime > maxTimeRef.current + 2) {
        video.currentTime = maxTimeRef.current
      } else {
        maxTimeRef.current = Math.max(maxTimeRef.current, video.currentTime)
      }
    }
  }

  const handleSeeking = e => {
    const video = e.target
    if (preventSkipping) {
      if (video.currentTime > maxTimeRef.current) {
        video.currentTime = maxTimeRef.current
      }
    }
  }

  return (
    <Box
      component="video"
      ref={videoRef}
      src={src}
      controls
      onTimeUpdate={handleTimeUpdate}
      onSeeking={handleSeeking}
      onEnded={onEnded}
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: 1,
        bgcolor: "black",
      }}
    />
  )
}
