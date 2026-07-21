"use client"
import React from "react"
import { useFormik } from "formik"
import { Grid, Typography, Box } from "@mui/material"
import { toast } from "react-toastify"
import { useParams } from "next/navigation"
import dayjs from "dayjs"

import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CSelect from "@/components/form/CSelect"
import CPageLoader from "@/components/ui/CPageLoader"

import {
  useReadLiveClassQuery,
  useUpdateLiveClassMutation,
} from "@/features/liveClass/liveClassApi"
import { liveClassValidationSchema } from "@/schema/liveClass"
import { mapApiErrorsToFormik } from "@/utils/shared"

export default function LiveClassDetailPage() {
  const { id } = useParams()

  const { data: classData, isLoading } = useReadLiveClassQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: !id,
  })

  const [update, { isLoading: isUpdating }] = useUpdateLiveClassMutation()

  const formik = useFormik({
    initialValues: {
      title: classData?.title ?? "",
      description: classData?.description ?? "",
      batch_id: classData?.batch_id ?? null,
      course_id: classData?.course_id ?? null,
      host_id: classData?.host_id ?? 1,
      date: classData?.date ? dayjs(classData.date).format("YYYY-MM-DD") : "",
      time: classData?.time ?? "",
      duration: classData?.duration ?? 60,
      timezone: classData?.timezone ?? "UTC",
      meeting_link: classData?.meeting_link ?? "",
      password: classData?.password ?? "",
      auto_recording: classData?.auto_recording ?? false,
      recording_link: classData?.recording_link ?? "",
      status: classData?.status ?? "Scheduled",
    },
    validationSchema: liveClassValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        await update({ id, body: values }).unwrap()
        toast.success("Live class updated successfully")
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Update failed")
      }
    },
  })

  if (isLoading) return <CPageLoader fullPage={false} />

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ bgcolor: "background.paper" }}>
        <Typography variant="h6" mb={2}>
          Manage Live Class
        </Typography>

        <CForm onSubmit={formik.handleSubmit} width="100%" btnProps={{ loading: isUpdating }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <CTextField
                    label="Class Title"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CTextField
                    label="Description"
                    name="description"
                    multiline
                    rows={3}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CTextField
                    label="Meeting Link"
                    name="meeting_link"
                    value={formik.values.meeting_link}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.meeting_link && Boolean(formik.errors.meeting_link)}
                    helperText={formik.touched.meeting_link && formik.errors.meeting_link}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CTextField
                    label="Recording Link (Paste after class)"
                    name="recording_link"
                    value={formik.values.recording_link || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.recording_link && Boolean(formik.errors.recording_link)}
                    helperText={formik.touched.recording_link && formik.errors.recording_link}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <CSelect
                    label="Status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    options={[
                      { label: "Scheduled", value: "Scheduled" },
                      { label: "Live", value: "Live" },
                      { label: "Completed", value: "Completed" },
                      { label: "Cancelled", value: "Cancelled" },
                    ]}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CTextField
                    label="Date"
                    name="date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formik.values.date}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CTextField
                    label="Time"
                    name="time"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    value={formik.values.time}
                    onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CForm>
      </Box>
    </Box>
  )
}
