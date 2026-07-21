"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import { Grid } from "@mui/material"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CNumberField from "@/components/form/CNumberField"
import CCheckbox from "@/components/form/CCheckbox"

import { toast } from "react-toastify"

import { useCreateQuizMutation } from "@/features/quiz/quizAPI"
import { quizValidationSchema } from "@/schema/quiz"
import { mapApiErrorsToFormik } from "@/utils/shared"

export default function CreateDialog() {
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }
  const handleOpen = () => setOpen(true)

  const [create, { isLoading: isCreatingQuiz }] = useCreateQuizMutation()

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      duration: "",
      passing_percentage: 50,
      max_attempts: 1,
      shuffle_questions: false,
      enable_negative_marking: false,
      marks_to_cut: 0,
      show_answers: false,
      show_submission_history: false,
      is_active: true,
    },
    validationSchema: quizValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const payload = {
          ...values,
          duration: values.duration ? Number(values.duration) : null,
          passing_percentage: Number(values.passing_percentage),
          max_attempts: Number(values.max_attempts),
          marks_to_cut: Number(values.marks_to_cut),
        }

        const response = await create(payload).unwrap()

        toast.success(response?.message || "Quiz created successfully")
        resetForm()
        handleClose()
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        console.error("Create error:", error)
        toast.error(error?.data?.message || "Create failed. Please try again.")
      }
    },
  })

  return (
    <CDialog
      resource="quiz"
      action="create"
      title="New Quiz"
      btnProps={{ label: "New Quiz", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm
        onSubmit={formik.handleSubmit}
        width="30rem"
        btnProps={{ action: "", label: "Create", loading: isCreatingQuiz }}
        dialog
      >
        <Grid container spacing={2}>
          {/* Title */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              required
            />
          </Grid>

          {/* Description */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              multiline
              rows={4}
            />
          </Grid>

          {/* Duration */}
          <Grid size={{ xs: 6 }}>
            <CNumberField
              label="Duration (Minutes)"
              name="duration"
              value={formik.values.duration}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.duration && Boolean(formik.errors.duration)}
              helperText={formik.touched.duration && formik.errors.duration}
            />
          </Grid>

          {/* Passing Percentage */}
          <Grid size={{ xs: 6 }}>
            <CNumberField
              label="Passing Score (%)"
              name="passing_percentage"
              value={formik.values.passing_percentage}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.passing_percentage && Boolean(formik.errors.passing_percentage)}
              helperText={formik.touched.passing_percentage && formik.errors.passing_percentage}
              required
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <CNumberField
              label="Max Attempts"
              name="max_attempts"
              value={formik.values.max_attempts}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.max_attempts && Boolean(formik.errors.max_attempts)}
              helperText={formik.touched.max_attempts && formik.errors.max_attempts}
              required
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <CNumberField
              label="Marks to Cut (Negative)"
              name="marks_to_cut"
              value={formik.values.marks_to_cut}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.marks_to_cut && Boolean(formik.errors.marks_to_cut)}
              helperText={formik.touched.marks_to_cut && formik.errors.marks_to_cut}
            />
          </Grid>

          {/* Checkboxes */}
          <Grid size={{ xs: 6 }}>
            <CCheckbox
              label="Shuffle Questions"
              checked={formik.values.shuffle_questions}
              onChange={e => formik.setFieldValue("shuffle_questions", e.target.checked)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CCheckbox
              label="Enable Negative Marking"
              checked={formik.values.enable_negative_marking}
              onChange={e => formik.setFieldValue("enable_negative_marking", e.target.checked)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CCheckbox
              label="Show Answers"
              checked={formik.values.show_answers}
              onChange={e => formik.setFieldValue("show_answers", e.target.checked)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CCheckbox
              label="Show Submission History"
              checked={formik.values.show_submission_history}
              onChange={e => formik.setFieldValue("show_submission_history", e.target.checked)}
            />
          </Grid>

          {/* Active */}
          <Grid size={{ xs: 12 }}>
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
