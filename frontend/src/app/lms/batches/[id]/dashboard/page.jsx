"use client"
import React from "react"
import Grid from "@mui/material/Grid"
import { Box, Typography, Card, CardContent } from "@mui/material"
import { useParams } from "next/navigation"
import { Dashboard, InfoOutlined, CalendarMonth, Group } from "@mui/icons-material"

import CPageLoader from "@/components/ui/CPageLoader"
import CModuleLayout from "@/components/ui/CModuleLayout"
import PermissionGuard from "@/components/ui/PermissionGuard"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"
import { BATCH_TIPS } from "@/choices/helpTips/batch"

import { useReadBatchQuery } from "@/features/batch/batchAPI"

export default function BatchDashboardPage() {
  const { id } = useParams()

  const { data: { data: batch } = {}, isLoading } = useReadBatchQuery(
    { id },
    { refetchOnMountOrArgChange: true, skip: !id }
  )
  useSetBreadcrumb(batch?.title, `/lms/batches/${id}`)

  if (isLoading) return <CPageLoader fullPage={false} />

  const navigators = [
    { label: "Dashboard", href: `/lms/batches/${id}/dashboard`, icon: <Dashboard />, resource: "batch", action: "read" },
    { label: "Details", href: `/lms/batches/${id}`, icon: <InfoOutlined />, resource: "batch", action: "read" },
    { label: "Timetable", href: `/lms/batches/${id}/timetable`, icon: <CalendarMonth />, resource: "batch", action: "read" },
    { label: "Enrollments", href: `/lms/batches/${id}/enrollments`, icon: <Group />, resource: "batch", action: "read" },
  ]

  const seatLimitText = batch?.seat_count && batch.seat_count > 0 ? batch.seat_count : "Unlimited"
  const selfEnrollmentText = batch?.allow_self_enrollment ? "Enabled" : "Disabled"

  return (
    <PermissionGuard resource="batch" action="read">
      <CModuleLayout navigators={navigators} helpTips={BATCH_TIPS.dashboard}>
        <Box sx={{ width: "100%" }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Cohort Dashboard
          </Typography>
          <Grid container spacing={3} columns={{ xs: 4, sm: 8, md: 12 }}>
            <Grid size={{ xs: 2, sm: 4, md: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    Enrolled Students
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    {batch?.enrollment_count ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 2, sm: 4, md: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    Maximum Capacity
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {seatLimitText}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 2, sm: 4, md: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    Self Enrollment Status
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    color={batch?.allow_self_enrollment ? "success.main" : "text.secondary"}
                  >
                    {selfEnrollmentText}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </CModuleLayout>
    </PermissionGuard>
  )
}
