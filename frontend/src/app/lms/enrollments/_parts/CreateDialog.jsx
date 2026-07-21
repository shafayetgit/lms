"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import Grid from "@mui/material/Grid"
import { toast } from "react-toastify"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CCheckbox from "@/components/form/CCheckbox"
import CSelect from "@/components/form/CSelect"
import CDatePicker from "@/components/form/CDatePicker"
import CAutocomplete from "@/components/form/CAutocomplete"
import dayjs from "dayjs"

import {
  useCreateEnrollmentMutation,
  useReadEnrollmentMetaQuery,
} from "@/features/enrollment/enrollmentAPI"
import { enrollmentCreateSchema } from "@/schema/enrollment"
import { mapApiErrorsToFormik } from "@/utils/shared"

const STATUS_CHOICES = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Expired", value: "expired" },
  { label: "Suspended", value: "suspended" },
]

export default function CreateDialog({ defaultCourseId }) {
  const [open, setOpen] = useState(false)

  const handleClose = () => setOpen(false)
  const handleOpen = () => setOpen(true)

  const { data: { data: meta } = {} } = useReadEnrollmentMetaQuery(undefined, { skip: !open })
  const [create, { isLoading }] = useCreateEnrollmentMutation()

  const formik = useFormik({
    initialValues: {
      user_id: "",
      course_id: "",
      batch_id: "",
      purchased_certificate: false,
      status: "active",
      is_active: true,
      expires_at: "",
      temp_user: null,
      temp_course: null,
      temp_batch: null,
    },
    validationSchema: enrollmentCreateSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const { temp_user, temp_course, temp_batch, ...createPayload } = values
        if (!createPayload.expires_at) delete createPayload.expires_at
        if (!createPayload.batch_id) delete createPayload.batch_id

        const response = await create(createPayload).unwrap()
        toast.success(response?.message || "Enrollment created successfully")
        resetForm()
        handleClose()
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Create failed. Please try again.")
      }
    },
  })

  const { setFieldValue } = formik

  React.useEffect(() => {
    if (open && defaultCourseId && meta?.courses) {
      const selected = meta.courses.find(
        c => c.public_id === defaultCourseId || String(c.value) === String(defaultCourseId)
      )
      if (selected) {
        setFieldValue("course_id", selected.value)
        setFieldValue("temp_course", selected)
      }
    }
  }, [open, defaultCourseId, meta?.courses, setFieldValue])

  return (
    <CDialog
      resource="enrollment"
      action="create"
      title="Create Enrollment"
      btnProps={{ label: "Create", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm onSubmit={formik.handleSubmit} width="32rem" btnProps={{ loading: isLoading }} dialog>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CAutocomplete
              label="Student"
              name="user_id"
              value={formik.values.temp_user}
              options={meta?.users || []}
              isOptionEqualToValue={(option, value) => option.value === value?.value}
              getOptionLabel={option => option?.label || ""}
              onChange={(e, value) => {
                formik.setFieldValue("user_id", value ? value.value : "")
                formik.setFieldValue("temp_user", value)
              }}
              onBlur={formik.handleBlur}
              required
              error={formik.touched.user_id && Boolean(formik.errors.user_id)}
              helperText={formik.touched.user_id && formik.errors.user_id}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CAutocomplete
              label="Course"
              name="course_id"
              value={formik.values.temp_course}
              options={meta?.courses || []}
              isOptionEqualToValue={(option, value) => option.value === value?.value}
              getOptionLabel={option => option?.label || ""}
              onChange={(e, value) => {
                formik.setFieldValue("course_id", value ? value.value : "")
                formik.setFieldValue("temp_course", value)
              }}
              onBlur={formik.handleBlur}
              required
              disabled={Boolean(defaultCourseId)}
              error={formik.touched.course_id && Boolean(formik.errors.course_id)}
              helperText={formik.touched.course_id && formik.errors.course_id}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CAutocomplete
              label="Batch (Optional)"
              name="batch_id"
              value={formik.values.temp_batch}
              options={meta?.batches || []}
              isOptionEqualToValue={(option, value) => option.value === value?.value}
              getOptionLabel={option => option?.label || ""}
              onChange={(e, value) => {
                formik.setFieldValue("batch_id", value ? value.value : "")
                formik.setFieldValue("temp_batch", value)
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.batch_id && Boolean(formik.errors.batch_id)}
              helperText={formik.touched.batch_id && formik.errors.batch_id}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CSelect
              label="Status"
              name="status"
              value={formik.values.status}
              options={STATUS_CHOICES}
              onChange={e => formik.setFieldValue("status", e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={formik.touched.status && formik.errors.status}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CDatePicker
              label="Expires At"
              name="expires_at"
              value={formik.values.expires_at ? dayjs(formik.values.expires_at) : null}
              onChange={newValue => {
                formik.setFieldValue("expires_at", newValue ? newValue.toISOString() : "")
              }}
              error={formik.touched.expires_at && Boolean(formik.errors.expires_at)}
              helperText={formik.touched.expires_at && formik.errors.expires_at}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CCheckbox
              label="Purchased Certificate"
              checked={formik.values.purchased_certificate}
              onChange={e => formik.setFieldValue("purchased_certificate", e.target.checked)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CCheckbox
              label="Is Active"
              checked={formik.values.is_active}
              onChange={e => formik.setFieldValue("is_active", e.target.checked)}
            />
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
  )
}
