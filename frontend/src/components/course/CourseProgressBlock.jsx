"use client"

import React from "react"
import { Box, Stack, Typography, LinearProgress, Button } from "@mui/material"
import { PlayCircleOutline } from "@mui/icons-material"
import CButton from "@/components/ui/CButton"
import Link from "next/link"

export default function CourseProgressBlock({
  courseProgressPercent = 0,
  flatLessonsList = [],
  completedLessons = {},
  totalLessons = 0,
  handleStartLearning,
  enableCertification = false,
  courseRequest = null,
  courseCertificate = null,
  handleRequestCertificate,
  isRequesting = false,
}) {
  const completedCount = flatLessonsList.length > 0
    ? flatLessonsList.filter((l) => completedLessons[l.id]).length
    : Object.keys(completedLessons).length
  const totalLessonsCount = flatLessonsList.length || totalLessons || 0

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="body2" fontWeight="700">
            Your Course Progress
          </Typography>
          <Typography variant="body2" fontWeight="700" color="primary.main">
            {courseProgressPercent}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={courseProgressPercent}
          aria-label="Course Progress"
          sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover" }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          {completedCount} of {totalLessonsCount} lessons completed
        </Typography>
      </Box>
      <Stack spacing={1}>
        <CButton
          label={courseProgressPercent > 0 ? "Continue Learning" : "Start Learning"}
          variant={courseProgressPercent === 100 && enableCertification ? "outlined" : "contained"}
          color="primary"
          fullWidth
          size="large"
          onClick={handleStartLearning}
          startIcon={<PlayCircleOutline />}
          sx={{
            py: 1.5,
            fontWeight: 700,
            fontSize: "1rem",
            borderRadius: 1,
            textTransform: "none",
          }}
        />

        {enableCertification && courseProgressPercent === 100 && (
          <>
            {courseCertificate ? (
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                component={Link}
                href={`/academy/certificates/${courseCertificate.public_id}`}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1rem",
                  borderRadius: 1,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { boxShadow: "none" }
                }}
              >
                View Certificate
              </Button>
            ) : courseRequest?.status === "Pending" ? (
              <Button
                variant="contained"
                color="warning"
                fullWidth
                disabled
                size="large"
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1rem",
                  borderRadius: 1,
                  textTransform: "none",
                }}
              >
                Request Pending
              </Button>
            ) : courseRequest?.status === "Approved" ? (
              <Button
                variant="contained"
                color="info"
                fullWidth
                disabled
                size="large"
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1rem",
                  borderRadius: 1,
                  textTransform: "none",
                }}
              >
                Evaluation Scheduled
              </Button>
            ) : (
              <CButton
                label="Request Certificate"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                loading={isRequesting}
                onClick={handleRequestCertificate}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1rem",
                  borderRadius: 1,
                  textTransform: "none",
                }}
              />
            )}
          </>
        )}
      </Stack>
    </Box>
  )
}
