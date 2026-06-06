"use client"
import React from "react"
import { useFormik } from "formik"
import { Grid } from "@mui/material"
import { toast } from "react-toastify"

import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CCheckbox from "@/components/form/CCheckbox"
import CSelect from "@/components/form/CSelect"

import { useReadQuizQuery, useUpdateQuizMutation } from "@/features/quiz/quizAPI"
import { useReadCoursesQuery } from "@/features/course/courseAPI"
import { quizValidationSchema } from "@/schema/quiz"
import { mapApiErrorsToFormik } from "@/utils/shared"

import { useParams, useRouter } from "next/navigation"
import CPageLoader from "@/components/ui/CPageLoader"
import ModuleContainer from "@/components/ui/ModuleContainer"

const breadcrumbs = [
  { label: "Dashboard", path: "/" },
  { label: "Quizzes", path: "/admin/quizzes" },
  { label: "Update", path: "" },
]

export default function Page() {
  const router = useRouter()
  const { id } = useParams()

  const { data: quizData, isLoading: isLoadingQuiz } = useReadQuizQuery(
    { id },
    { refetchOnMountOrArgChange: true, skip: !id }
  )

  const { data: coursesData, isLoading: isLoadingCourses } = useReadCoursesQuery({ size: 100 });
  const courseOptions = React.useMemo(() => {
    if (!coursesData?.data) return [];
    return coursesData.data.map(course => ({
      label: course.title,
      value: course.id,
    }));
  }, [coursesData]);

  const [update, { isLoading: isUpdating }] = useUpdateQuizMutation()

  const formik = useFormik({
    initialValues: {
      title: quizData?.data?.title ?? "",
      description: quizData?.data?.description ?? "",
      course_id: quizData?.data?.course_id ?? "",
      time_limit: quizData?.data?.time_limit ?? "",
      passing_score: quizData?.data?.passing_score ?? 70,
      is_active: quizData?.data?.is_active ?? true,
    },
    validationSchema: quizValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        const payload = {
          ...values,
          time_limit: values.time_limit ? Number(values.time_limit) : null,
          passing_score: Number(values.passing_score),
        };

        const response = await update({ id, body: payload }).unwrap()

        toast.success(response?.message || "Quiz updated successfully")
        router.push("/admin/quizzes")
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Update failed. Please try again.")
      }
    },
  })

  if (isLoadingQuiz || isLoadingCourses) return <CPageLoader fullPage={false} />

  return (
    <ModuleContainer breadcrumbs={breadcrumbs} transparentContent>
      <CForm
        onSubmit={formik.handleSubmit}
        width="30rem"
        btnProps={{ loading: isUpdating }}
        title="Update Quiz"
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

          {/* Course */}
          <Grid size={{ xs: 12 }}>
            <CSelect
              label="Course"
              name="course_id"
              value={formik.values.course_id}
              options={courseOptions}
              onChange={e => formik.setFieldValue("course_id", e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched.course_id && Boolean(formik.errors.course_id)}
              helperText={formik.touched.course_id && formik.errors.course_id}
              required
            />
          </Grid>

          {/* Time Limit */}
          <Grid size={{ xs: 6 }}>
            <CTextField
              label="Time Limit (min)"
              name="time_limit"
              type="number"
              value={formik.values.time_limit}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.time_limit && Boolean(formik.errors.time_limit)}
              helperText={formik.touched.time_limit && formik.errors.time_limit}
            />
          </Grid>

          {/* Passing Score */}
          <Grid size={{ xs: 6 }}>
            <CTextField
              label="Passing Score (%)"
              name="passing_score"
              type="number"
              value={formik.values.passing_score}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.passing_score && Boolean(formik.errors.passing_score)}
              helperText={formik.touched.passing_score && formik.errors.passing_score}
              required
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
    </ModuleContainer>
  )
}
