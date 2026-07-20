"use client"

import React from "react"
import { useTheme, Box, Stack, Typography, AvatarGroup, Avatar, LinearProgress, Chip, alpha, Tooltip } from "@mui/material"
import {
  MenuBookOutlined,
  PeopleOutline,
  Star,
  WorkspacePremium,
  SchoolOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  HourglassEmptyOutlined,
  EventOutlined,
} from "@mui/icons-material"
import Link from "next/link"
import Image from "next/image"
import { getGradient } from "@/utils/shared"

function StatusChip({ progress, certificateId }) {
  const isCompleted = progress >= 100
  const isStarted = progress > 0

  if (isCompleted) {
    if (certificateId) {
      return (
        <Chip
          icon={<WorkspacePremium sx={{ fontSize: "0.85rem !important", color: "inherit" }} />}
          label="Certified"
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "0.7rem",
            borderRadius: 1,
            bgcolor: (theme) => theme.palette.warning.main,
            color: (theme) => theme.palette.warning.contrastText,
            "& .MuiChip-icon": { color: "inherit" },
            "& .MuiChip-label": { color: "inherit" },
            boxShadow: (theme) => `0 2px 4px ${alpha(theme.palette.common.black, 0.15)}`,
          }}
        />
      )
    }
    return (
      <Chip
        icon={<CheckCircleOutlined sx={{ fontSize: "0.8rem !important", color: "inherit" }} />}
        label="Completed"
        size="small"
        sx={{
          fontWeight: 700,
          fontSize: "0.7rem",
          borderRadius: 1,
          bgcolor: (theme) => theme.palette.success.main,
          color: (theme) => theme.palette.success.contrastText,
          "& .MuiChip-icon": { color: "inherit" },
          "& .MuiChip-label": { color: "inherit" },
          boxShadow: (theme) => `0 2px 4px ${alpha(theme.palette.common.black, 0.15)}`,
        }}
      />
    )
  }
  if (isStarted) {
    return (
      <Chip
        icon={<PlayCircleOutlined sx={{ fontSize: "0.8rem !important", color: "inherit" }} />}
        label="In Progress"
        size="small"
        sx={{
          fontWeight: 700,
          fontSize: "0.7rem",
          borderRadius: 1,
          bgcolor: (theme) => alpha(theme.palette.common.white, 0.15),
          color: (theme) => theme.palette.common.white,
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.common.white, 0.3),
          "& .MuiChip-icon": { color: "inherit" },
          "& .MuiChip-label": { color: "inherit" },
        }}
      />
    )
  }
  return (
    <Chip
      icon={<HourglassEmptyOutlined sx={{ fontSize: "0.8rem !important", color: "inherit" }} />}
      label="Not Started"
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: "0.7rem",
        borderRadius: 1,
        bgcolor: (theme) => alpha(theme.palette.common.white, 0.15),
        color: (theme) => theme.palette.common.white,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.common.white, 0.3),
        "& .MuiChip-icon": { color: "inherit" },
        "& .MuiChip-label": { color: "inherit" },
      }}
    />
  )
}

export default function PortalCourseCard({ course, enrolled = false, progress = 0, certificateId = null }) {
  const theme = useTheme()
  const gradient = getGradient(course.card_gradient)
  const instructors = course.instructors || []
  const isFree = !course.paid_course

  const currencySymbol = course.currency === "BDT" ? "৳" : course.currency || "$"
  const formattedPrice = isFree ? "Free" : `${currencySymbol} ${Number(course.course_price || 0).toLocaleString()}`

  const linkHref = enrolled ? `/academy/courses/${course.slug}` : `/courses/${course.slug}`

  return (
    <Link href={linkHref} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 1,
          overflow: "hidden",
          border: "1px solid",
          borderColor: (theme) => theme.palette.divider,
          bgcolor: (theme) => theme.palette.background.paper,
          minHeight: 380,
          position: "relative",
        }}
      >
        {/* Thumbnail / Gradient header */}
        <Box
          sx={{
            aspectRatio: "16/9",
            flexShrink: 0,
            position: "relative",
            background: !course.thumbnail ? gradient : "transparent",
            borderBottom: "1px solid",
            borderBottomColor: (theme) => theme.palette.divider,
            overflow: "hidden",
          }}
        >
          {course.thumbnail && (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              priority={false}
            />
          )}
          {!course.thumbnail && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 3,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  color: (theme) => theme.palette.common.white,
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  lineHeight: 1.35,
                  textShadow: (theme) => `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`,
                }}
              >
                {course.title}
              </Typography>
            </Box>
          )}

          {/* Status chip overlay for enrolled courses */}
          {enrolled && (
            <Box sx={{ position: "absolute", top: 10, right: 10 }}>
              <StatusChip progress={progress} certificateId={certificateId} />
            </Box>
          )}

          {/* Upcoming chip overlay */}
          {course.upcoming && !enrolled && (
            <Box sx={{ position: "absolute", top: 10, right: 10 }}>
              <Chip
                icon={<EventOutlined sx={{ fontSize: "0.8rem !important", color: "inherit" }} />}
                label="Upcoming"
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  borderRadius: 1,
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.9),
                  color: (theme) => theme.palette.info.contrastText,
                  "& .MuiChip-icon": { color: "inherit" },
                  "& .MuiChip-label": { color: "inherit" },
                  boxShadow: (theme) => `0 2px 4px ${alpha(theme.palette.common.black, 0.15)}`,
                }}
              />
            </Box>
          )}
        </Box>

        {/* Body */}
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", flexGrow: 1 }}>
          {/* Stats Row */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            {course.total_lessons > 0 && (
              <Tooltip title="Total Lessons">
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: (theme) => theme.palette.text.secondary }}>
                  <MenuBookOutlined sx={{ fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.875rem", lineHeight: 1 }}>
                    {course.total_lessons}
                  </Typography>
                </Stack>
              </Tooltip>
            )}

            {course.total_enrollments > 0 && (
              <Tooltip title="Total Students">
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: (theme) => theme.palette.text.secondary }}>
                  <PeopleOutline sx={{ fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.875rem", lineHeight: 1 }}>
                    {course.total_enrollments}
                  </Typography>
                </Stack>
              </Tooltip>
            )}

            <Tooltip title="Average Rating">
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: (theme) => theme.palette.text.secondary }}>
                <Star sx={{ fontSize: 18, color: (theme) => theme.palette.warning.main }} />
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.875rem", lineHeight: 1 }}>
                  {Number(course.avg_rating || course.rating || 0).toFixed(1)}
                </Typography>
              </Stack>
            </Tooltip>

            {(course.featured || course.enable_certification || course.paid_certificate) && (
              <Tooltip title="Certificate Included">
                <WorkspacePremium sx={{ fontSize: 18, color: (theme) => theme.palette.warning.main }} />
              </Tooltip>
            )}
          </Stack>

          {/* Title */}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: (theme) => theme.palette.text.primary,
              lineHeight: 1.4,
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              minHeight: "2.8em",
            }}
          >
            {course.title}
          </Typography>

          {/* Short introduction */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              minHeight: "2.8em",
              lineHeight: 1.4,
            }}
          >
            {course.short_introduction || "No introduction available."}
          </Typography>

          {/* Progress bar for enrolled courses */}
          {enrolled && (
            <Box sx={{ mt: "auto", mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 500, color: (theme) => theme.palette.text.secondary }}>
                  Progress
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: (theme) => progress >= 100 ? theme.palette.success.main : theme.palette.primary.main }}>
                  {progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: (theme) => theme.palette.action.hover,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    bgcolor: (theme) => progress >= 100 ? theme.palette.success.main : theme.palette.primary.main,
                  },
                }}
              />
            </Box>
          )}

          {/* Footer row: Instructors + Price / Cert */}
          <Box
            sx={{
              mt: enrolled ? 0 : "auto",
              pt: 1.5,
              borderTop: "1px solid",
              borderColor: (theme) => theme.palette.divider,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              {instructors.length > 0 && (
                <AvatarGroup
                  max={3}
                  sx={{
                    "& .MuiAvatar-root": {
                      width: 24,
                      height: 24,
                      fontSize: "0.75rem",
                      border: "2px solid",
                      borderColor: (theme) => theme.palette.background.paper,
                      bgcolor: (theme) => theme.palette.action.hover,
                      color: (theme) => theme.palette.text.secondary,
                      fontWeight: 600,
                    },
                  }}
                >
                  {instructors.map((inst) => {
                    const initials = `${inst.first_name?.[0] || ""}${inst.last_name?.[0] || ""}`.toUpperCase()
                    return (
                      <Avatar key={inst.public_id} src={inst.avatar}>
                        {initials}
                      </Avatar>
                    )
                  })}
                </AvatarGroup>
              )}
              {instructors.length > 0 && (
                <Typography variant="body2" sx={{ fontWeight: 500, color: (theme) => theme.palette.text.secondary, fontSize: "0.875rem" }}>
                  {instructors.length === 1
                    ? `${instructors[0].first_name || ""} ${instructors[0].last_name || ""}`.trim()
                    : instructors.length === 2
                    ? `${instructors[0].first_name} and ${instructors[1].first_name}`
                    : `${instructors.slice(0, -1).map((i) => i.first_name).join(", ")} and ${
                        instructors[instructors.length - 1].first_name
                      }`}
                </Typography>
              )}
            </Stack>

            {enrolled ? (
              (course.paid_certificate || course.enable_certification) && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  {certificateId ? (
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "warning.main",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <SchoolOutlined sx={{ fontSize: 16 }} /> Certified
                    </Typography>
                  ) : (
                    <SchoolOutlined sx={{ fontSize: 20, color: (theme) => theme.palette.text.disabled }} />
                  )}
                </Stack>
              )
            ) : (
              <Stack direction="row" alignItems="center" spacing={1}>
                {!isFree && (
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: (theme) => theme.palette.text.primary,
                      fontSize: "1rem",
                    }}
                  >
                    {formattedPrice}
                  </Typography>
                )}
                {(course.paid_certificate || course.enable_certification) && (
                  <SchoolOutlined sx={{ fontSize: 20, color: (theme) => theme.palette.text.secondary }} />
                )}
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
    </Link>
  )
}
