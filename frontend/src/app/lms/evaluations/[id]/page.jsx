"use client"
import React from "react"
import { useFormik } from "formik"
import { Grid, Typography, Box } from "@mui/material"
import { toast } from "react-toastify"
import { useParams } from "next/navigation"
import * as Yup from "yup"

import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CSelect from "@/components/form/CSelect"
import CAutocomplete from "@/components/form/CAutocomplete"
import CPageLoader from "@/components/ui/CPageLoader"
import CModuleLayout from "@/components/ui/CModuleLayout"
import { InfoOutlined } from "@mui/icons-material"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"

import {
  useReadEvaluationQuery,
  useGradeEvaluationMutation,
} from "@/features/certificate/certificateApi"
import { useReadInstructorsQuery } from "@/features/instructor/instructorAPI"
import { mapApiErrorsToFormik } from "@/utils/shared"

const validationSchema = Yup.object().shape({
  status: Yup.string().required("Status is required"),
  rating: Yup.number().min(0, "Min 0").max(5, "Max 5").nullable(),
  summary: Yup.string().nullable(),
  date: Yup.string().nullable(),
  start_time: Yup.string().nullable(),
  end_time: Yup.string().nullable(),
  evaluator_public_id: Yup.string().nullable(),
})

export default function EvaluationDetailPage() {
  const { id } = useParams()

  const { data: evalRes, isLoading } = useReadEvaluationQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: !id,
  })

  const { data: instructorsRes, isLoading: isInstructorsLoading } = useReadInstructorsQuery({
    size: 100,
  })

  const evaluation = evalRes?.data
  useSetBreadcrumb(evaluation?.member?.full_name || evaluation?.member?.email)

  const [grade, { isLoading: isGrading }] = useGradeEvaluationMutation()

  const instructors = instructorsRes?.data || []
  const instructorOptions = instructors.map(inst => ({
    label: `${inst.first_name} ${inst.last_name} (${inst.email})`,
    value: inst.public_id,
  }))

  const formik = useFormik({
    initialValues: {
      status: evaluation?.status ?? "Pending",
      rating: evaluation?.rating ?? "",
      summary: evaluation?.summary ?? "",
      date: evaluation?.date ?? "",
      start_time: evaluation?.start_time ?? "",
      end_time: evaluation?.end_time ?? "",
      evaluator_public_id: evaluation?.evaluator?.public_id ?? "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        const payload = { ...values }
        if (!payload.evaluator_public_id) delete payload.evaluator_public_id
        if (!payload.date) delete payload.date
        if (!payload.start_time) delete payload.start_time
        if (!payload.end_time) delete payload.end_time
        if (payload.rating === "") payload.rating = null
        await grade({ id, body: payload }).unwrap()
        toast.success("Evaluation updated successfully")
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Update failed")
      }
    },
  })

  if (isLoading || isInstructorsLoading) return <CPageLoader fullPage={false} />

  const navigators = [{ label: "Details", href: `/lms/evaluations/${id}`, icon: <InfoOutlined /> }]

  const helpTips = {
    description:
      "A Certificate Evaluation is a live session where an assigned instructor/evaluator reviews and grades a student before issuing their certificate. Think of it like a viva voce or oral exam — the student doesn't just automatically get a certificate by completing a course. They go through a human review step first.",
    tips: [
      {
        title: "Pending",
        description: "The evaluation session has been created but not yet started.",
      },
      {
        title: "In Progress",
        description: "The evaluator is currently reviewing the student.",
      },
      {
        title: "Pass → Certificate Issued",
        description:
          "If marked Pass, a certificate is automatically generated and published for the student.",
      },
      {
        title: "Fail → No Certificate",
        description:
          "If marked Fail, no certificate is issued. The student may re-request when ready.",
      },
      {
        title: "Feedback",
        description:
          "Provide constructive written feedback — reference topics the student struggled with to help them improve.",
      },
    ],
  }

  return (
    <CModuleLayout navigators={navigators} helpTips={helpTips}>
      <CForm onSubmit={formik.handleSubmit} width="30rem" btnProps={{ loading: isGrading }}>
        <Grid container spacing={2}>
          {/* Student */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Student"
              value={evaluation?.member?.full_name || evaluation?.member?.email || "N/A"}
              disabled
            />
          </Grid>

          {/* Course/Batch */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Course/Batch"
              value={evaluation?.course?.title || evaluation?.batch?.title || "N/A"}
              disabled
            />
          </Grid>

          {/* Date */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Date"
              name="date"
              type="date"
              value={formik.values.date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.date && Boolean(formik.errors.date)}
              helperText={formik.touched.date && formik.errors.date}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Start Time */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Start Time"
              name="start_time"
              type="time"
              value={formik.values.start_time}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.start_time && Boolean(formik.errors.start_time)}
              helperText={formik.touched.start_time && formik.errors.start_time}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* End Time */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="End Time"
              name="end_time"
              type="time"
              value={formik.values.end_time}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.end_time && Boolean(formik.errors.end_time)}
              helperText={formik.touched.end_time && formik.errors.end_time}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Evaluator */}
          <Grid size={{ xs: 12 }}>
            <CAutocomplete
              label="Evaluator"
              name="evaluator_public_id"
              options={instructorOptions}
              value={
                formik.values.evaluator_public_id
                  ? instructorOptions.find(
                      opt => opt.value === formik.values.evaluator_public_id
                    ) || null
                  : null
              }
              onChange={(e, val) => formik.setFieldValue("evaluator_public_id", val?.value || "")}
              isOptionEqualToValue={(option, val) => option?.value === val?.value}
              error={
                formik.touched.evaluator_public_id && Boolean(formik.errors.evaluator_public_id)
              }
              helperText={formik.touched.evaluator_public_id && formik.errors.evaluator_public_id}
            />
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12 }}>
            <CSelect
              label="Status"
              name="status"
              value={formik.values.status}
              options={[
                { label: "Pending", value: "Pending" },
                { label: "In Progress", value: "In Progress" },
                { label: "Pass", value: "Pass" },
                { label: "Fail", value: "Fail" },
              ]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={formik.touched.status && formik.errors.status}
            />
          </Grid>

          {/* Rating */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Rating (0-5)"
              name="rating"
              type="number"
              value={formik.values.rating}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.rating && Boolean(formik.errors.rating)}
              helperText={formik.touched.rating && formik.errors.rating}
            />
          </Grid>

          {/* Summary / Feedback */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Summary / Feedback"
              name="summary"
              multiline
              rows={4}
              value={formik.values.summary}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.summary && Boolean(formik.errors.summary)}
              helperText={formik.touched.summary && formik.errors.summary}
            />
          </Grid>
        </Grid>
      </CForm>
    </CModuleLayout>
  )
}
