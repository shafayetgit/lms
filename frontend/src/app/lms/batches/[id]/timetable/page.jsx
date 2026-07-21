"use client"
import React from "react"
import Grid from "@mui/material/Grid"
import { Box, Typography, Card, CardContent, Stack } from "@mui/material"
import { toast } from "react-toastify"
import { useParams } from "next/navigation"
import {
  Dashboard,
  InfoOutlined,
  CalendarMonth,
  Group,
  AccessTime,
  Event,
  Link as LinkIcon,
} from "@mui/icons-material"

import CButton from "@/components/ui/CButton"
import CPageLoader from "@/components/ui/CPageLoader"
import CModuleLayout from "@/components/ui/CModuleLayout"
import PermissionGuard from "@/components/ui/PermissionGuard"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"
import { BATCH_TIPS } from "@/choices/helpTips/batch"
import { useReadBatchQuery, useDeleteBatchTimetableMutation } from "@/features/batch/batchAPI"

import CreateDialog from "./_parts/CreateDialog"
import UpdateDialog from "./_parts/UpdateDialog"

export default function BatchTimetablePage() {
  const { id } = useParams()

  const { data: { data: batch } = {}, isLoading } = useReadBatchQuery(
    { id },
    { refetchOnMountOrArgChange: true, skip: !id }
  )
  useSetBreadcrumb(batch?.title, `/lms/batches/${id}`)

  const [deleteTimetable] = useDeleteBatchTimetableMutation()

  const handleDelete = async timetablePublicId => {
    try {
      await deleteTimetable({
        batchId: batch?.public_id || id,
        timetableId: timetablePublicId,
      }).unwrap()
      toast.success("Timetable entry deleted successfully")
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete timetable entry")
    }
  }

  if (isLoading) return <CPageLoader fullPage={false} />

  const navigators = [
    {
      label: "Dashboard",
      href: `/lms/batches/${id}/dashboard`,
      icon: <Dashboard />,
      resource: "batch",
      action: "read",
    },
    {
      label: "Details",
      href: `/lms/batches/${id}`,
      icon: <InfoOutlined />,
      resource: "batch",
      action: "read",
    },
    {
      label: "Timetable",
      href: `/lms/batches/${id}/timetable`,
      icon: <CalendarMonth />,
      resource: "batch",
      action: "read",
    },
    {
      label: "Enrollments",
      href: `/lms/batches/${id}/enrollments`,
      icon: <Group />,
      resource: "batch",
      action: "read",
    },
  ]

  return (
    <PermissionGuard resource="batch" action="read">
      <CModuleLayout navigators={navigators} helpTips={BATCH_TIPS.timetable}>
        <Box sx={{ width: "100%" }}>
          {/* Action Button Bar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              mb: 3,
            }}
          >
            <CreateDialog batchPublicId={batch?.public_id || id} />
          </Box>

          {/* Timetable Session Cards List */}
          <Grid container spacing={3} columns={{ xs: 4, sm: 8, md: 12 }}>
            {batch?.timetables && batch.timetables.length > 0 ? (
              batch.timetables.map(item => (
                <Grid key={item.public_id || item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        boxShadow: 3,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5, pb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" sx={{ pr: 1 }}>
                          {item.topic}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <PermissionGuard resource="batch" action="update" silent>
                            <UpdateDialog item={item} batchPublicId={batch?.public_id || id} />
                          </PermissionGuard>
                          <PermissionGuard resource="batch" action="delete" silent>
                            <CButton
                              action="delete"
                              yesNo
                              yesNoText="Are you sure you want to delete this session entry?"
                              onClick={() => handleDelete(item.public_id || item.id)}
                            />
                          </PermissionGuard>
                        </Stack>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "text.secondary",
                          mb: 0.5,
                        }}
                      >
                        <Event fontSize="small" color="action" />
                        <Typography variant="body2">{item.date}</Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "text.secondary",
                          mb: 1.5,
                        }}
                      >
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2">
                          {item.start_time} - {item.end_time}
                        </Typography>
                      </Box>

                      {item.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1, mb: 1.5, lineHeight: 1.5 }}
                        >
                          {item.description}
                        </Typography>
                      )}

                      {item.meeting_link && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                          <LinkIcon fontSize="small" color="primary" />
                          <Typography
                            component="a"
                            href={item.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="caption"
                            color="primary.main"
                            sx={{
                              fontWeight: 600,
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            Join Meeting
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined" sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    No timetable sessions scheduled for this batch cohort yet.
                  </Typography>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </CModuleLayout>
    </PermissionGuard>
  )
}
