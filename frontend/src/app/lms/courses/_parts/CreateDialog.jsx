"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import { Grid, LinearProgress, Box, Typography, Divider } from "@mui/material"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CNumberField from "@/components/form/CNumberField"
import CCheckbox from "@/components/form/CCheckbox"
import CSelect from "@/components/form/CSelect"
import CSectionLabel from "@/components/ui/CSectionLabel"

import { toast } from "react-toastify"

import { useCreateCourseMutation, useReadCourseMetaQuery } from "@/features/course/courseAPI"
import { useAttachMutation } from "@/features/media/mediaApi"
import { courseValidationSchema } from "@/schema/course"
import { mapApiErrorsToFormik } from "@/utils/shared"
import CFileField from "@/components/form/CFileField"
import { uploadMultipleToCloudinary } from "@/lib/cloudinary"
import CAutocomplete from "@/components/form/CAutocomplete"
import CTiptap from "@/components/form/CTiptap"
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY } from "@/lib/constants/currency"
import { GRADIENT_OPTIONS } from "@/lib/constants"

export default function CreateDialog() {
  const [open, setOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleClose = () => {
    setOpen(false)
    setUploadProgress(0)
  }
  const handleOpen = () => setOpen(true)

  const { data: { data: meta } = {} } = useReadCourseMetaQuery(undefined, { skip: !open })

  const [create, { isLoading: isCreating }] = useCreateCourseMutation()
  const [attach, { isLoading: isAttachingMedia }] = useAttachMutation()

  const formik = useFormik({
    initialValues: {
      title: "",
      overview: "",
      short_introduction: "",
      instructor_public_ids: [],
      category_public_id: "",

      course_price: 0,
      paid_course: false,
      published: false,
      upcoming: false,
      featured: false,
      enable_certification: false,
      currency: DEFAULT_CURRENCY,
      thumbnail: null,
      temp_category: null, // For CAutocomplete
      temp_instructors: [], // For CAutocomplete

      video: "",
      tags: "",
      card_gradient: "",
      disable_self_learning: false,
      paid_certificate: false,
      related_course_public_ids: [],
      temp_related_courses: [],
    },
    validationSchema: courseValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      setUploadProgress(0)
      try {
        const {
          thumbnail,
          temp_category,
          temp_instructors,
          temp_related_courses,
          ...createPayload
        } = values

        // Step 1: Create course
        const response = await create(createPayload).unwrap()
        const courseId = response.data?.id

        // Step 2: Upload to Cloudinary and attach media (if thumbnail provided)
        if (thumbnail && courseId) {
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

            // Step 3: Attach media
            if (uploadedFiles && uploadedFiles.length > 0) {
              await attach(uploadedFiles).unwrap()
              console.log("Media attached successfully")
            }
          } catch (mediaError) {
            console.error("Error uploading/attaching media:", mediaError)
            toast.warning(
              "Course created successfully, but media attachment failed. You can retry uploading the thumbnail."
            )
          } finally {
            setUploadProgress(0)
          }
        }

        toast.success(response?.message || "Course created successfully")
        resetForm()
        handleClose()
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        console.error("Create error:", error)
        toast.error(error?.data?.message || "Create failed. Please try again.")
      }
    },
  })

  const isLoading = isCreating || isAttachingMedia

  return (
    <CDialog
      resource="course"
      action="create"
      title="New Course"
      btnProps={{ label: "New Course", action: "add" }}
      open={open}
      maxWidth="lg"
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm
        onSubmit={formik.handleSubmit}
        width="45rem"
        btnProps={{ action: "", label: "Create", loading: isLoading }}
        dialog
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
                error={
                  formik.touched.category_public_id && Boolean(formik.errors.category_public_id)
                }
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
                  formik.setFieldValue(
                    "instructor_public_ids",
                    value ? value.map(v => v.value) : []
                  )
                  formik.setFieldValue("temp_instructors", value || [])
                }}
                onBlur={formik.handleBlur}
                required
                error={
                  formik.touched.instructor_public_ids &&
                  Boolean(formik.errors.instructor_public_ids)
                }
                helperText={
                  formik.touched.instructor_public_ids && formik.errors.instructor_public_ids
                }
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
              <CTiptap
                label="Overview"
                value={formik.values.overview}
                onChange={val => formik.setFieldValue("overview", val)}
                placeholder="Write your course overview..."
                error={formik.touched.overview && Boolean(formik.errors.overview)}
                helperText={formik.touched.overview && formik.errors.overview}
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
                value={
                  GRADIENT_OPTIONS.find(opt => opt.value === formik.values.card_gradient) || null
                }
                onChange={(event, newValue) =>
                  formik.setFieldValue("card_gradient", newValue ? newValue.value : "")
                }
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
                aspectRatios={[{ label: "16:9", value: 16 / 9 }]}
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

          <Grid size={{ xs: 12 }}>
            <CAutocomplete
              multiple
              label="Related Courses"
              name="related_course_public_ids"
              value={formik.values.temp_related_courses}
              options={meta?.courses || []}
              isOptionEqualToValue={(option, value) => option.value === value?.value}
              getOptionLabel={option => option?.label || ""}
              onChange={(e, value) => {
                formik.setFieldValue(
                  "related_course_public_ids",
                  value ? value.map(v => v.value) : []
                )
                formik.setFieldValue("temp_related_courses", value || [])
              }}
              onBlur={formik.handleBlur}
              error={
                formik.touched.related_course_public_ids &&
                Boolean(formik.errors.related_course_public_ids)
              }
              helperText={
                formik.touched.related_course_public_ids && formik.errors.related_course_public_ids
              }
            />
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
  )
}
