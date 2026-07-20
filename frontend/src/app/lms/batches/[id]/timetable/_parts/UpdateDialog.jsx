"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import Grid from "@mui/material/Grid"
import dayjs from "dayjs"
import { toast } from "react-toastify"
import { useParams } from "next/navigation"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CDatePicker from "@/components/form/CDatePicker"
import CTimePicker from "@/components/form/CTimePicker"

import { useUpdateBatchTimetableMutation } from "@/features/batch/batchAPI"
import { timetableValidationSchema } from "@/schema/batch"
import { mapApiErrorsToFormik } from "@/utils/shared"

export default function UpdateDialog({ item, batchPublicId }) {
  const { id } = useParams()
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const [updateTimetable, { isLoading: isSubmitting }] = useUpdateBatchTimetableMutation()

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      date: item?.date || "",
      start_time: item?.start_time || "",
      end_time: item?.end_time || "",
      topic: item?.topic || "",
      description: item?.description || "",
      meeting_link: item?.meeting_link || "",
    },
    validationSchema: timetableValidationSchema,
    onSubmit: async (values, { setErrors }) => {
      try {
        const payload = {
          ...values,
          meeting_link: values.meeting_link ? values.meeting_link.trim() : null,
          description: values.description ? values.description.trim() : null,
        }
        const timetablePublicId = item?.public_id || item?.id
        await updateTimetable({
          batchId: batchPublicId || id,
          timetableId: timetablePublicId,
          body: payload,
        }).unwrap()
        toast.success("Timetable entry updated successfully")
        handleClose()
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Failed to update timetable entry")
      }
    },
  })

  const hasError = (field) => Boolean(formik.errors[field]) && (formik.touched[field] || formik.submitCount > 0)
  const getHelperText = (field) => (formik.touched[field] || formik.submitCount > 0) ? formik.errors[field] : ""

  return (
    <CDialog
      title="Edit Session Entry"
      btnProps={{ action: "edit" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
      maxWidth="sm"
    >
      <CForm
        onSubmit={formik.handleSubmit}
        width="100%"
        dialog
        btnProps={{ label: "Update", action: "save", loading: isSubmitting }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Topic / Milestone"
              name="topic"
              value={formik.values.topic}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={hasError("topic")}
              helperText={getHelperText("topic")}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CDatePicker
              label="Date"
              name="date"
              value={formik.values.date ? dayjs(formik.values.date) : null}
              onChange={(val) => {
                const formatted = val && dayjs(val).isValid() ? dayjs(val).format("YYYY-MM-DD") : ""
                formik.setFieldValue("date", formatted)
              }}
              onBlur={() => formik.setFieldTouched("date", true)}
              error={hasError("date")}
              helperText={getHelperText("date")}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CTimePicker
              label="Start Time"
              name="start_time"
              value={formik.values.start_time ? dayjs(`2000-01-01T${formik.values.start_time}`) : null}
              onChange={(val) => {
                const formatted = val && dayjs(val).isValid() ? dayjs(val).format("HH:mm:ss") : ""
                formik.setFieldValue("start_time", formatted)
              }}
              onBlur={() => formik.setFieldTouched("start_time", true)}
              error={hasError("start_time")}
              helperText={getHelperText("start_time")}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CTimePicker
              label="End Time"
              name="end_time"
              value={formik.values.end_time ? dayjs(`2000-01-01T${formik.values.end_time}`) : null}
              onChange={(val) => {
                const formatted = val && dayjs(val).isValid() ? dayjs(val).format("HH:mm:ss") : ""
                formik.setFieldValue("end_time", formatted)
              }}
              onBlur={() => formik.setFieldTouched("end_time", true)}
              error={hasError("end_time")}
              helperText={getHelperText("end_time")}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Meeting / Conferencing Link"
              name="meeting_link"
              value={formik.values.meeting_link}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={hasError("meeting_link")}
              helperText={getHelperText("meeting_link")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Session Description"
              name="description"
              multiline
              rows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={hasError("description")}
              helperText={getHelperText("description")}
            />
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
  )
}
