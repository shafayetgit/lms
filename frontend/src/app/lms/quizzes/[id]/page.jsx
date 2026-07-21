"use client"
import React from "react"
import { useFormik } from "formik"
import { Grid } from "@mui/material"
import { toast } from "react-toastify"
import { InfoOutlined, Quiz, Assignment } from "@mui/icons-material"

import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CNumberField from "@/components/form/CNumberField"
import CCheckbox from "@/components/form/CCheckbox"

import { useReadQuizQuery, useUpdateQuizMutation } from "@/features/quiz/quizAPI"
import { quizValidationSchema } from "@/schema/quiz"
import { mapApiErrorsToFormik } from "@/utils/shared"

import { useParams, useRouter } from "next/navigation"
import CPageLoader from "@/components/ui/CPageLoader"
import CModuleLayout from "@/components/ui/CModuleLayout"
import { QUIZ_TIPS } from "@/choices/helpTips/quiz"

import PermissionGuard from "@/components/ui/PermissionGuard"
import usePermissions from "@/hooks/usePermissions"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"

export default function Page() {
  const router = useRouter()
  const { id } = useParams()

  const { data: quizData, isLoading: isLoadingQuiz } = useReadQuizQuery(
    { id },
    { refetchOnMountOrArgChange: true, skip: !id }
  )

  useSetBreadcrumb(quizData?.data?.title, `/lms/quizzes/${id}`)

  const [update, { isLoading: isUpdating }] = useUpdateQuizMutation()

  const formik = useFormik({
    initialValues: {
      title: quizData?.data?.title ?? "",
      description: quizData?.data?.description ?? "",
      duration: quizData?.data?.duration ?? 30,
      passing_percentage: quizData?.data?.passing_percentage ?? 80,
      max_attempts: quizData?.data?.max_attempts ?? 1,
      shuffle_questions: quizData?.data?.shuffle_questions ?? false,
      enable_negative_marking: quizData?.data?.enable_negative_marking ?? false,
      marks_to_cut: quizData?.data?.marks_to_cut ?? 0,
      show_answers: quizData?.data?.show_answers ?? false,
      show_submission_history: quizData?.data?.show_submission_history ?? false,
      is_active: quizData?.data?.is_active ?? true,
    },
    validationSchema: quizValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        const payload = {
          ...values,
          duration: Number(values.duration),
          passing_percentage: Number(values.passing_percentage),
          max_attempts: Number(values.max_attempts),
          marks_to_cut: Number(values.marks_to_cut),
        }

        const response = await update({ id, body: payload }).unwrap()

        toast.success(response?.message || "Quiz updated successfully")
        router.push("/lms/quizzes")
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Update failed. Please try again.")
      }
    },
  })

  const { can, isSuperAdmin } = usePermissions()
  const canUpdate = isSuperAdmin || can("quiz", "update")

  if (isLoadingQuiz) return <CPageLoader fullPage={false} />

  const navigators = [
    {
      label: "Details",
      href: `/lms/quizzes/${id}`,
      icon: <InfoOutlined />,
      resource: "quiz",
      action: "read",
    },
    {
      label: "Questions",
      href: `/lms/quizzes/${id}/questions`,
      icon: <Quiz />,
      resource: "question",
      action: "read",
    },
    {
      label: "Submissions",
      href: `/lms/quizzes/${id}/submissions`,
      icon: <Assignment />,
      resource: "quiz_submission",
      action: "read",
    },
  ]

  return (
    <PermissionGuard resource="quiz" action="read">
      <CModuleLayout navigators={navigators} helpTips={QUIZ_TIPS.details}>
        <CForm
          onSubmit={canUpdate ? formik.handleSubmit : undefined}
          width="45rem"
          btnProps={{ loading: isUpdating }}
          sx={{ border: "none" }}
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
                rows={3}
              />
            </Grid>

            {/* Duration / Time Limit */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CNumberField
                label="Time Limit (Minutes)"
                name="duration"
                value={formik.values.duration}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.duration && Boolean(formik.errors.duration)}
                helperText={formik.touched.duration && formik.errors.duration}
                required
              />
            </Grid>

            {/* Passing Percentage */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CNumberField
                label="Passing Percentage (%)"
                name="passing_percentage"
                value={formik.values.passing_percentage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.passing_percentage && Boolean(formik.errors.passing_percentage)
                }
                helperText={formik.touched.passing_percentage && formik.errors.passing_percentage}
                required
              />
            </Grid>

            {/* Max Attempts */}
            <Grid size={{ xs: 12, sm: 6 }}>
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

            {/* Enable Negative Marking */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CCheckbox
                label="Enable Negative Marking"
                checked={formik.values.enable_negative_marking}
                onChange={e => formik.setFieldValue("enable_negative_marking", e.target.checked)}
              />
            </Grid>

            {/* Negative Marking / Marks to cut */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CNumberField
                label="Negative Marks Per Wrong Answer"
                name="marks_to_cut"
                value={formik.values.marks_to_cut}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.marks_to_cut && Boolean(formik.errors.marks_to_cut)}
                helperText={formik.touched.marks_to_cut && formik.errors.marks_to_cut}
                disabled={!formik.values.enable_negative_marking}
              />
            </Grid>

            {/* Shuffle Questions */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <CCheckbox
                label="Shuffle Questions"
                checked={formik.values.shuffle_questions}
                onChange={e => formik.setFieldValue("shuffle_questions", e.target.checked)}
              />
            </Grid>

            {/* Show Answers */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <CCheckbox
                label="Show Answers"
                checked={formik.values.show_answers}
                onChange={e => formik.setFieldValue("show_answers", e.target.checked)}
              />
            </Grid>

            {/* Show Submission History */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <CCheckbox
                label="Show Submission History"
                checked={formik.values.show_submission_history}
                onChange={e => formik.setFieldValue("show_submission_history", e.target.checked)}
              />
            </Grid>

            {/* Is Active */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <CCheckbox
                label="Is Active"
                checked={formik.values.is_active}
                onChange={e => formik.setFieldValue("is_active", e.target.checked)}
              />
            </Grid>
          </Grid>
        </CForm>
      </CModuleLayout>
    </PermissionGuard>
  )
}
