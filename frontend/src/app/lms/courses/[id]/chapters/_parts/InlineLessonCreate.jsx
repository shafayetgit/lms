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
import { VideoLibrary, Article, Quiz, Assignment, Add } from "@mui/icons-material"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CCheckbox from "@/components/form/CCheckbox"
import CFileField from "@/components/form/CFileField"
import CAutocomplete from "@/components/form/CAutocomplete"
import CTiptap from "@/components/form/CTiptap"

import { useAttachMutation } from "@/features/media/mediaApi"
import { uploadMultipleToCloudinary } from "@/lib/cloudinary"
import { toast } from "react-toastify"

import { useCreateLessonMutation, useUpdateLessonMutation } from "@/features/lesson/lessonAPI"
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

// Inline lesson creator — accepts chapterId & courseId as props instead of useParams
export default function InlineLessonCreate({
  chapterId,
  courseId,
  onSuccess,
  triggerType = "button",
}) {
  const [open, setOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleClose = () => setOpen(false)
  const handleOpen = () => setOpen(true)

  const [create, { isLoading: isCreating }] = useCreateLessonMutation()
  const [attach, { isLoading: isAttaching }] = useAttachMutation()
  const [update] = useUpdateLessonMutation()

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
      title: "",
      lesson_type: "video",
      description: "",
      video: "",
      youtube: "",
      duration: 0,
      body: "",
      content: "",
      quiz_id: null,
      assignment_id: null,
      include_in_preview: false,
      is_active: true,
      chapter_id: chapterId, // public_id UUID
      course_id: courseId, // public_id UUID
    },
    validationSchema: lessonValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      setUploadProgress(0)
      try {
        const { video, ...createPayload } = values

        if (createPayload.lesson_type !== "video") {
          createPayload.youtube = null
          createPayload.body = null
          createPayload.duration = null
        }
        if (createPayload.lesson_type !== "content") createPayload.content = null
        if (createPayload.lesson_type !== "quiz") createPayload.quiz_id = null
        if (createPayload.lesson_type !== "assignment") createPayload.assignment_id = null
        createPayload.video = null

        const response = await create(createPayload).unwrap()
        const newLessonId = response?.data?.id ?? response?.id

        if (createPayload.lesson_type === "video" && video instanceof File && newLessonId) {
          toast.info("Video is being uploaded")
          try {
            const uploadedFiles = await uploadMultipleToCloudinary({
              files: [
                {
                  file: video,
                  field: "body",
                  model: "Lesson",
                  model_id: newLessonId,
                  onProgress: p => setUploadProgress(p),
                },
              ],
            })
            if (uploadedFiles?.length > 0) {
              await attach(uploadedFiles).unwrap()
              await update({
                id: newLessonId,
                body: { body: uploadedFiles[0].meta.secure_url },
              }).unwrap()
              toast.info("Video uploaded and saved")
            }
          } catch (mediaError) {
            console.error("Error uploading video:", mediaError)
            toast.warning("Lesson created, but video upload failed.")
          } finally {
            setUploadProgress(0)
          }
        } else {
          toast.success(response?.message || "Lesson created successfully")
        }

        resetForm()
        handleClose()
        if (onSuccess) onSuccess()
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Create failed. Please try again.")
      }
    },
  })

  const lessonType = formik.values.lesson_type

  return (
    <CDialog
      resource="chapter"
      action="create"
      title="Add Lesson"
      btnProps={
        triggerType === "icon"
          ? {
              tooltip: "Add Lesson",
              action: "add",
              iconButton: true,
              sx: { p: 0.4, color: "text.secondary", "&:hover": { color: "primary.main" } },
            }
          : {
              label: "Add Lesson",
              action: "add",
              startIcon: <Add fontSize="small" />,
              size: "small",
              variant: "outlined",
            }
      }
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm
        onSubmit={formik.handleSubmit}
        width="48rem"
        btnProps={{ loading: isCreating || isAttaching }}
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
