"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import { Grid } from "@mui/material"
import { toast } from "react-toastify"
import * as Yup from "yup"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CAutocomplete from "@/components/form/CAutocomplete"

import { useRequestCertificateMutation } from "@/features/certificate/certificateApi"
import { useReadCoursesQuery } from "@/features/course/courseAPI"
import { useReadBatchesQuery } from "@/features/batch/batchAPI"
import { useGetUsersQuery } from "@/features/user/userAPI"
import { mapApiErrorsToFormik } from "@/utils/shared"

const validationSchema = Yup.object()
  .shape({
    member_public_id: Yup.string().required("Student is required"),
    course_public_id: Yup.string().nullable(),
    batch_public_id: Yup.string().nullable(),
  })
  .test(
    "at-least-one",
    "Must provide either a course or a batch",
    value => !!value.course_public_id || !!value.batch_public_id
  )

export default function CreateDialog() {
  const [open, setOpen] = useState(false)
  const handleClose = () => setOpen(false)
  const handleOpen = () => setOpen(true)

  const [createRequest, { isLoading: isCreating }] = useRequestCertificateMutation()
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
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        await createRequest(values).unwrap()
        toast.success("Certificate request submitted successfully")
        resetForm()
        handleClose()
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Failed to submit request.")
      }
    },
  })

  return (
    <CDialog
      title="New Certificate Request"
      btnProps={{ label: "New Request", action: "add" }}
      resource="certificate_request"
      action="create"
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm
        onSubmit={formik.handleSubmit}
        width="35rem"
        btnProps={{ action: "", label: "Create", loading: isCreating }}
        dialog
      >
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
        </Grid>
      </CForm>
    </CDialog>
  )
}
