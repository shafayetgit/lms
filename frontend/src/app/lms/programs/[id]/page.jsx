"use client"
import React from "react"
import { useFormik } from "formik"
import Grid from "@mui/material/Grid"
import { InfoOutlined, SchoolOutlined, AssignmentTurnedInOutlined } from "@mui/icons-material"
import { toast } from "react-toastify"
import { useParams, useRouter } from "next/navigation"

import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CCheckbox from "@/components/form/CCheckbox"
import CPageLoader from "@/components/ui/CPageLoader"
import CModuleLayout from "@/components/ui/CModuleLayout"
import { PROGRAM_TIPS } from "@/choices/helpTips/program"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"

import { useReadProgramQuery, useUpdateProgramMutation } from "@/features/program/programApi"
import { programValidationSchema } from "@/schema/program"
import { mapApiErrorsToFormik } from "@/utils/shared"
import PermissionGuard from "@/components/ui/PermissionGuard"
import usePermissions from "@/hooks/usePermissions"

export default function ProgramDetailPage() {
  const router = useRouter()
  const { id } = useParams()

  const { data: { data: programDataObj } = {}, isLoading } = useReadProgramQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: !id,
  })

  useSetBreadcrumb(programDataObj?.title)

  const [update, { isLoading: isUpdating }] = useUpdateProgramMutation()

  const formik = useFormik({
    initialValues: {
      title: programDataObj?.title ?? "",
      description: programDataObj?.description ?? "",
      published: programDataObj?.published ?? false,
      enforce_course_order: programDataObj?.enforce_course_order ?? false,
    },
    validationSchema: programValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        await update({ id, body: values }).unwrap()
        toast.success("Program updated successfully")
        router.push("/lms/programs")
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Update failed")
      }
    },
  })

  const { can, isSuperAdmin } = usePermissions()
  const canUpdate = isSuperAdmin || can("program", "update")

  if (isLoading) return <CPageLoader fullPage={false} />

  const navigators = [
    {
      label: "Details",
      href: `/lms/programs/${id}`,
      icon: <InfoOutlined />,
      resource: "program",
      action: "read",
    },
    {
      label: "Courses",
      href: `/lms/programs/${id}/courses`,
      icon: <SchoolOutlined />,
      resource: "program",
      action: "read",
    },
    {
      label: "Members",
      href: `/lms/programs/${id}/members`,
      icon: <AssignmentTurnedInOutlined />,
      resource: "program",
      action: "read",
    },
  ]

  return (
    <PermissionGuard resource="program" action="read">
      <CModuleLayout navigators={navigators} helpTips={PROGRAM_TIPS.details}>
        <CForm
          onSubmit={canUpdate ? formik.handleSubmit : undefined}
          width="100%"
          btnProps={{ loading: isUpdating }}
        >
          <Grid container spacing={2}>
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
            <Grid size={{ xs: 12 }}>
              <CTextField
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CCheckbox
                label="Enforce Course Order"
                checked={formik.values.enforce_course_order}
                onChange={e => formik.setFieldValue("enforce_course_order", e.target.checked)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CCheckbox
                label="Published"
                checked={formik.values.published}
                onChange={e => formik.setFieldValue("published", e.target.checked)}
              />
            </Grid>
          </Grid>
        </CForm>
      </CModuleLayout>
    </PermissionGuard>
  )
}
