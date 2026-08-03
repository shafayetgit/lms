"use client"
import React from "react"
import { useFormik } from "formik"
import { Typography, Box, Stack } from "@mui/material"
import Grid from "@mui/material/Grid"
import { toast } from "react-toastify"

import CPageLoader from "@/components/ui/CPageLoader"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CCheckbox from "@/components/form/CCheckbox"
import CSelect from "@/components/form/CSelect"
import CNumberField from "@/components/form/CNumberField"
import CAutocomplete from "@/components/form/CAutocomplete"
import CModuleLayout from "@/components/ui/CModuleLayout"
import CSectionLabel from "@/components/ui/CSectionLabel"

import { useReadSettingsQuery, useUpdateSettingsMutation } from "@/features/settings/settingsApi"
import { useListEmailTemplatesQuery } from "@/features/shared/emailTemplateAPI"
import { settingsValidationSchema } from "@/schema/settings"
import { mapApiErrorsToFormik } from "@/utils/shared"
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY } from "@/lib/constants/currency"

const helpTips = {
  description:
    "Configure global options for the LMS application, including course video behaviors, progression rules, templates, and SEO headers.",
  tips: [
    {
      label: "Video Skipping",
      text: "Toggle whether learners are allowed to skip forward through course videos before completing them.",
    },
    {
      label: "Dwell Time",
      text: "The number of seconds a user must remain on a lesson page before it is marked as completed/read.",
    },
    {
      label: "Progression Gates",
      text: "Gate course progression based on video watch completion, quizzes passed, or assignment uploads.",
    },
    {
      label: "Site Logo (Dark/Light)",
      text: "Specify URLs for the dark and light versions of the main application logo.",
    },
    {
      label: "Site Short Logo (Dark/Light)",
      text: "Specify URLs for the short/collapsed dark and light versions of the logo.",
    },
    {
      label: "Certificate Logo",
      text: "Specify a custom logo URL to be displayed on issued certificates of completion.",
    },
    {
      label: "Email Templates",
      text: "Specify custom email template identifiers to personalize notifications for certificates, batch signups, and payments.",
    },
    {
      label: "SEO Fallbacks",
      text: "Global description, keywords, and og:image defaults used when sharing portal links.",
    },
    {
      label: "Payment Reminders",
      text: "Enable automated email reminders for students who left batch or course payments incomplete.",
    },
    {
      label: "Payment Gateway",
      text: "Configure the specific payment processor/gateway used for course and batch pricing checkouts.",
    },
    {
      label: "Default Currency",
      text: "Specifies the default currency used across all transaction and portal checkouts.",
    },
    {
      label: "Apply Rounding",
      text: "Enables standard mathematical rounding on computed USD equivalent conversions.",
    },
  ],
}

export default function SettingsPage() {
  const { data: settingsResponse, isLoading } = useReadSettingsQuery()
  const settingsData = settingsResponse?.data
  const [update, { isLoading: isUpdating }] = useUpdateSettingsMutation()
  const { data: templatesData } = useListEmailTemplatesQuery({ size: 100 })

  const templates = templatesData?.data || []
  const templateOptions = templates.map(t => ({
    label: `${t.name} (${t.subject})`,
    value: t.name,
  }))

  const formik = useFormik({
    initialValues: {
      default_currency: settingsData?.default_currency ?? DEFAULT_CURRENCY,
      site_logo_dark: settingsData?.site_logo_dark ?? "",
      site_logo_light: settingsData?.site_logo_light ?? "",
      site_short_logo_dark: settingsData?.site_short_logo_dark ?? "",
      site_short_logo_light: settingsData?.site_short_logo_light ?? "",
      certificate_logo: settingsData?.certificate_logo ?? "",
      prevent_skipping_videos: settingsData?.prevent_skipping_videos ?? false,
      send_notification_for_published_courses:
        settingsData?.send_notification_for_published_courses ?? "None",
      send_notification_for_published_batches:
        settingsData?.send_notification_for_published_batches ?? "None",
      lesson_dwell_time: settingsData?.lesson_dwell_time ?? 30,
      enforce_video_completion: settingsData?.enforce_video_completion ?? true,
      enforce_quiz_completion: settingsData?.enforce_quiz_completion ?? true,
      enforce_assignment_completion: settingsData?.enforce_assignment_completion ?? true,
      certification_template: settingsData?.certification_template ?? null,
      batch_confirmation_template: settingsData?.batch_confirmation_template ?? null,
      payment_reminder_template: settingsData?.payment_reminder_template ?? null,
      email_verification_template: settingsData?.email_verification_template ?? null,
      password_reset_template: settingsData?.password_reset_template ?? null,
      password_changed_template: settingsData?.password_changed_template ?? null,
      welcome_template: settingsData?.welcome_template ?? null,
      two_factor_auth_template: settingsData?.two_factor_auth_template ?? null,
      meta_description: settingsData?.meta_description ?? "",
      meta_image: settingsData?.meta_image ?? "",
      meta_keywords: settingsData?.meta_keywords ?? "",
      contact_us_email: settingsData?.contact_us_email ?? "",
      send_payment_reminders_for_batch: settingsData?.send_payment_reminders_for_batch ?? false,
      send_payment_reminders_for_course: settingsData?.send_payment_reminders_for_course ?? false,
      payment_gateway: settingsData?.payment_gateway ?? "",
      apply_rounding_on_equivalent: settingsData?.apply_rounding_on_equivalent ?? false,
    },
    validationSchema: settingsValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        await update(values).unwrap()
        toast.success("Settings updated successfully")
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Update failed")
      }
    },
  })

  const getTemplateValue = fieldName => {
    const val = formik.values[fieldName]
    if (!val) return null
    const template = templates.find(t => t.name === val)
    return {
      label: template ? `${template.name} (${template.subject})` : val,
      value: val,
    }
  }

  if (isLoading) return <CPageLoader fullPage={false} />

  return (
    <CModuleLayout helpTips={helpTips}>
      <Box sx={{ width: "100%", p: 1 }}>
        <Box sx={{ width: "100%" }}>
          <CForm
            onSubmit={formik.handleSubmit}
            width="100%"
            btnProps={{ loading: isUpdating, label: "Save", action: "" }}
          >
            <Grid container spacing={4}>
              {/* Left Column */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={5}>
                  {/* Email Templates */}
                  <Box>
                    <CSectionLabel label="Email Templates" />
                    <Grid container spacing={2.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CAutocomplete
                          label="Certification Template"
                          name="certification_template"
                          options={templateOptions}
                          value={getTemplateValue("certification_template")}
                          onChange={(e, val) =>
                            formik.setFieldValue("certification_template", val?.value || null)
                          }
                          error={
                            formik.touched.certification_template &&
                            Boolean(formik.errors.certification_template)
                          }
                          helperText={
                            formik.touched.certification_template &&
                            formik.errors.certification_template
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CAutocomplete
                          label="Batch Confirmation Template"
                          name="batch_confirmation_template"
                          options={templateOptions}
                          value={getTemplateValue("batch_confirmation_template")}
                          onChange={(e, val) =>
                            formik.setFieldValue("batch_confirmation_template", val?.value || null)
                          }
                          error={
                            formik.touched.batch_confirmation_template &&
                            Boolean(formik.errors.batch_confirmation_template)
                          }
                          helperText={
                            formik.touched.batch_confirmation_template &&
                            formik.errors.batch_confirmation_template
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CAutocomplete
                          label="Payment Reminder Template"
                          name="payment_reminder_template"
                          options={templateOptions}
                          value={getTemplateValue("payment_reminder_template")}
                          onChange={(e, val) =>
                            formik.setFieldValue("payment_reminder_template", val?.value || null)
                          }
                          error={
                            formik.touched.payment_reminder_template &&
                            Boolean(formik.errors.payment_reminder_template)
                          }
                          helperText={
                            formik.touched.payment_reminder_template &&
                            formik.errors.payment_reminder_template
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CAutocomplete
                          label="Email Verification Template"
                          name="email_verification_template"
                          options={templateOptions}
                          value={getTemplateValue("email_verification_template")}
                          onChange={(e, val) =>
                            formik.setFieldValue("email_verification_template", val?.value || null)
                          }
                          error={
                            formik.touched.email_verification_template &&
                            Boolean(formik.errors.email_verification_template)
                          }
                          helperText={
                            formik.touched.email_verification_template &&
                            formik.errors.email_verification_template
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CAutocomplete
                          label="Password Reset Template"
                          name="password_reset_template"
                          options={templateOptions}
                          value={getTemplateValue("password_reset_template")}
                          onChange={(e, val) =>
                            formik.setFieldValue("password_reset_template", val?.value || null)
                          }
                          error={
                            formik.touched.password_reset_template &&
                            Boolean(formik.errors.password_reset_template)
                          }
                          helperText={
                            formik.touched.password_reset_template &&
                            formik.errors.password_reset_template
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CAutocomplete
                          label="Password Changed Template"
                          name="password_changed_template"
                          options={templateOptions}
                          value={getTemplateValue("password_changed_template")}
                          onChange={(e, val) =>
                            formik.setFieldValue("password_changed_template", val?.value || null)
                          }
                          error={
                            formik.touched.password_changed_template &&
                            Boolean(formik.errors.password_changed_template)
                          }
                          helperText={
                            formik.touched.password_changed_template &&
                            formik.errors.password_changed_template
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CAutocomplete
                          label="Welcome Template"
                          name="welcome_template"
                          options={templateOptions}
                          value={getTemplateValue("welcome_template")}
                          onChange={(e, val) =>
                            formik.setFieldValue("welcome_template", val?.value || null)
                          }
                          error={
                            formik.touched.welcome_template &&
                            Boolean(formik.errors.welcome_template)
                          }
                          helperText={
                            formik.touched.welcome_template && formik.errors.welcome_template
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CAutocomplete
                          label="2FA Template"
                          name="two_factor_auth_template"
                          options={templateOptions}
                          value={getTemplateValue("two_factor_auth_template")}
                          onChange={(e, val) =>
                            formik.setFieldValue("two_factor_auth_template", val?.value || null)
                          }
                          error={
                            formik.touched.two_factor_auth_template &&
                            Boolean(formik.errors.two_factor_auth_template)
                          }
                          helperText={
                            formik.touched.two_factor_auth_template &&
                            formik.errors.two_factor_auth_template
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Course Progress Settings */}
                  <Box>
                    <CSectionLabel label="Course Progress Settings" />
                    <Grid container spacing={2.5}>
                      <Grid size={{ xs: 12 }}>
                        <CNumberField
                          label="Lesson Dwell Time (seconds)"
                          name="lesson_dwell_time"
                          value={formik.values.lesson_dwell_time}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          min={0}
                          error={
                            formik.touched.lesson_dwell_time &&
                            Boolean(formik.errors.lesson_dwell_time)
                          }
                          helperText={
                            formik.touched.lesson_dwell_time && formik.errors.lesson_dwell_time
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CCheckbox
                          label="Enforce Video Completion"
                          checked={formik.values.enforce_video_completion}
                          onChange={e =>
                            formik.setFieldValue("enforce_video_completion", e.target.checked)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CCheckbox
                          label="Enforce Quiz Completion"
                          checked={formik.values.enforce_quiz_completion}
                          onChange={e =>
                            formik.setFieldValue("enforce_quiz_completion", e.target.checked)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CCheckbox
                          label="Enforce Assignment Completion"
                          checked={formik.values.enforce_assignment_completion}
                          onChange={e =>
                            formik.setFieldValue("enforce_assignment_completion", e.target.checked)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CCheckbox
                          label="Prevent Skipping Videos"
                          checked={formik.values.prevent_skipping_videos}
                          onChange={e =>
                            formik.setFieldValue("prevent_skipping_videos", e.target.checked)
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Notifications */}
                  <Box>
                    <CSectionLabel label="Notifications" />
                    <Grid container spacing={2.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CSelect
                          label="Send Course Notification"
                          name="send_notification_for_published_courses"
                          value={formik.values.send_notification_for_published_courses}
                          onChange={formik.handleChange}
                          options={[
                            { value: "None", label: "None" },
                            { value: "In-App", label: "In-App" },
                            { value: "Email", label: "Email" },
                          ]}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CSelect
                          label="Send Batch Notification"
                          name="send_notification_for_published_batches"
                          value={formik.values.send_notification_for_published_batches}
                          onChange={formik.handleChange}
                          options={[
                            { value: "None", label: "None" },
                            { value: "In-App", label: "In-App" },
                            { value: "Email", label: "Email" },
                          ]}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
              </Grid>

              {/* Left Column */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={5}>
                  {/* General */}
                  <Box>
                    <CSectionLabel label="General" />
                    <Grid container spacing={2.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CTextField
                          label="Site Logo Dark (URL)"
                          name="site_logo_dark"
                          value={formik.values.site_logo_dark}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CTextField
                          label="Site Logo Light (URL)"
                          name="site_logo_light"
                          value={formik.values.site_logo_light}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CTextField
                          label="Site Short Logo Dark (URL)"
                          name="site_short_logo_dark"
                          value={formik.values.site_short_logo_dark}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CTextField
                          label="Site Short Logo Light (URL)"
                          name="site_short_logo_light"
                          value={formik.values.site_short_logo_light}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CTextField
                          label="Certificate Logo (URL)"
                          name="certificate_logo"
                          value={formik.values.certificate_logo}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CTextField
                          label="Contact Us Email"
                          name="contact_us_email"
                          value={formik.values.contact_us_email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched.contact_us_email &&
                            Boolean(formik.errors.contact_us_email)
                          }
                          helperText={
                            formik.touched.contact_us_email && formik.errors.contact_us_email
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Payment Settings */}
                  <Box>
                    <CSectionLabel label="Payment Settings" />
                    <Grid container spacing={2.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CSelect
                          label="Default Currency"
                          name="default_currency"
                          value={formik.values.default_currency}
                          options={CURRENCY_OPTIONS}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched.default_currency &&
                            Boolean(formik.errors.default_currency)
                          }
                          helperText={
                            formik.touched.default_currency && formik.errors.default_currency
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CTextField
                          label="Payment Gateway"
                          name="payment_gateway"
                          value={formik.values.payment_gateway}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched.payment_gateway && Boolean(formik.errors.payment_gateway)
                          }
                          helperText={
                            formik.touched.payment_gateway && formik.errors.payment_gateway
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <CCheckbox
                          label="Apply rounding on equivalent"
                          checked={formik.values.apply_rounding_on_equivalent}
                          onChange={e =>
                            formik.setFieldValue("apply_rounding_on_equivalent", e.target.checked)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <CCheckbox
                          label="Send payment reminders for batch"
                          checked={formik.values.send_payment_reminders_for_batch}
                          onChange={e =>
                            formik.setFieldValue(
                              "send_payment_reminders_for_batch",
                              e.target.checked
                            )
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <CCheckbox
                          label="Send payment reminders for course"
                          checked={formik.values.send_payment_reminders_for_course}
                          onChange={e =>
                            formik.setFieldValue(
                              "send_payment_reminders_for_course",
                              e.target.checked
                            )
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Grid size={{ xs: 12 }}>
                    <Stack spacing={5}>
                      {/* SEO Settings */}
                      <Box>
                        <CSectionLabel label="SEO" />
                        <Grid container spacing={2.5}>
                          <Grid size={{ xs: 12 }}>
                            <CTextField
                              label="Meta Image (URL)"
                              name="meta_image"
                              value={formik.values.meta_image}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <CTextField
                              label="Meta Description"
                              name="meta_description"
                              multiline
                              rows={3}
                              value={formik.values.meta_description}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <CTextField
                              label="Meta Keywords"
                              name="meta_keywords"
                              multiline
                              rows={4}
                              value={formik.values.meta_keywords}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Stack>
                  </Grid>
                </Stack>
              </Grid>
            </Grid>
          </CForm>
        </Box>
      </Box>
    </CModuleLayout>
  )
}
