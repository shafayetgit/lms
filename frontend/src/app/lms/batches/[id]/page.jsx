"use client"
import React from "react"
import { useFormik } from "formik"
import Grid from "@mui/material/Grid"
import dayjs from "dayjs"
import { toast } from "react-toastify"
import { useParams } from "next/navigation"

import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CNumberField from "@/components/form/CNumberField"
import CCheckbox from "@/components/form/CCheckbox"
import CSelect from "@/components/form/CSelect"
import CAutocomplete from "@/components/form/CAutocomplete"
import CDatePicker from "@/components/form/CDatePicker"
import CTimePicker from "@/components/form/CTimePicker"
import CPageLoader from "@/components/ui/CPageLoader"
import CSectionLabel from "@/components/ui/CSectionLabel"
import CModuleLayout from "@/components/ui/CModuleLayout"
import PermissionGuard from "@/components/ui/PermissionGuard"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"
import { BATCH_TIPS } from "@/choices/helpTips/batch"
import { Dashboard, InfoOutlined, CalendarMonth, Group } from "@mui/icons-material"

import {
  useReadBatchQuery,
  useUpdateBatchMutation,
  useReadBatchMetaQuery,
} from "@/features/batch/batchAPI"
import { batchValidationSchema } from "@/schema/batch"
import { mapApiErrorsToFormik } from "@/utils/shared"
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY } from "@/lib/constants/currency"

export default function BatchDetailPage() {
  const { id } = useParams()

  const { data: { data: batch } = {}, isLoading } = useReadBatchQuery(
    { id },
    { refetchOnMountOrArgChange: true, skip: !id }
  )
  useSetBreadcrumb(batch?.title, `/lms/batches/${id}`)

  const { data: metaData, isLoading: isLoadingMeta } = useReadBatchMetaQuery()
  const categories = metaData?.data?.categories || []
  const courses = metaData?.data?.courses || []

  const [update, { isLoading: isUpdating }] = useUpdateBatchMutation()

  const formik = useFormik({
    initialValues: {
      title: batch?.title ?? "",
      description: batch?.description ?? "",
      start_date: batch?.start_date ?? "",
      end_date: batch?.end_date ?? "",
      start_time: batch?.start_time ?? "",
      end_time: batch?.end_time ?? "",
      timezone: batch?.timezone ?? "UTC",
      seat_count: batch?.seat_count ?? 0,
      published: batch?.published ?? false,
      allow_self_enrollment: batch?.allow_self_enrollment ?? true,
      paid_batch: batch?.paid_batch ?? false,
      amount: batch?.amount ?? 0,
      currency: batch?.currency ?? DEFAULT_CURRENCY,
      medium: batch?.medium ?? "Online",
      evaluation: batch?.evaluation ?? false,
      evaluation_end_date: batch?.evaluation_end_date ?? "",
      certification: batch?.certification ?? false,
      category_id: batch?.category_id ?? "",
      temp_category: batch?.category
        ? { label: batch.category.name, value: batch.category.id }
        : null,
      selected_courses: batch?.courses
        ? batch.courses
            .map(c => courses.find(opt => opt.value === c.course_id))
            .filter(Boolean)
        : [],
    },
    validationSchema: batchValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        const payload = {
          ...values,
          start_date: values.start_date || null,
          end_date: values.end_date || null,
          start_time: values.start_time || null,
          end_time: values.end_time || null,
          seat_count: values.seat_count ? Number(values.seat_count) : 0,
          category_id: values.category_id ? Number(values.category_id) : null,
          amount: values.paid_batch && values.amount ? Number(values.amount) : null,
          currency: values.paid_batch ? values.currency : null,
          evaluation_end_date: values.evaluation && values.evaluation_end_date ? values.evaluation_end_date : null,
          courses: (values.selected_courses || []).map(c => ({ course_id: c.value })),
        }
        delete payload.temp_category
        delete payload.selected_courses

        await update({ id, body: payload }).unwrap()
        toast.success("Batch details updated successfully")
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Update failed")
      }
    },
  })

  if (isLoading || isLoadingMeta) return <CPageLoader fullPage={false} />

  const navigators = [
    { label: "Dashboard", href: `/lms/batches/${id}/dashboard`, icon: <Dashboard />, resource: "batch", action: "read" },
    { label: "Details", href: `/lms/batches/${id}`, icon: <InfoOutlined />, resource: "batch", action: "read" },
    { label: "Timetable", href: `/lms/batches/${id}/timetable`, icon: <CalendarMonth />, resource: "batch", action: "read" },
    { label: "Enrollments", href: `/lms/batches/${id}/enrollments`, icon: <Group />, resource: "batch", action: "read" },
  ]

  return (
    <PermissionGuard resource="batch" action="read">
      <CModuleLayout navigators={navigators} helpTips={BATCH_TIPS.details}>
        <CForm
          onSubmit={formik.handleSubmit}
          width="70rem"
          btnProps={{ loading: isUpdating }}
          sx={{ border: "none" }}
        >
          <Grid container spacing={{ xs: 2, md: 4 }}>
            <Grid container size={{ xs: 12, md: 6 }} spacing={2}>
              {/* Basic Information */}
              <Grid size={{ xs: 12 }}>
                <CSectionLabel label="Basic Information" />
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

              <Grid size={{ xs: 12, md: 6 }}>
                <CAutocomplete
                  label="Category"
                  name="category_id"
                  value={formik.values.temp_category}
                  options={categories}
                  onChange={(_, val) => {
                    formik.setFieldValue("temp_category", val)
                    formik.setFieldValue("category_id", val?.value || "")
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CSelect
                  label="Medium"
                  name="medium"
                  value={formik.values.medium}
                  options={[
                    { label: "Online", value: "Online" },
                    { label: "Offline", value: "Offline" },
                    { label: "Hybrid", value: "Hybrid" },
                  ]}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CAutocomplete
                  multiple
                  label="Associated Courses"
                  options={courses}
                  value={formik.values.selected_courses}
                  onChange={(_, val) => formik.setFieldValue("selected_courses", val || [])}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CTextField
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Grid>
            </Grid>

            <Grid container size={{ xs: 12, md: 6 }} spacing={2}>
              {/* Schedule & Capacity */}
              <Grid size={{ xs: 12 }}>
                <CSectionLabel label="Schedule & Capacity" />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CDatePicker
                  label="Start Date"
                  name="start_date"
                  value={formik.values.start_date ? dayjs(formik.values.start_date) : null}
                  onChange={(val) => formik.setFieldValue("start_date", val ? dayjs(val).format("YYYY-MM-DD") : "")}
                  error={formik.touched.start_date && Boolean(formik.errors.start_date)}
                  helperText={formik.touched.start_date && formik.errors.start_date}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CDatePicker
                  label="End Date"
                  name="end_date"
                  value={formik.values.end_date ? dayjs(formik.values.end_date) : null}
                  onChange={(val) => formik.setFieldValue("end_date", val ? dayjs(val).format("YYYY-MM-DD") : "")}
                  error={formik.touched.end_date && Boolean(formik.errors.end_date)}
                  helperText={formik.touched.end_date && formik.errors.end_date}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CTimePicker
                  label="Start Time"
                  name="start_time"
                  value={formik.values.start_time ? dayjs(`2000-01-01T${formik.values.start_time}`) : null}
                  onChange={(val) => formik.setFieldValue("start_time", val ? dayjs(val).format("HH:mm:ss") : "")}
                  error={formik.touched.start_time && Boolean(formik.errors.start_time)}
                  helperText={formik.touched.start_time && formik.errors.start_time}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CTimePicker
                  label="End Time"
                  name="end_time"
                  value={formik.values.end_time ? dayjs(`2000-01-01T${formik.values.end_time}`) : null}
                  onChange={(val) => formik.setFieldValue("end_time", val ? dayjs(val).format("HH:mm:ss") : "")}
                  error={formik.touched.end_time && Boolean(formik.errors.end_time)}
                  helperText={formik.touched.end_time && formik.errors.end_time}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CNumberField
                  label="Seat Capacity Limit (0 for unlimited)"
                  name="seat_count"
                  value={formik.values.seat_count}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Grid>

              {/* Pricing & Evaluation */}
              <Grid size={{ xs: 12 }}>
                <CSectionLabel label="Pricing & Evaluation" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <CCheckbox
                  label="Paid Batch"
                  checked={formik.values.paid_batch}
                  onChange={e => {
                    formik.setFieldValue("paid_batch", e.target.checked)
                    if (!e.target.checked) formik.setFieldValue("amount", 0)
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <CNumberField
                  label="Price / Amount"
                  name="amount"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!formik.values.paid_batch}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <CSelect
                  label="Currency"
                  name="currency"
                  value={formik.values.currency}
                  options={CURRENCY_OPTIONS}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!formik.values.paid_batch}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CCheckbox
                  label="Evaluation Required"
                  checked={formik.values.evaluation}
                  onChange={e => formik.setFieldValue("evaluation", e.target.checked)}
                />
              </Grid>

              {formik.values.evaluation && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <CDatePicker
                    label="Evaluation Deadline"
                    name="evaluation_end_date"
                    value={formik.values.evaluation_end_date ? dayjs(formik.values.evaluation_end_date) : null}
                    onChange={(val) => formik.setFieldValue("evaluation_end_date", val ? dayjs(val).format("YYYY-MM-DD") : "")}
                    error={formik.touched.evaluation_end_date && Boolean(formik.errors.evaluation_end_date)}
                    helperText={formik.touched.evaluation_end_date && formik.errors.evaluation_end_date}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            {/* Settings */}
            <Grid size={{ xs: 12 }}>
              <CSectionLabel label="Settings & Visibility" />
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 4 }}>
              <CCheckbox
                label="Published"
                checked={formik.values.published}
                onChange={e => formik.setFieldValue("published", e.target.checked)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 4 }}>
              <CCheckbox
                label="Allow Self Enrollment"
                checked={formik.values.allow_self_enrollment}
                onChange={e => formik.setFieldValue("allow_self_enrollment", e.target.checked)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 4 }}>
              <CCheckbox
                label="Issuance of Certificate"
                checked={formik.values.certification}
                onChange={e => formik.setFieldValue("certification", e.target.checked)}
              />
            </Grid>
          </Grid>
        </CForm>
      </CModuleLayout>
    </PermissionGuard>
  )
}
