"use client"
import React from "react"
import { useFormik } from "formik"
import { Grid } from "@mui/material"
import { toast } from "react-toastify"

import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CCheckbox from "@/components/form/CCheckbox"

import { useReadModuleQuery, useUpdateModuleMutation } from "@/features/module/moduleAPI"

import { moduleValidationSchema } from "@/schema/module"
import { mapApiErrorsToFormik } from "@/utils/shared"
import { useParams, useRouter } from "next/navigation"
import CPageLoader from "@/components/ui/CPageLoader"
import ModuleContainer from "@/components/ui/ModuleContainer"
import CourseLayout from "../../_components/CourseLayout"
import Navigation from "./_components/Navigation"

export default function Page() {
  const router = useRouter()
  const { id: courseId, moduleId } = useParams()

  const { data = {}, isLoading } = useReadModuleQuery(
    { id: moduleId },
    { refetchOnMountOrArgChange: true, skip: !moduleId }
  )

  const [update, { isLoading: isUpdating }] = useUpdateModuleMutation()

  const formik = useFormik({
    initialValues: {
      title: data?.title ?? "",
      description: data?.description ?? "",
      is_active: data?.is_active ?? true,
      course_id: Number(courseId),
    },
    validationSchema: moduleValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        const response = await update({ id: moduleId, body: values }).unwrap()
        toast.success(response?.message || "Module updated successfully")
        router.push(`/admin/courses/${courseId}/modules`)
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
    { label: "Update Module", path: "" },
  ]

  return (
    <CourseLayout Navigation={<Navigation />}>
      <ModuleContainer breadcrumbs={breadcrumbs} transparentContent>
        <CForm
          onSubmit={formik.handleSubmit}
          width="45rem"
          btnProps={{ loading: isUpdating }}
          title="Update Module"
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

            {/* Is Active */}
            <Grid size={{ xs: 12 }}>
              <CCheckbox
                label="Is Active"
                checked={formik.values.is_active}
                onChange={e => formik.setFieldValue("is_active", e.target.checked)}
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
          </Grid>
        </CForm>
      </ModuleContainer>
    </CourseLayout>
  )
}
