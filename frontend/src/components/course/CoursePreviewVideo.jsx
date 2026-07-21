"use client"

import React, { useState } from "react"
import { Card, CardMedia, Box, Typography, Dialog, DialogContent, alpha } from "@mui/material"
import { PlayCircleFilledWhite } from "@mui/icons-material"
import { motion } from "framer-motion"
import Image from "next/image"
import { getYouTubeEmbedUrl, getGradient } from "@/utils/shared"

export default function CoursePreviewVideo({ course }) {
  const [videoOpen, setVideoOpen] = useState(false)
  const hasVideo = Boolean(course.video)
  const gradient = getGradient(course.card_gradient)

  const renderVideo = () => {
    const youtubeEmbedUrl = getYouTubeEmbedUrl(course.video)
    if (youtubeEmbedUrl) {
      return (
        <iframe
          width="100%"
          src={youtubeEmbedUrl}
          title="Course Preview Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            display: "block",
            border: "none",
            width: "100%",
            aspectRatio: "16 / 9",
          }}
        />
      )
    }
    return (
      <video
        width="100%"
        controls
        autoPlay
        src={course.video}
        style={{
          display: "block",
          borderRadius: 0,
          backgroundColor: "black",
          width: "100%",
          aspectRatio: "16 / 9",
        }}
      />
    )
  }

  return (
    <Card
      variant="outlined"
      sx={{
        mt: { xs: -4, md: 0 }, // Remove gap between Topbar and Video on mobile
        mb: 2,
        mx: { xs: -1, sm: -2, md: 0 }, // Pull to edges on mobile (8px -> 0px)
        borderRadius: { xs: 0, md: 1 }, // Flat on mobile
        border: { xs: "none", md: theme => `1px solid ${theme.palette.divider}` },
        overflow: "hidden",
      }}
    >
      {videoOpen && hasVideo ? (
        <Box sx={{ bgcolor: "black", width: "100%" }}>{renderVideo()}</Box>
      ) : (
        <CardMedia
          component="div"
          onClick={() => hasVideo && setVideoOpen(true)}
          sx={{
            height: { xs: 250, md: 400 },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: hasVideo ? "pointer" : "default",
            position: "relative",
            background: !course.thumbnail ? gradient : "transparent",
            "&:hover .play-overlay": hasVideo
              ? {
                  transform: "scale(1.05)",
                  backgroundColor: theme => alpha(theme.palette.common.white, 0.15),
                }
              : {},
          }}
          aria-label={hasVideo ? "Watch course preview video" : "Course thumbnail"}
          role={hasVideo ? "button" : "img"}
          tabIndex={hasVideo ? 0 : -1}
          onKeyDown={e => e.key === "Enter" && hasVideo && setVideoOpen(true)}
        >
          {course.thumbnail && (
            <Image
              src={course.thumbnail}
              alt={course.title || "Course thumbnail"}
              fill
              sizes="(max-width: 900px) 100vw, 66vw"
              style={{ objectFit: "cover" }}
              priority={true}
              fetchPriority="high"
            />
          )}

          {/* Gradient Overlay */}
          {hasVideo && (
            <Box
              className="play-overlay"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(45deg, rgba(25,118,210,0.3) 0%, rgba(156,39,176,0.3) 100%)",
                transition: "all 0.3s ease",
                opacity: 0.7,
              }}
            />
          )}

          {/* Play Button */}
          {hasVideo && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                position: "relative",
                zIndex: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PlayCircleFilledWhite
                  sx={{
                    fontSize: { xs: 80, md: 100 },
                    color: "white",
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                    opacity: 0.9,
                  }}
                >
                  Watch Preview
                </Typography>
              </Box>
            </motion.div>
          )}
        </CardMedia>
      )}
    </Card>
  )
}
