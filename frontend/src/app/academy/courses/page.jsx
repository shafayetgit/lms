"use client"

import React from "react"
import { Box, Grid, Typography } from "@mui/material"
import { SchoolOutlined } from "@mui/icons-material"
import { useReadMyEnrollmentsQuery } from "@/features/enrollment/enrollmentAPI"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"

import PortalCourseCard from "@/components/course/PortalCourseCard"

export default function AcademyCoursesPage() {
  useSetBreadcrumb("Courses")
  const {
    data: { data: enrollments = [] } = {},
    isLoading,
    isError,
  } = useReadMyEnrollmentsQuery({ size: 50 }, { refetchOnMountOrArgChange: true })

  if (isLoading) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  return (
    <CModuleLayout>
      {/* Grid */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {enrollments.map(enrollment => (
          <Grid key={enrollment.public_id} size={{ xs: 12, sm: 6, md: 4 }}>
            <PortalCourseCard
              course={enrollment.course || {}}
              enrolled={true}
              progress={Math.round(enrollment.progress || 0)}
              certificateId={enrollment.certificate_id}
            />
          </Grid>
        ))}
      </Grid>

      {/* Empty state */}
      {!isLoading && enrollments.length === 0 && (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <SchoolOutlined sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            You are not enrolled in any courses yet
          </Typography>
          <Typography variant="body2" color="text.disabled" mt={1}>
            Browse the course catalog and enroll to get started.
          </Typography>
        </Box>
      )}
    </CModuleLayout>
  )
}
