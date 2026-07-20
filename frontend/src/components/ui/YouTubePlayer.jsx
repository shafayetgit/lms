"use client"

import React, { useEffect, useRef, useMemo } from "react"
import { Box } from "@mui/material"
import { getYouTubeEmbedUrl } from "@/utils/shared"

export default function YouTubePlayer({ videoUrl, preventSkipping, onEnded, startTime = 0, onTimeUpdate }) {
  const iframeRef = useRef(null)
  const playerRef = useRef(null)
  const maxTimeRef = useRef(startTime || 0)

  // Use refs for callbacks and inputs to keep useEffect dependencies stable
  const onTimeUpdateRef = useRef(onTimeUpdate)
  const startTimeRef = useRef(startTime)
  const onEndedRef = useRef(onEnded)

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate
  }, [onTimeUpdate])

  useEffect(() => {
    startTimeRef.current = startTime
  }, [startTime])

  useEffect(() => {
    onEndedRef.current = onEnded
  }, [onEnded])

  // Extract YouTube ID
  const videoId = useMemo(() => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = videoUrl.match(regExp)
      return (match && match[2].length === 11) ? match[2] : null
    } catch (e) {
      return null
    }
  }, [videoUrl])

  useEffect(() => {
    maxTimeRef.current = startTimeRef.current || 0
    let checkInterval

    // Load YouTube Iframe API
    if (typeof window !== "undefined" && !window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    const initPlayer = () => {
      if (!videoId || !window.YT || !window.YT.Player || !iframeRef.current) return
      
      // Clean up previous player
      if (playerRef.current) {
        try { playerRef.current.destroy() } catch (e) {}
      }

      playerRef.current = new window.YT.Player(iframeRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          start: Math.floor(startTimeRef.current || 0),
        },
        events: {
          onReady: (event) => {
            if (startTimeRef.current > 0) {
              event.target.seekTo(startTimeRef.current, true)
            }
          },
          onStateChange: (event) => {
            // YT.PlayerState.ENDED is 0
            if (event.data === 0) {
              if (onEndedRef.current) onEndedRef.current()
            }
          },
        },
      })

      // Track seeking to prevent skipping forward or to notify parent of time updates
      if (preventSkipping || onTimeUpdateRef.current) {
        checkInterval = setInterval(() => {
          if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
            const currentTime = playerRef.current.getCurrentTime()
            const state = playerRef.current.getPlayerState()
            
            if (onTimeUpdateRef.current) {
              onTimeUpdateRef.current(currentTime)
            }
            
            // If playing (state === 1)
            if (preventSkipping && state === 1) {
              if (currentTime > maxTimeRef.current + 2) {
                playerRef.current.seekTo(maxTimeRef.current, true)
              } else {
                maxTimeRef.current = Math.max(maxTimeRef.current, currentTime)
              }
            }
          }
        }, 500)
      }
    }

    // Wait until YT is ready
    if (typeof window !== "undefined") {
      if (window.YT && window.YT.Player) {
        initPlayer()
      } else {
        const prevCallback = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => {
          if (prevCallback) prevCallback()
          initPlayer()
        }
        
        const ytCheck = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(ytCheck)
            initPlayer()
          }
        }, 500)
      }
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval)
      if (playerRef.current) {
        try { playerRef.current.destroy() } catch (e) {}
      }
    }
  }, [videoId, preventSkipping])

  if (!videoId) {
    return (
      <Box
        component="iframe"
        src={getYouTubeEmbedUrl(videoUrl)}
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: 1,
          border: "none",
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Box ref={iframeRef} sx={{ width: "100%", height: "100%", borderRadius: 1 }} />
    </Box>
  )
}
