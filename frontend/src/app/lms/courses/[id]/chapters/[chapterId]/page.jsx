"use client"
import React from "react"
import { useFormik } from "formik"
import { Grid } from "@mui/material"
import { toast } from "react-toastify"

import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CCheckbox from "@/components/form/CCheckbox"

import { useReadChapterQuery, useUpdateChapterMutation } from "@/features/chapter/chapterAPI"

import { chapterValidationSchema } from "@/schema/chapter"
import { mapApiErrorsToFormik } from "@/utils/shared"
import CModuleLayout from "@/components/ui/CModuleLayout"
import CPageLoader from "@/components/ui/CPageLoader"
import { useParams, useRouter } from "next/navigation"
import { CHAPTER_TIPS } from "@/choices/helpTips/chapter"
import { InfoOutlined, AutoStoriesOutlined } from "@mui/icons-material"
import PermissionGuard from "@/components/ui/PermissionGuard"
import usePermissions from "@/hooks/usePermissions"

export default function Page() {
  const router = useRouter()
  const { id: courseId, chapterId } = useParams()

  const { data = {}, isLoading } = useReadChapterQuery(
    { id: chapterId },
    { refetchOnMountOrArgChange: true, skip: !chapterId }
  )

  const [update, { isLoading: isUpdating }] = useUpdateChapterMutation()

  const formik = useFormik({
    initialValues: {
      title: data?.data?.title ?? "",
      description: data?.data?.description ?? "",
      is_active: data?.data?.is_active ?? true,
      course_id: Number(courseId),
    },
    validationSchema: chapterValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        const response = await update({ id: chapterId, body: values }).unwrap()
        toast.success(response?.message || "Chapter updated successfully")
        router.push(`/lms/courses/${courseId}/chapters`)
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Update failed. Please try again.")
      }
    },
  })

  const { can, isSuperAdmin } = usePermissions()
  const canUpdate = isSuperAdmin || can("chapter", "update")

  if (isLoading) return <CPageLoader fullPage={false} />

  const navigators = [
    {
      label: "Details",
      href: `/lms/courses/${courseId}/chapters/${chapterId}`,
      icon: <InfoOutlined />,
      resource: "chapter",
      action: "read",
    },
    {
      label: "Lessons",
      href: `/lms/courses/${courseId}/chapters/${chapterId}/lessons`,
      icon: <AutoStoriesOutlined />,
      resource: "lesson",
      action: "read",
    },
  ]

  return (
    <PermissionGuard resource="chapter" action="read">
      <CModuleLayout navigators={navigators} helpTips={CHAPTER_TIPS.details}>
        <CForm
          onSubmit={canUpdate ? formik.handleSubmit : undefined}
          width="45rem"
          btnProps={{ loading: isUpdating }}
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
      </CModuleLayout>
    </PermissionGuard>
  )
}
