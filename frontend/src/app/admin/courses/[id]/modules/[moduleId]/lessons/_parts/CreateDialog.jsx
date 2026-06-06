"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import { Grid, LinearProgress, Box, Typography } from "@mui/material"
import { useParams } from "next/navigation"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CCheckbox from "@/components/form/CCheckbox"
import CFileField from "@/components/form/CFileField"

import { useAttachMutation } from "@/features/media/mediaApi"
import { uploadMultipleToCloudinary } from "@/lib/cloudinary"

import { toast } from "react-toastify"
import { useCreateLessonMutation, useUpdateLessonMutation } from "@/features/lesson/lessonAPI"
import { lessonValidationSchema } from "@/schema/lesson"
import { mapApiErrorsToFormik } from "@/utils/shared"

export default function CreateDialog() {
  const [open, setOpen] = useState(false)
  const { moduleId } = useParams()
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleClose = () => setOpen(false)
  const handleOpen = () => setOpen(true)

  const [create, { isLoading: isCreating }] = useCreateLessonMutation()
  const [attach, { isLoading: isAttaching }] = useAttachMutation()
  const [update] = useUpdateLessonMutation()

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      video: "",
      content: "",
      duration: 0,
      is_preview: false,
      is_active: true,
      module_id: Number(moduleId),
    },
    validationSchema: lessonValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      setUploadProgress(0)
      try {
        const { video, ...createPayload } = values
        if (!createPayload.content) createPayload.content = null

        // We do not send the video file directly to the create endpoint
        // It must be uploaded first, or we can send it as null and update it later.
        createPayload.video = null

        const response = await create(createPayload).unwrap()
        const newLessonId = response?.data?.id ?? response?.id

        if (video instanceof File && newLessonId) {
          toast.info("Video is being uploaded")
          try {
            const uploadedFiles = await uploadMultipleToCloudinary({
              files: [
                {
                  file: video,
                  field: "video",
                  model: "Lesson",
                  model_id: newLessonId,
                  onProgress: progress => setUploadProgress(progress),
                },
              ],
            })

            if (uploadedFiles && uploadedFiles.length > 0) {
              await attach(uploadedFiles).unwrap()
              // Also update the lesson's video column with the secure_url
              await update({ id: newLessonId, body: { video: uploadedFiles[0].meta.secure_url } }).unwrap()
              toast.info("Video has been uploaded and saved")
            }
          } catch (mediaError) {
            console.error("Error uploading/attaching media:", mediaError)
            toast.warning(
              "Lesson created successfully, but video upload failed."
            )
          } finally {
            setUploadProgress(0)
          }
        } else {
          toast.success(response?.message || "Lesson created successfully")
        }

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
      title="Create Lesson"
      btnProps={{ label: "Create", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm onSubmit={formik.handleSubmit} width="45rem" btnProps={{ loading: isCreating || isAttaching }} dialog>
        <Grid container spacing={2}>
          {/* Title */}
          <Grid size={{ xs: 12, md: 8 }}>
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

          {/* Video */}
          <Grid size={{ xs: 12 }}>
            <CFileField
              label="Video"
              dragNdrop
              onChange={e => {
                formik.setFieldValue("video", e.target.files[0])
              }}
            />
            {uploadProgress > 0 && uploadProgress <= 100 && (
              <Box sx={{ width: "100%", mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="text.secondary" align="center" mt={1}>
                  {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : "Processing..."}
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Duration */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CTextField
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formik.values.duration}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.duration && Boolean(formik.errors.duration)}
              helperText={formik.touched.duration && formik.errors.duration}
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
              rows={2}
            />
          </Grid>

          {/* Content */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Content (Markdown/HTML)"
              name="content"
              value={formik.values.content}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.content && Boolean(formik.errors.content)}
              helperText={formik.touched.content && formik.errors.content}
              multiline
              rows={4}
            />
          </Grid>

          {/* Checkboxes */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CCheckbox
              label="Is Preview (Free)"
              checked={formik.values.is_preview}
              onChange={e => formik.setFieldValue("is_preview", e.target.checked)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
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
