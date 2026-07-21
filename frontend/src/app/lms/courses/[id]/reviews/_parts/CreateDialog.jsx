"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import { Grid, Box, Typography, Rating } from "@mui/material"
import * as Yup from "yup"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CAutocomplete from "@/components/form/CAutocomplete"
import CTextField from "@/components/form/CTextField"

import { toast } from "react-toastify"
import { useCreateReviewMutation } from "@/features/review/reviewAPI"
import { useReadEnrolledStudentsQuery } from "@/features/enrollment/enrollmentAPI"
import { mapApiErrorsToFormik } from "@/utils/shared"

const reviewFormSchema = Yup.object({
  student_public_id: Yup.string().required("Student is required"),
  rating: Yup.number()
    .min(1, "Minimum rating is 1")
    .max(5, "Maximum rating is 5")
    .required("Rating is required"),
  body: Yup.string().nullable(),
})

export default function CreateDialog({ courseId }) {
  const [open, setOpen] = useState(false)

  const handleClose = () => setOpen(false)
  const handleOpen = () => setOpen(true)

  const [create, { isLoading: isCreating }] = useCreateReviewMutation()

  // Only fetch enrolled students when the dialog is open
  const { data: enrolledData, isLoading: isLoadingStudents } = useReadEnrolledStudentsQuery(
    { coursePublicId: courseId },
    { skip: !open || !courseId }
  )

  const studentOptions = enrolledData?.data || []

  const formik = useFormik({
    initialValues: {
      student_public_id: "",
      temp_student: null,
      rating: 5,
      body: "",
    },
    validationSchema: reviewFormSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const payload = {
          course_public_id: courseId,
          student_public_id: values.student_public_id,
          rating: Number(values.rating),
          body: values.body || null,
          is_active: true,
        }

        const response = await create(payload).unwrap()
        toast.success(response?.message || "Review added successfully")
        resetForm()
        handleClose()
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Failed to add review. Please try again.")
      }
    },
  })

  return (
    <CDialog
      resource="review"
      action="create"
      title="Add Review"
      btnProps={{ label: "Add Review", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm onSubmit={formik.handleSubmit} width="30rem" btnProps={{ loading: isCreating }} dialog>
        <Grid container spacing={2}>
          {/* Student autocomplete — enrolled students only */}
          <Grid size={{ xs: 12 }}>
            <CAutocomplete
              label="Student"
              name="student_public_id"
              value={formik.values.temp_student}
              options={studentOptions}
              isOptionEqualToValue={(option, value) => option.value === value?.value}
              getOptionLabel={option => option?.label || ""}
              onChange={(e, value) => {
                formik.setFieldValue("student_public_id", value ? value.value : "")
                formik.setFieldValue("temp_student", value)
              }}
              onBlur={formik.handleBlur}
              loading={isLoadingStudents}
              noOptionsText="No enrolled students found"
              placeholder="Search enrolled students…"
              required
              error={formik.touched.student_public_id && Boolean(formik.errors.student_public_id)}
              helperText={formik.touched.student_public_id && formik.errors.student_public_id}
            />
          </Grid>

          {/* Star rating */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Rating <span style={{ color: "red" }}>*</span>
              </Typography>
              <Rating
                name="rating"
                value={formik.values.rating}
                onChange={(_, newValue) => formik.setFieldValue("rating", newValue)}
              />
              {formik.touched.rating && formik.errors.rating && (
                <Typography variant="caption" color="error.main">
                  {formik.errors.rating}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Comment */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Comment"
              name="body"
              value={formik.values.body}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.body && Boolean(formik.errors.body)}
              helperText={formik.touched.body && formik.errors.body}
              multiline
              rows={4}
            />
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
  )
}
