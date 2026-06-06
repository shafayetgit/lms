"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import { Grid, LinearProgress, Box, Typography } from "@mui/material"
import { toast } from "react-toastify"

import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CCheckbox from "@/components/form/CCheckbox"
import CFileField from "@/components/form/CFileField"

import { useAttachMutation } from "@/features/media/mediaApi"
import { uploadMultipleToCloudinary } from "@/lib/cloudinary"

import {
  useReadLessonQuery,
  useUpdateLessonMutation,
} from "@/features/lesson/lessonAPI"

import { lessonValidationSchema } from "@/schema/lesson"
import { mapApiErrorsToFormik } from "@/utils/shared"
import { useParams, useRouter } from "next/navigation"
import CPageLoader from "@/components/ui/CPageLoader"
import ModuleContainer from "@/components/ui/ModuleContainer"

export default function Page() {
  const router = useRouter()
  const { id: courseId, moduleId, lessonId } = useParams()
  const [uploadProgress, setUploadProgress] = useState(0)

  const { data = {}, isLoading } = useReadLessonQuery(
    { id: lessonId },
    { refetchOnMountOrArgChange: true, skip: !lessonId }
  )

  const [update, { isLoading: isUpdating }] = useUpdateLessonMutation()
  const [attach, { isLoading: isAttaching }] = useAttachMutation()

  const formik = useFormik({
    initialValues: {
      title: data?.title ?? "",
      description: data?.description ?? "",
      video: data?.video ?? "",
      content: data?.content ?? "",
      duration: data?.duration ?? 0,
      is_preview: data?.is_preview ?? false,
      is_active: data?.is_active ?? true,
      module_id: Number(moduleId),
    },
    validationSchema: lessonValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      setUploadProgress(0)
      try {
        const { video, ...updatePayload } = values
        
        // Update lesson details
        if (!updatePayload.content) updatePayload.content = null
        // We will update the video URL after upload, or if it is already a string
        if (typeof video === 'string') {
          updatePayload.video = video || null;
        }

        const response = await update({ id: lessonId, body: updatePayload }).unwrap()
        const updatedLessonId = response?.data?.id ?? lessonId
        
        // Upload video if it's a new file
        if (video instanceof File) {
          toast.info("Video is being uploaded")
          try {
            const uploadedFiles = await uploadMultipleToCloudinary({
              files: [
                {
                  file: video,
                  field: "video",
                  model: "Lesson",
                  model_id: updatedLessonId,
                  onProgress: progress => setUploadProgress(progress),
                },
              ],
            })
            
            if (uploadedFiles && uploadedFiles.length > 0) {
              await attach(uploadedFiles).unwrap()
              // Also update the lesson's video column with the secure_url
              await update({ id: updatedLessonId, body: { video: uploadedFiles[0].meta.secure_url } }).unwrap()
              toast.info("Video has been uploaded and saved")
            }
          } catch (mediaError) {
            console.error("Error uploading/attaching media:", mediaError)
            toast.warning(
              "Lesson updated successfully, but video upload failed. You can retry uploading."
            )
          } finally {
            setUploadProgress(0)
          }
        } else {
          toast.success(response?.message || "Lesson updated successfully")
        }

        router.push(`/admin/courses/${courseId}/modules/${moduleId}/lessons`)
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Update failed. Please try again.")
      }
    },
  })

  if (isLoading) return <CPageLoader fullPage={false} />

  const breadcrumbs = [
    { label: "Dashboard", path: "/" },
    { label: "Courses", path: "/admin/courses" },
    { label: "Course Details", path: `/admin/courses/${courseId}` },
    { label: "Modules", path: `/admin/courses/${courseId}/modules` },
    { label: "Module Details", path: `/admin/courses/${courseId}/modules/${moduleId}` },
    { label: "Lessons", path: `/admin/courses/${courseId}/modules/${moduleId}/lessons` },
    { label: "Update Lesson", path: "" },
  ]

  return (
    <ModuleContainer breadcrumbs={breadcrumbs} transparentContent>
      <CForm
        onSubmit={formik.handleSubmit}
        width="45rem"
        btnProps={{ loading: isUpdating || isAttaching }}
        title="Update Lesson"
      >
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
            {typeof formik.values.video === 'string' && formik.values.video !== "" && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Current video: <a href={formik.values.video} target="_blank" rel="noreferrer">View</a>
              </Typography>
            )}
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
    </ModuleContainer>
  )
}
