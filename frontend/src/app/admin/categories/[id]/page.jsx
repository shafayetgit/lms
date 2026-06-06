"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import { Grid, LinearProgress, Box, Typography } from "@mui/material"
import { toast } from "react-toastify"

import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CCheckbox from "@/components/form/CCheckbox"
import CSelect from "@/components/form/CSelect"
import CFileField from "@/components/form/CFileField"

import { CATEGORY_CHOICES } from "@/choices/category"
import { useReadCategoryQuery, useUpdateCategoryMutation } from "@/features/category/categoryAPI"

import { useAttachMutation } from "@/features/media/mediaApi"
import { categoryValidationSchema } from "@/schema/category"
import { mapApiErrorsToFormik } from "@/utils/shared"
import { uploadMultipleToCloudinary } from "@/lib/cloudinary"

import { useParams, useRouter } from "next/navigation"
import CPageLoader from "@/components/ui/CPageLoader"
import ModuleContainer from "@/components/ui/ModuleContainer"

const breadcrumbs = [
  { label: "Dashboard", path: "/" },
  { label: "Categories", path: "/admin/categories" },
  { label: "Update", path: "" },
]

export default function Page() {
  const router = useRouter()
  const { id } = useParams()
  const [uploadProgress, setUploadProgress] = useState(0)

  const { data = {}, isLoading } = useReadCategoryQuery(
    { id },
    { refetchOnMountOrArgChange: true, skip: !id }
  )

  const [update, { isLoading: isUpdating }] = useUpdateCategoryMutation()
  const [attach, { isLoading: isAttaching }] = useAttachMutation()

  const formik = useFormik({
    initialValues: {
      name: data?.data?.name ?? "",
      description: data?.data?.description ?? "",
      badge: data?.data?.badge ?? "none",
      is_active: data?.data?.is_active ?? true,
      thumbnail: null,
    },
    validationSchema: categoryValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setErrors }) => {
      setUploadProgress(0);
      try {
        const { thumbnail, ...updatePayload } = values

        // Step 1: Update category
        const categoryResponse = await update({ id, body: updatePayload }).unwrap()
        const categoryId = categoryResponse?.data?.id ?? id

        // Step 2: Upload to Cloudinary and attach media (if thumbnail provided)
        if (thumbnail) {
          toast.info("File is being uploaded")
          try {
            const uploadedFiles = await uploadMultipleToCloudinary({
              files: [
                {
                  file: thumbnail,
                  field: "thumbnail",
                  model: "Category",
                  model_id: categoryId,
                  onProgress: (progress) => setUploadProgress(progress),
                },
              ],
            })
            toast.info("File is being saved")

            // Step 3: Attach media to category
            if (uploadedFiles && uploadedFiles.length > 0) {
              await attach(uploadedFiles).unwrap()
              toast.info("File has been uploaded and saved")
            }


          } catch (mediaError) {
            console.error("Error uploading/attaching media:", mediaError)
            toast.warning(
              "Category updated successfully, but media attachment failed. You can retry uploading the thumbnail."
            )
          } finally {
            setUploadProgress(0)
          }
        }

        toast.success(categoryResponse?.message || "Category updated successfully")
        router.push("/admin/categories")
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Update failed. Please try again.")
      }
    },
  })

  if (isLoading) return <CPageLoader fullPage={false} />

  return (
    <ModuleContainer breadcrumbs={breadcrumbs} transparentContent>
      <CForm
        onSubmit={formik.handleSubmit}
        width="30rem"
        btnProps={{ loading: isUpdating || isAttaching }}
        title="Update"
      >
        <Grid container spacing={2}>
          {/* Name */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
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

          {/* Badge */}
          <Grid size={{ xs: 12 }}>
            <CSelect
              label="Category Badge"
              name="badge"
              value={formik.values.badge}
              options={CATEGORY_CHOICES}
              onChange={e => formik.setFieldValue("badge", e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched.badge && Boolean(formik.errors.badge)}
              helperText={formik.touched.badge && formik.errors.badge}
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

          {/* Thumbnail */}
          <Grid size={{ xs: 12 }}>
            <CFileField
              label="Thumbnail"
              dragNdrop
              onChange={e => {
                formik.setFieldValue("thumbnail", e.target.files[0])
              }}
              aspectRatios={[{ label: "1:1", value: 1 }]}
            />
            {uploadProgress > 0 && uploadProgress <= 100 && (
              <Box sx={{ width: "100%", mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  mt={1}
                >
                  {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : "Processing..."}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </CForm>
    </ModuleContainer>
  )
}
