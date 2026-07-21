"use client"

import React from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Box, Typography, Rating, Grid } from "@mui/material"
import { toast } from "react-toastify"
import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import { useCreateReviewMutation, useUpdateReviewMutation } from "@/features/review/reviewAPI"

export default function WriteReviewDialog({ open, onClose, course, user, myReview }) {
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation()
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation()

  const formik = useFormik({
    initialValues: {
      rating: myReview ? myReview.rating : 5,
      body: myReview ? myReview.body || "" : "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      rating: Yup.number().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5").required(),
      body: Yup.string().nullable(),
    }),
    onSubmit: async values => {
      try {
        if (myReview) {
          await updateReview({
            id: myReview.public_id,
            body: {
              rating: Number(values.rating),
              body: values.body || null,
            },
          }).unwrap()
          toast.success("Review updated successfully")
        } else {
          await createReview({
            course_public_id: course.public_id,
            student_public_id: user.public_id,
            rating: Number(values.rating),
            body: values.body || null,
            is_active: true,
          }).unwrap()
          toast.success("Review submitted successfully")
        }
        onClose()
      } catch (err) {
        toast.error(err?.data?.detail || err?.data?.message || "Failed to save review")
      }
    },
  })

  return (
    <CDialog title={"Write a Review"} open={open} handleCDialogClose={onClose} maxWidth="sm">
      <CForm
        onSubmit={formik.handleSubmit}
        btnProps={{ loading: isCreating || isUpdating }}
        width="100%"
        dialog
      >
        <Grid container spacing={2}>
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
