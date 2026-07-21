"use client"
import React from "react"
import { useFormik } from "formik"
import { Grid } from "@mui/material"
import { toast } from "react-toastify"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CCheckbox from "@/components/form/CCheckbox"

import { useUpdateChapterMutation } from "@/features/chapter/chapterAPI"
import { chapterValidationSchema } from "@/schema/chapter"
import { mapApiErrorsToFormik } from "@/utils/shared"

// Controlled dialog — parent owns open/onClose state
export default function EditChapterDialog({ chapter, open, onClose }) {
  const [update, { isLoading: isUpdating }] = useUpdateChapterMutation()

  const formik = useFormik({
    initialValues: {
      title: chapter?.title ?? "",
      description: chapter?.description ?? "",
      is_active: chapter?.is_active ?? true,
      course_id: chapter?.course?.public_id ?? chapter?.course_id,
    },
    validationSchema: chapterValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        const response = await update({ id: chapter.public_id, body: values }).unwrap()
        toast.success(response?.message || "Chapter updated successfully")
        onClose()
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Update failed. Please try again.")
      }
    },
  })

  return (
    <CDialog
      title={`Edit Chapter: ${chapter?.title}`}
      open={open}
      handleCDialogClose={() => {
        onClose()
        formik.resetForm()
      }}
    >
      <CForm onSubmit={formik.handleSubmit} width="45rem" btnProps={{ loading: isUpdating }} dialog>
        <Grid container spacing={2}>
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
          <Grid size={{ xs: 12 }}>
            <CCheckbox
              label="Is Active"
              checked={formik.values.is_active}
              onChange={e => formik.setFieldValue("is_active", e.target.checked)}
            />
          </Grid>
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
  )
}
