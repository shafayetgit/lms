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

import {
  COURSE_LEVEL_CHOICES,
  COURSE_LANGUAGE_CHOICES,
  COURSE_BADGE_CHOICES,
} from "@/choices/course"
import {
  useReadCourseQuery,
  useUpdateCourseMutation,
  useReadCourseMetaQuery,
} from "@/features/course/courseAPI"

import { useAttachMutation } from "@/features/media/mediaApi"
import { courseValidationSchema } from "@/schema/course"
import { mapApiErrorsToFormik } from "@/utils/shared"
import { uploadMultipleToCloudinary } from "@/lib/cloudinary"

import { useParams, useRouter } from "next/navigation"
import CPageLoader from "@/components/ui/CPageLoader"
import ModuleContainer from "@/components/ui/ModuleContainer"
import CAutocomplete from "@/components/form/CAutocomplete"
import CourseLayout from "./_components/CourseLayout"
import Navigation from "./_components/Navigation"

const breadcrumbs = [
  { label: "Dashboard", path: "/" },
  { label: "Courses", path: "/admin/courses" },
  { label: "Update", path: "" },
]

export default function Page() {
  const router = useRouter()
  const { id } = useParams()
  const [uploadProgress, setUploadProgress] = useState(0)

  const { data: { data } = {}, isLoading } = useReadCourseQuery(
    { id },
    { refetchOnMountOrArgChange: true, skip: !id }
  )

  const { data: { data: meta } = {}, isLoading: isLoadingMeta } = useReadCourseMetaQuery()

  const [update, { isLoading: isUpdating }] = useUpdateCourseMutation()
  const [attach, { isLoading: isAttaching }] = useAttachMutation()

  const formik = useFormik({
    initialValues: {
      title: data?.title ?? "",
      description: data?.description ?? "",
      instructor_id: data?.instructor_id ?? "",
      category_id: data?.category_id ?? "",
      level: data?.level ?? "beginner",
      language: data?.language ?? "en",
      price: data?.price ?? 0,
      is_free: data?.is_free ?? false,
      is_active: data?.is_active ?? true,
      badge: data?.badge ?? "none",
      duration: data?.duration ?? 0,
      thumbnail: null,
      temp_category: data?.category ? { label: data.category.name, value: data.category.id } : null,
      temp_instructor: data?.instructor
        ? {
            label: data.instructor.first_name + " " + data.instructor.last_name,
            value: data.instructor.id,
          }
        : null,
    },
    validationSchema: courseValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      setUploadProgress(0)
      try {
        const { thumbnail, temp_category, temp_instructor, ...updatePayload } = values

        // Step 1: Update course
        const response = await update({ id, body: updatePayload }).unwrap()
        const courseId = response?.data?.id ?? id

        // Step 2: Upload to Cloudinary and attach media (if thumbnail provided)
        if (thumbnail) {
          toast.info("File is being uploaded")
          try {
            const uploadedFiles = await uploadMultipleToCloudinary({
              files: [
                {
                  file: thumbnail,
                  field: "thumbnail",
                  model: "Course",
                  model_id: courseId,
                  onProgress: progress => setUploadProgress(progress),
                },
              ],
            })
            toast.info("File is being saved")

            // Step 3: Attach media to course
            if (uploadedFiles && uploadedFiles.length > 0) {
              await attach(uploadedFiles).unwrap()
              toast.info("File has been uploaded and saved")
            }
          } catch (mediaError) {
            console.error("Error uploading/attaching media:", mediaError)
            toast.warning(
              "Course updated successfully, but media attachment failed. You can retry uploading the thumbnail."
            )
          } finally {
            setUploadProgress(0)
          }
        }

        toast.success(response?.message || "Course updated successfully")
        router.push("/admin/courses")
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Update failed. Please try again.")
      }
    },
  })

  if (isLoading || isLoadingMeta) return <CPageLoader fullPage={false} />

  return (
    <CourseLayout Navigation={<Navigation />}>
      <ModuleContainer breadcrumbs={breadcrumbs} transparentContent>
        <CForm
          onSubmit={formik.handleSubmit}
          width="45rem"
          btnProps={{ loading: isUpdating || isAttaching }}
          title="Update"
        >
          <Grid container spacing={2}>
            {/* Title */}
            <Grid size={{ xs: 12, md: 6 }}>
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

            {/* Category */}
            <Grid size={{ xs: 12, md: 6 }}>
              <CAutocomplete
                label="Category"
                name="category_id"
                value={formik.values.temp_category}
                options={meta?.categories || []}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                getOptionLabel={option => option?.label || ""}
                onChange={(e, value) => {
                  formik.setFieldValue("category_id", value ? value.id : null)
                  formik.setFieldValue("temp_category", value)
                }}
                onBlur={formik.handleBlur}
                required
                error={formik.touched.category_id && Boolean(formik.errors.category_id)}
                helperText={formik.touched.category_id && formik.errors.category_id}
              />
            </Grid>

            {/* Instructor */}
            <Grid size={{ xs: 12, md: 6 }}>
              <CAutocomplete
                label="Instructor"
                name="instructor_id"
                value={formik.values.temp_instructor}
                options={meta?.instructors || []}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                getOptionLabel={option => option?.label || ""}
                onChange={(e, value) => {
                  formik.setFieldValue("instructor_id", value ? value.id : null)
                  formik.setFieldValue("temp_instructor", value)
                }}
                onBlur={formik.handleBlur}
                required
                error={formik.touched.instructor_id && Boolean(formik.errors.instructor_id)}
                helperText={formik.touched.instructor_id && formik.errors.instructor_id}
              />
            </Grid>

            {/* Badge */}
            <Grid size={{ xs: 12, md: 6 }}>
              <CSelect
                label="Badge"
                name="badge"
                value={formik.values.badge}
                options={COURSE_BADGE_CHOICES}
                onChange={e => formik.setFieldValue("badge", e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.badge && Boolean(formik.errors.badge)}
                helperText={formik.touched.badge && formik.errors.badge}
              />
            </Grid>

            {/* Level */}
            <Grid size={{ xs: 12, md: 6 }}>
              <CSelect
                label="Level"
                name="level"
                value={formik.values.level}
                options={COURSE_LEVEL_CHOICES}
                onChange={e => formik.setFieldValue("level", e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.level && Boolean(formik.errors.level)}
                helperText={formik.touched.level && formik.errors.level}
              />
            </Grid>

            {/* Language */}
            <Grid size={{ xs: 12, md: 6 }}>
              <CSelect
                label="Language"
                name="language"
                value={formik.values.language}
                options={COURSE_LANGUAGE_CHOICES}
                onChange={e => formik.setFieldValue("language", e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.language && Boolean(formik.errors.language)}
                helperText={formik.touched.language && formik.errors.language}
              />
            </Grid>

            {/* Price */}
            <Grid size={{ xs: 12, md: 6 }}>
              <CTextField
                label="Price"
                name="price"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
                disabled={formik.values.is_free}
              />
            </Grid>

            {/* Duration */}
            <Grid size={{ xs: 12, md: 6 }}>
              <CTextField
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={formik.values.duration}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.duration && Boolean(formik.errors.duration)}
                helperText={formik.touched.duration && formik.errors.duration}
              />
            </Grid>

            {/* Checkboxes */}
            <Grid size={{ xs: 12, md: 6 }}>
              <CCheckbox
                label="Is Free"
                checked={formik.values.is_free}
                onChange={e => {
                  const checked = e.target.checked
                  formik.setFieldValue("is_free", checked)
                  if (checked) formik.setFieldValue("price", 0)
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
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

            {/* Thumbnail */}
            <Grid size={{ xs: 12 }}>
              <CFileField
                label="Thumbnail"
                dragNdrop
                onChange={e => {
                  formik.setFieldValue("thumbnail", e.target.files[0])
                }}
                aspectRatios={[
                  { label: "16:9", value: 16 / 9 },
                  { label: "4:3", value: 4 / 3 },
                ]}
              />
              {uploadProgress > 0 && uploadProgress <= 100 && (
                <Box sx={{ width: "100%", mt: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="body2" color="text.secondary" align="center" mt={1}>
                    {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : "Processing..."}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CForm>
      </ModuleContainer>
    </CourseLayout>
  )
}
