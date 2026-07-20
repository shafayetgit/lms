import * as Yup from "yup";

export const settingsValidationSchema = Yup.object().shape({
  default_currency: Yup.string().max(10).required("Currency is required"),
  site_logo_dark: Yup.string().nullable(),
  site_logo_light: Yup.string().nullable(),
  site_short_logo_dark: Yup.string().nullable(),
  site_short_logo_light: Yup.string().nullable(),
  certificate_logo: Yup.string().nullable(),

  // General Settings
  prevent_skipping_videos: Yup.boolean().default(false),
  send_notification_for_published_courses: Yup.string().nullable(),
  send_notification_for_published_batches: Yup.string().nullable(),

  // Course Progress Settings
  lesson_dwell_time: Yup.number().integer().min(0).default(30).required("Dwell time is required"),
  enforce_video_completion: Yup.boolean().default(true),
  enforce_quiz_completion: Yup.boolean().default(true),
  enforce_assignment_completion: Yup.boolean().default(true),

  // Email Template Settings
  certification_template: Yup.string().nullable(),
  batch_confirmation_template: Yup.string().nullable(),
  payment_reminder_template: Yup.string().nullable(),
  email_verification_template: Yup.string().nullable(),
  password_reset_template: Yup.string().nullable(),
  password_changed_template: Yup.string().nullable(),
  welcome_template: Yup.string().nullable(),
  two_factor_auth_template: Yup.string().nullable(),

  // SEO Settings
  meta_description: Yup.string().nullable(),
  meta_image: Yup.string().nullable(),
  meta_keywords: Yup.string().nullable(),

  // Contact Us Settings
  contact_us_email: Yup.string().email("Invalid email format").nullable(),

  // Payment Settings
  send_payment_reminders_for_batch: Yup.boolean().default(false),
  send_payment_reminders_for_course: Yup.boolean().default(false),
  payment_gateway: Yup.string().nullable(),
  apply_rounding_on_equivalent: Yup.boolean().default(false),
});
