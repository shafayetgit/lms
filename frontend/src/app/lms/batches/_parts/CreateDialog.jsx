"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import Grid from "@mui/material/Grid"
import dayjs from "dayjs"
import { toast } from "react-toastify"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CNumberField from "@/components/form/CNumberField"
import CAutocomplete from "@/components/form/CAutocomplete"
import CCheckbox from "@/components/form/CCheckbox"
import CSelect from "@/components/form/CSelect"
import CDatePicker from "@/components/form/CDatePicker"
import CTimePicker from "@/components/form/CTimePicker"

import { useCreateBatchMutation, useReadBatchMetaQuery } from "@/features/batch/batchAPI"
import { batchValidationSchema } from "@/schema/batch"
import { mapApiErrorsToFormik } from "@/utils/shared"
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY } from "@/lib/constants/currency"

export default function CreateDialog() {
  const [open, setOpen] = useState(false)
  const handleClose = () => setOpen(false)
  const handleOpen = () => setOpen(true)

  const { data: metaData } = useReadBatchMetaQuery(undefined, { skip: !open })
  const categories = metaData?.data?.categories || []
  const courses = metaData?.data?.courses || []

  const [create, { isLoading: isCreating }] = useCreateBatchMutation()

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      seat_count: 0,
      category_id: "",
      medium: "Online",
      published: false,
      allow_self_enrollment: true,
      paid_batch: false,
      amount: "",
      currency: DEFAULT_CURRENCY,
      evaluation: false,
      evaluation_end_date: "",
      certification: false,
      selected_courses: [],
      temp_category: null,
    },
    validationSchema: batchValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
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

        await create(payload).unwrap()
        toast.success("Batch created successfully")
        resetForm()
        handleClose()
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Creation failed.")
      }
    },
  })

  return (
    <CDialog
      resource="batch"
      action="create"
      title="New Batch"
      btnProps={{ label: "New Batch", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm onSubmit={formik.handleSubmit} width="36rem" btnProps={{ action:"", label: "Create", loading: isCreating }} dialog>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
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

          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <CTextField
              label="Description"
              name="description"
              multiline
              rows={2}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 6 }}>
            <CAutocomplete
              label="Category"
              options={categories}
              value={formik.values.temp_category}
              onChange={(_, val) => {
                formik.setFieldValue("temp_category", val)
                formik.setFieldValue("category_id", val?.value || "")
              }}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 6 }}>
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

          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <CAutocomplete
              label="Associated Courses"
              multiple
              options={courses}
              value={formik.values.selected_courses}
              onChange={(_, val) => formik.setFieldValue("selected_courses", val || [])}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 6 }}>
            <CDatePicker
              label="Start Date"
              name="start_date"
              value={formik.values.start_date ? dayjs(formik.values.start_date) : null}
              onChange={(val) => formik.setFieldValue("start_date", val ? dayjs(val).format("YYYY-MM-DD") : "")}
              error={formik.touched.start_date && Boolean(formik.errors.start_date)}
              helperText={formik.touched.start_date && formik.errors.start_date}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 6 }}>
            <CDatePicker
              label="End Date"
              name="end_date"
              value={formik.values.end_date ? dayjs(formik.values.end_date) : null}
              onChange={(val) => formik.setFieldValue("end_date", val ? dayjs(val).format("YYYY-MM-DD") : "")}
              error={formik.touched.end_date && Boolean(formik.errors.end_date)}
              helperText={formik.touched.end_date && formik.errors.end_date}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 6 }}>
            <CTimePicker
              label="Start Time"
              name="start_time"
              value={formik.values.start_time ? dayjs(`2000-01-01T${formik.values.start_time}`) : null}
              onChange={(val) => formik.setFieldValue("start_time", val ? dayjs(val).format("HH:mm:ss") : "")}
              error={formik.touched.start_time && Boolean(formik.errors.start_time)}
              helperText={formik.touched.start_time && formik.errors.start_time}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 6 }}>
            <CTimePicker
              label="End Time"
              name="end_time"
              value={formik.values.end_time ? dayjs(`2000-01-01T${formik.values.end_time}`) : null}
              onChange={(val) => formik.setFieldValue("end_time", val ? dayjs(val).format("HH:mm:ss") : "")}
              error={formik.touched.end_time && Boolean(formik.errors.end_time)}
              helperText={formik.touched.end_time && formik.errors.end_time}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <CNumberField
              label="Seat Count (0 for unlimited)"
              name="seat_count"
              value={formik.values.seat_count}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.seat_count && Boolean(formik.errors.seat_count)}
              helperText={formik.touched.seat_count && formik.errors.seat_count}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 6 }}>
            <CCheckbox
              label="Published"
              checked={formik.values.published}
              onChange={e => formik.setFieldValue("published", e.target.checked)}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 6 }}>
            <CCheckbox
              label="Allow Self Enrollment"
              checked={formik.values.allow_self_enrollment}
              onChange={e => formik.setFieldValue("allow_self_enrollment", e.target.checked)}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 6 }}>
            <CCheckbox
              label="Paid Batch"
              checked={formik.values.paid_batch}
              onChange={e => formik.setFieldValue("paid_batch", e.target.checked)}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 6 }}>
            <CCheckbox
              label="Evaluation Required"
              checked={formik.values.evaluation}
              onChange={e => formik.setFieldValue("evaluation", e.target.checked)}
            />
          </Grid>

          {formik.values.paid_batch && (
            <>
              <Grid size={{ xs: 4, sm: 4, md: 6 }}>
                <CNumberField
                  label="Amount"
                  name="amount"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
              </Grid>

              <Grid size={{ xs: 4, sm: 4, md: 6 }}>
                <CSelect
                  label="Currency"
                  name="currency"
                  value={formik.values.currency}
                  options={CURRENCY_OPTIONS}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
              </Grid>
            </>
          )}

          {formik.values.evaluation && (
            <Grid size={{ xs: 12, sm: 12, md: 12 }}>
              <CDatePicker
                label="Evaluation End Date"
                name="evaluation_end_date"
                value={formik.values.evaluation_end_date ? dayjs(formik.values.evaluation_end_date) : null}
                onChange={(val) => formik.setFieldValue("evaluation_end_date", val ? dayjs(val).format("YYYY-MM-DD") : "")}
                error={formik.touched.evaluation_end_date && Boolean(formik.errors.evaluation_end_date)}
                helperText={formik.touched.evaluation_end_date && formik.errors.evaluation_end_date}
              />
            </Grid>
          )}
        </Grid>
      </CForm>
    </CDialog>
  )
}
