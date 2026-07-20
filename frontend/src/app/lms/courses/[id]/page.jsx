"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import { Grid, LinearProgress, Box, Typography, Divider } from "@mui/material"
import { toast } from "react-toastify"

import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CNumberField from "@/components/form/CNumberField"
import CCheckbox from "@/components/form/CCheckbox"
import CSelect from "@/components/form/CSelect"
import CFileField from "@/components/form/CFileField"
import CSectionLabel from "@/components/ui/CSectionLabel"

import {
  useReadCourseQuery,
  useUpdateCourseMutation,
  useReadCourseMetaQuery,
} from "@/features/course/courseAPI"

import { useAttachMutation } from "@/features/media/mediaApi"
import { courseValidationSchema } from "@/schema/course"
import { mapApiErrorsToFormik } from "@/utils/shared"
import { uploadMultipleToCloudinary } from "@/lib/cloudinary"
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY } from "@/lib/constants/currency"
import { GRADIENT_OPTIONS } from "@/lib/constants"

import { useParams, useRouter } from "next/navigation"
import CPageLoader from "@/components/ui/CPageLoader"
import CAutocomplete from "@/components/form/CAutocomplete"
import CTiptap from "@/components/form/CTiptap"
import CModuleLayout from "@/components/ui/CModuleLayout"
import { COURSE_TIPS } from "@/choices/helpTips/course"
import { School, Star, InfoOutlined, AssignmentTurnedInOutlined, MenuBookOutlined, DashboardOutlined, VisibilityOutlined } from "@mui/icons-material"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"

import PermissionGuard from "@/components/ui/PermissionGuard"
import usePermissions from "@/hooks/usePermissions"

export default function Page() {
  const router = useRouter()
  const { id } = useParams()
  const [uploadProgress, setUploadProgress] = useState(0)

  const { data: { data } = {}, isLoading } = useReadCourseQuery(
    { id },
    { refetchOnMountOrArgChange: true, skip: !id }
  )
  useSetBreadcrumb(data?.title)

  const { data: { data: meta } = {}, isLoading: isLoadingMeta } = useReadCourseMetaQuery()

  const [update, { isLoading: isUpdating }] = useUpdateCourseMutation()
  const [attach, { isLoading: isAttaching }] = useAttachMutation()

  const formik = useFormik({
    initialValues: {
      title: data?.title ?? "",
      overview: data?.overview ?? "",
      short_introduction: data?.short_introduction ?? "",
      instructor_public_ids: data?.instructors ? data.instructors.map(inst => inst.public_id) : [],
      category_public_id: data?.category?.public_id ?? "",

      course_price: data?.course_price ?? 0,
      paid_course: data?.paid_course ?? false,
      published: data?.published ?? false,
      upcoming: data?.upcoming ?? false,
      featured: data?.featured ?? false,
      enable_certification: data?.enable_certification ?? false,
      currency: data?.currency ?? DEFAULT_CURRENCY,
      thumbnail: null,
      temp_category: data?.category ? { label: data.category.name, value: data.category.public_id } : null,
      temp_instructors: data?.instructors
        ? data.instructors.map(inst => ({
            label: inst.first_name + " " + inst.last_name,
            value: inst.public_id,
          }))
        : [],

      video: data?.video ?? "",
      tags: data?.tags ?? "",
      meta_description: data?.meta_description ?? "",
      meta_keywords: data?.meta_keywords ?? "",
      card_gradient: data?.card_gradient ?? "",
      disable_self_learning: data?.disable_self_learning ?? false,
      paid_certificate: data?.paid_certificate ?? false,
      related_course_public_ids: data?.related_courses
        ? [...data.related_courses]
            .sort((a, b) => a.order_index - b.order_index)
            .map(rc => rc.related_course_public_id)
        : [],
      temp_related_courses:
        data?.related_courses && meta?.courses
          ? [...data.related_courses]
              .sort((a, b) => a.order_index - b.order_index)
              .map(rc => meta.courses.find(c => c.value === rc.related_course_public_id))
              .filter(Boolean)
          : [],
    },
    validationSchema: courseValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      setUploadProgress(0)
      try {
        const {
          thumbnail,
          temp_category,
          temp_instructors,
          temp_related_courses,
          ...updatePayload
        } = values

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
        router.push("/lms/courses")
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Update failed. Please try again.")
      }
    },
  })

  const { can, isSuperAdmin } = usePermissions()
  const canUpdate = isSuperAdmin || can("course", "update")

  if (isLoading || isLoadingMeta) return <CPageLoader fullPage={false} />

  const navigators = [
    { label: "Details", href: `/lms/courses/${id}`, icon: <InfoOutlined />, resource: "course", action: "read" },
    { label: "Chapters", href: `/lms/courses/${id}/chapters`, icon: <MenuBookOutlined />, resource: "chapter", action: "read" },
    { label: "Reviews", href: `/lms/courses/${id}/reviews`, icon: <Star />, resource: "review", action: "read" },
    { label: "Enrollments", href: `/lms/courses/${id}/enrollments`, icon: <AssignmentTurnedInOutlined />, resource: "enrollment", action: "read" },
    { label: "Dashboard", href: `/lms/courses/${id}/dashboard`, icon: <DashboardOutlined />, resource: "course", action: "read" },
    { label: "Preview", href: `/courses/${data?.slug || ""}`, target: "_blank", icon: <VisibilityOutlined />, resource: "course", action: "read" },
  ]

  return (
    <PermissionGuard resource="course" action="read">
      <CModuleLayout 
        navigators={navigators}
        helpTips={COURSE_TIPS.details}
      >
        <CForm
          onSubmit={canUpdate ? formik.handleSubmit : undefined}
          width="70rem"
          btnProps={{ loading: isUpdating || isAttaching }}
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
                  name="category_public_id"
                  value={formik.values.temp_category}
                  options={meta?.categories || []}
                  isOptionEqualToValue={(option, value) => option.value === value?.value}
                  getOptionLabel={option => option?.label || ""}
                  onChange={(e, value) => {
                    formik.setFieldValue("category_public_id", value ? value.value : null)
                    formik.setFieldValue("temp_category", value)
                  }}
                  onBlur={formik.handleBlur}
                  required
                  error={formik.touched.category_public_id && Boolean(formik.errors.category_public_id)}
                  helperText={formik.touched.category_public_id && formik.errors.category_public_id}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CAutocomplete
                  multiple
                  label="Instructors"
                  name="instructor_public_ids"
                  value={formik.values.temp_instructors}
                  options={meta?.instructors || []}
                  isOptionEqualToValue={(option, value) => option.value === value?.value}
                  getOptionLabel={option => option?.label || ""}
                  onChange={(e, value) => {
                    formik.setFieldValue("instructor_public_ids", value ? value.map(v => v.value) : [])
                    formik.setFieldValue("temp_instructors", value || [])
                  }}
                  onBlur={formik.handleBlur}
                  required
                  error={formik.touched.instructor_public_ids && Boolean(formik.errors.instructor_public_ids)}
                  helperText={formik.touched.instructor_public_ids && formik.errors.instructor_public_ids}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CTextField
                  label="Short Introduction"
                  name="short_introduction"
                  value={formik.values.short_introduction}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.short_introduction && Boolean(formik.errors.short_introduction)
                  }
                  helperText={formik.touched.short_introduction && formik.errors.short_introduction}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CTextField
                  label="Tags"
                  name="tags"
                  value={formik.values.tags}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.tags && Boolean(formik.errors.tags)}
                  helperText={formik.touched.tags && formik.errors.tags}
                />
              </Grid>
            </Grid>
            <Grid container size={{ xs: 12, md: 6 }} spacing={2}>
              {/* Pricing */}
              <Grid size={{ xs: 12 }}>
                <CSectionLabel label="Pricing" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <CCheckbox
                  label="Paid Course"
                  checked={formik.values.paid_course}
                  onChange={e => {
                    const checked = e.target.checked
                    formik.setFieldValue("paid_course", checked)
                    if (!checked) formik.setFieldValue("course_price", 0)
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <CNumberField
                  label="Price"
                  name="course_price"
                  value={formik.values.course_price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.course_price && Boolean(formik.errors.course_price)}
                  helperText={formik.touched.course_price && formik.errors.course_price}
                  disabled={!formik.values.paid_course}
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
                  error={formik.touched.currency && Boolean(formik.errors.currency)}
                  helperText={formik.touched.currency && formik.errors.currency}
                  disabled={!formik.values.paid_course}
                />
              </Grid>

              {/* Media & Appearance */}
              <Grid size={{ xs: 12 }}>
                <CSectionLabel label="Media & Appearance" />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CTextField
                  label="Video URL"
                  name="video"
                  value={formik.values.video}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.video && Boolean(formik.errors.video)}
                  helperText={formik.touched.video && formik.errors.video}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CAutocomplete
                  label="Card Gradient"
                  name="card_gradient"
                  value={GRADIENT_OPTIONS.find((opt) => opt.value === formik.values.card_gradient) || null}
                  onChange={(event, newValue) => formik.setFieldValue("card_gradient", newValue ? newValue.value : "")}
                  onBlur={() => formik.setFieldTouched("card_gradient", true)}
                  options={GRADIENT_OPTIONS}
                  error={formik.touched.card_gradient && Boolean(formik.errors.card_gradient)}
                  helperText={formik.touched.card_gradient && formik.errors.card_gradient}
                  required={false}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CFileField
                  label="Thumbnail"
                  dragNdrop
                  onChange={e => {
                    formik.setFieldValue("thumbnail", e.target.files[0])
                  }}
                  aspectRatios={[
                    { label: "16:9", value: 16 / 9 },
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

            <Grid size={{ xs: 12 }}>
              <CTiptap
                label="Overview"
                value={formik.values.overview}
                onChange={val => formik.setFieldValue("overview", val)}
                placeholder="Write your course overview..."
                error={formik.touched.overview && Boolean(formik.errors.overview)}
                helperText={formik.touched.overview && formik.errors.overview}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} alignItems="center">
            {/* Settings */}
            <Grid size={{ xs: 12 }}>
              <CSectionLabel label="Settings" />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CCheckbox
                label="Published"
                checked={formik.values.published}
                onChange={e => formik.setFieldValue("published", e.target.checked)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CCheckbox
                label="Featured"
                checked={formik.values.featured}
                onChange={e => formik.setFieldValue("featured", e.target.checked)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CCheckbox
                label="Upcoming"
                checked={formik.values.upcoming}
                onChange={e => formik.setFieldValue("upcoming", e.target.checked)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CCheckbox
                label="Enable Certification"
                checked={formik.values.enable_certification}
                onChange={e => formik.setFieldValue("enable_certification", e.target.checked)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CCheckbox
                label="Paid Certificate"
                checked={formik.values.paid_certificate}
                onChange={e => formik.setFieldValue("paid_certificate", e.target.checked)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CCheckbox
                label="Disable Self Learning"
                checked={formik.values.disable_self_learning}
                onChange={e => formik.setFieldValue("disable_self_learning", e.target.checked)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CAutocomplete
                multiple
                label="Related Courses"
                name="related_course_public_ids"
                value={formik.values.temp_related_courses}
                options={meta?.courses || []}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                getOptionLabel={option => option?.label || ""}
                onChange={(e, value) => {
                  formik.setFieldValue("related_course_public_ids", value ? value.map(v => v.value) : [])
                  formik.setFieldValue("temp_related_courses", value || [])
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.related_course_public_ids && Boolean(formik.errors.related_course_public_ids)}
                helperText={formik.touched.related_course_public_ids && formik.errors.related_course_public_ids}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Meta Tags */}
            <Grid size={{ xs: 12 }}>
              <CSectionLabel label="Meta Tags" />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, mb: 1 }}>
                These tags help search engines describe and rank your course in results.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CTextField
                label="Meta Description"
                name="meta_description"
                value={formik.values.meta_description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.meta_description && Boolean(formik.errors.meta_description)}
                helperText={formik.touched.meta_description && formik.errors.meta_description}
                multiline
                rows={3}
                placeholder="A short summary of the course for search results."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CTextField
                label="Meta Keywords"
                name="meta_keywords"
                value={formik.values.meta_keywords}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.meta_keywords && Boolean(formik.errors.meta_keywords)}
                helperText={formik.touched.meta_keywords && formik.errors.meta_keywords}
                multiline
                rows={3}
                placeholder="Comma separated keywords for SEO."
              />
            </Grid>
          </Grid>
        </CForm>
      </CModuleLayout>
    </PermissionGuard>
  )
}
