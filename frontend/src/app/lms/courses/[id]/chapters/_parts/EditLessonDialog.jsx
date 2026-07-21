"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import {
  Grid,
  LinearProgress,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material"
import { VideoLibrary, Article, Quiz, Assignment } from "@mui/icons-material"
import { toast } from "react-toastify"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CCheckbox from "@/components/form/CCheckbox"
import CFileField from "@/components/form/CFileField"
import CAutocomplete from "@/components/form/CAutocomplete"
import CTiptap from "@/components/form/CTiptap"

import { useAttachMutation } from "@/features/media/mediaApi"
import { uploadMultipleToCloudinary } from "@/lib/cloudinary"
import { useUpdateLessonMutation } from "@/features/lesson/lessonAPI"
import { useReadQuizzesQuery } from "@/features/quiz/quizAPI"
import { useReadAssignmentsQuery } from "@/features/assignment/assignmentApi"
import { lessonValidationSchema, LESSON_TYPES } from "@/schema/lesson"
import { mapApiErrorsToFormik } from "@/utils/shared"

const TYPE_ICONS = {
  video: <VideoLibrary fontSize="small" />,
  content: <Article fontSize="small" />,
  quiz: <Quiz fontSize="small" />,
  assignment: <Assignment fontSize="small" />,
}

// Controlled dialog — parent owns open/onClose state
export default function EditLessonDialog({ lesson, courseId, chapterId, open, onClose }) {
  const [uploadProgress, setUploadProgress] = useState(0)

  const [update, { isLoading: isUpdating }] = useUpdateLessonMutation()
  const [attach, { isLoading: isAttaching }] = useAttachMutation()

  const { data: quizzesData } = useReadQuizzesQuery({ courseId, size: 100 }, { skip: !open })
  const { data: assignmentsData } = useReadAssignmentsQuery(
    { course_id: courseId, size: 100 },
    { skip: !open }
  )

  const quizOptions = (quizzesData?.data ?? []).map(q => ({ label: q.title, value: q.id }))
  const assignmentOptions = (assignmentsData?.data ?? []).map(a => ({
    label: a.title,
    value: a.id,
  }))

  const formik = useFormik({
    initialValues: {
      title: lesson?.title ?? "",
      lesson_type: lesson?.lesson_type ?? "video",
      description: lesson?.description ?? "",
      video: lesson?.body ?? "",
      youtube: lesson?.youtube ?? "",
      duration: lesson?.duration ?? 0,
      body: lesson?.body ?? "",
      content: lesson?.content ?? "",
      quiz_id: lesson?.quiz_id ?? null,
      assignment_id: lesson?.assignment_id ?? null,
      include_in_preview: lesson?.include_in_preview ?? false,
      is_active: lesson?.is_active ?? true,
      chapter_id: chapterId || lesson?.chapter_id || "",
      course_id: courseId || lesson?.course_id || "",
    },
    validationSchema: lessonValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      setUploadProgress(0)
      try {
        const { video, ...updatePayload } = values

        if (updatePayload.lesson_type !== "video") {
          updatePayload.youtube = null
          updatePayload.body = null
          updatePayload.duration = null
        }
        if (updatePayload.lesson_type !== "content") updatePayload.content = null
        if (updatePayload.lesson_type !== "quiz") updatePayload.quiz_id = null
        if (updatePayload.lesson_type !== "assignment") updatePayload.assignment_id = null

        if (updatePayload.lesson_type === "video") {
          updatePayload.body = typeof video === "string" ? video || null : null
        }

        const lessonId = lesson.public_id || lesson.id
        const response = await update({ id: lessonId, body: updatePayload }).unwrap()

        if (updatePayload.lesson_type === "video" && video instanceof File) {
          toast.info("Video is being uploaded")
          try {
            const uploadedFiles = await uploadMultipleToCloudinary({
              files: [
                {
                  file: video,
                  field: "body",
                  model: "Lesson",
                  model_id: lesson.id,
                  onProgress: p => setUploadProgress(p),
                },
              ],
            })
            if (uploadedFiles?.length > 0) {
              await attach(uploadedFiles).unwrap()
              await update({
                id: lessonId,
                body: { body: uploadedFiles[0].meta.secure_url },
              }).unwrap()
              toast.info("Video uploaded and saved")
            }
          } catch (mediaError) {
            console.error("Video upload error:", mediaError)
            toast.warning("Lesson updated, but video upload failed.")
          } finally {
            setUploadProgress(0)
          }
        } else {
          toast.success(response?.message || "Lesson updated successfully")
        }

        onClose()
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Update failed. Please try again.")
      }
    },
  })

  const lessonType = formik.values.lesson_type

  return (
    <CDialog
      title={`Edit Lesson: ${lesson?.title}`}
      open={open}
      handleCDialogClose={() => {
        onClose()
        formik.resetForm()
      }}
    >
      <CForm
        onSubmit={formik.handleSubmit}
        width="48rem"
        btnProps={{ loading: isUpdating || isAttaching }}
        dialog
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Lesson Type
            </Typography>
            <ToggleButtonGroup
              value={lessonType}
              exclusive
              onChange={(_, val) => val && formik.setFieldValue("lesson_type", val)}
              size="small"
              fullWidth
            >
              {LESSON_TYPES.map(t => (
                <ToggleButton
                  key={t.value}
                  value={t.value}
                  sx={{ gap: 0.75, textTransform: "capitalize" }}
                >
                  {TYPE_ICONS[t.value]}
                  {t.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>

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

          {lessonType === "video" && (
            <>
              <Grid size={{ xs: 12 }}>
                <CTextField
                  label="YouTube URL"
                  name="youtube"
                  value={formik.values.youtube}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.youtube && Boolean(formik.errors.youtube)}
                  helperText={formik.touched.youtube && formik.errors.youtube}
                  placeholder="https://youtube.com/..."
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CFileField
                  label="Or upload video file"
                  dragNdrop
                  onChange={e => formik.setFieldValue("video", e.target.files[0])}
                />
                {typeof formik.values.video === "string" && formik.values.video !== "" && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Current video:{" "}
                    <a href={formik.values.video} target="_blank" rel="noreferrer">
                      View
                    </a>
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
            </>
          )}

          {lessonType === "content" && (
            <Grid size={{ xs: 12 }}>
              <CTiptap
                label="Content"
                value={formik.values.content}
                onChange={val => formik.setFieldValue("content", val)}
                placeholder="Write your lesson content..."
                error={formik.touched.content && Boolean(formik.errors.content)}
                helperText={formik.touched.content && formik.errors.content}
              />
            </Grid>
          )}

          {lessonType === "quiz" && (
            <Grid size={{ xs: 12 }}>
              <CAutocomplete
                label="Select Quiz"
                options={quizOptions}
                value={quizOptions.find(o => o.value === formik.values.quiz_id) || null}
                getOptionLabel={o => o.label}
                isOptionEqualToValue={(o, v) => o.value === v?.value}
                onChange={(_, val) => formik.setFieldValue("quiz_id", val?.value ?? null)}
                error={formik.touched.quiz_id && Boolean(formik.errors.quiz_id)}
                helperText={formik.touched.quiz_id && formik.errors.quiz_id}
              />
            </Grid>
          )}

          {lessonType === "assignment" && (
            <Grid size={{ xs: 12 }}>
              <CAutocomplete
                label="Select Assignment"
                options={assignmentOptions}
                value={assignmentOptions.find(o => o.value === formik.values.assignment_id) || null}
                getOptionLabel={o => o.label}
                isOptionEqualToValue={(o, v) => o.value === v?.value}
                onChange={(_, val) => formik.setFieldValue("assignment_id", val?.value ?? null)}
                error={formik.touched.assignment_id && Boolean(formik.errors.assignment_id)}
                helperText={formik.touched.assignment_id && formik.errors.assignment_id}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              multiline
              rows={2}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CCheckbox
              label="Is Preview (Free)"
              checked={formik.values.include_in_preview}
              onChange={e => formik.setFieldValue("include_in_preview", e.target.checked)}
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
