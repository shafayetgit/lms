"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import { Grid } from "@mui/material"
import { useParams } from "next/navigation"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CCheckbox from "@/components/form/CCheckbox"

import { toast } from "react-toastify"
import { useCreateChapterMutation } from "@/features/chapter/chapterAPI"
import { chapterValidationSchema } from "@/schema/chapter"
import { mapApiErrorsToFormik } from "@/utils/shared"

import PermissionGuard from "@/components/ui/PermissionGuard"

export default function CreateDialog() {
  const [open, setOpen] = useState(false)
  // courseId from URL is a public_id (UUID) — backend accepts it directly
  const { id: courseId } = useParams()

  const handleClose = () => setOpen(false)
  const handleOpen = () => setOpen(true)

  const [create, { isLoading: isCreating }] = useCreateChapterMutation()

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      is_active: true,
      course_id: courseId,
    },
    validationSchema: chapterValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const response = await create(values).unwrap()
        toast.success(response?.message || "Chapter created successfully")
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
    <PermissionGuard resource="chapter" action="create">
      <CDialog
        title="Create Chapter"
        btnProps={{ label: "Create", action: "add" }}
        open={open}
        handleCDialogOpen={handleOpen}
        handleCDialogClose={handleClose}
      >
        <CForm onSubmit={formik.handleSubmit} width="45rem" btnProps={{ loading: isCreating }} dialog>
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

          {/* Is Active */}
          <Grid size={{ xs: 12 }}>
            <CCheckbox
              label="Is Active"
              checked={formik.values.is_active}
              onChange={e => formik.setFieldValue("is_active", e.target.checked)}
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
        </Grid>
      </CForm>
    </CDialog>
    </PermissionGuard>
  )
}
