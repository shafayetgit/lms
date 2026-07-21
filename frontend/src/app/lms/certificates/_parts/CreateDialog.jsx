"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import { Grid } from "@mui/material"
import { toast } from "react-toastify"
import dayjs from "dayjs"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CDatePicker from "@/components/form/CDatePicker"
import CCheckbox from "@/components/form/CCheckbox"
import CAutocomplete from "@/components/form/CAutocomplete"

import { useCreateCertificateMutation } from "@/features/certificate/certificateApi"
import { useReadCoursesQuery } from "@/features/course/courseAPI"
import { useReadBatchesQuery } from "@/features/batch/batchAPI"
import { useGetUsersQuery } from "@/features/user/userAPI"
import { certificateValidationSchema } from "@/schema/certificate"
import { mapApiErrorsToFormik } from "@/utils/shared"

export default function CreateDialog() {
  const [open, setOpen] = useState(false)
  const handleClose = () => setOpen(false)
  const handleOpen = () => setOpen(true)

  const [create, { isLoading: isCreating }] = useCreateCertificateMutation()
  const { data: coursesData } = useReadCoursesQuery()
  const courses = coursesData?.data || []

  const { data: batchesData } = useReadBatchesQuery()
  const batches = batchesData?.data || []

  const { data: usersData } = useGetUsersQuery()
  const users = usersData?.data || []

  const formik = useFormik({
    initialValues: {
      member_public_id: "",
      course_public_id: null,
      batch_public_id: null,
      issue_date: dayjs(),
      expiry_date: null,
      template: "",
      published: false,
    },
    validationSchema: certificateValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const payload = {
          ...values,
          issue_date: values.issue_date ? dayjs(values.issue_date).format("YYYY-MM-DD") : null,
          expiry_date: values.expiry_date ? dayjs(values.expiry_date).format("YYYY-MM-DD") : null,
        }
        await create(payload).unwrap()
        toast.success("Certificate issued successfully")
        resetForm()
        handleClose()
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Issuance failed.")
      }
    },
  })

  return (
    <CDialog
      resource="certificate"
      action="create"
      title="Issue Certificate"
      btnProps={{ label: "Issue Certificate", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm onSubmit={formik.handleSubmit} width="40rem" btnProps={{ loading: isCreating }} dialog>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CAutocomplete
              label="Student"
              name="member_public_id"
              options={users.map(u => ({
                label: `${u.first_name} ${u.last_name} (${u.email})`,
                value: u.public_id,
              }))}
              value={
                formik.values.member_public_id
                  ? {
                      label: users.find(u => u.public_id === formik.values.member_public_id)?.email,
                      value: formik.values.member_public_id,
                    }
                  : null
              }
              onChange={(e, val) => formik.setFieldValue("member_public_id", val?.value || "")}
              error={formik.touched.member_public_id && Boolean(formik.errors.member_public_id)}
              helperText={formik.touched.member_public_id && formik.errors.member_public_id}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CAutocomplete
              label="Course"
              name="course_public_id"
              options={courses.map(c => ({ label: c.title, value: c.public_id }))}
              value={
                formik.values.course_public_id
                  ? {
                      label: courses.find(c => c.public_id === formik.values.course_public_id)
                        ?.title,
                      value: formik.values.course_public_id,
                    }
                  : null
              }
              onChange={(e, val) => formik.setFieldValue("course_public_id", val?.value || null)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CAutocomplete
              label="Batch"
              name="batch_public_id"
              options={batches.map(b => ({ label: b.title, value: b.public_id }))}
              value={
                formik.values.batch_public_id
                  ? {
                      label: batches.find(b => b.public_id === formik.values.batch_public_id)
                        ?.title,
                      value: formik.values.batch_public_id,
                    }
                  : null
              }
              onChange={(e, val) => formik.setFieldValue("batch_public_id", val?.value || null)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CDatePicker
              label="Issue Date"
              name="issue_date"
              value={formik.values.issue_date}
              onChange={val => formik.setFieldValue("issue_date", val)}
              error={formik.touched.issue_date && Boolean(formik.errors.issue_date)}
              helperText={formik.touched.issue_date && formik.errors.issue_date}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CDatePicker
              label="Expiry Date"
              name="expiry_date"
              value={formik.values.expiry_date}
              onChange={val => formik.setFieldValue("expiry_date", val)}
              error={formik.touched.expiry_date && Boolean(formik.errors.expiry_date)}
              helperText={formik.touched.expiry_date && formik.errors.expiry_date}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Template Reference (Optional)"
              name="template"
              value={formik.values.template}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.template && Boolean(formik.errors.template)}
              helperText={formik.touched.template && formik.errors.template}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CCheckbox
              label="Published"
              checked={formik.values.published}
              onChange={e => formik.setFieldValue("published", e.target.checked)}
            />
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
  )
}
