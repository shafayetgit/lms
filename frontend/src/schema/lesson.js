import * as Yup from "yup"

export const lessonValidationSchema = Yup.object().shape({
  title: Yup.string().trim().required("Title is required").max(220, "Title must be at most 220 characters"),
  description: Yup.string().trim().nullable(),
  video: Yup.mixed().nullable(),
  content: Yup.string().nullable(),
  duration: Yup.number().nullable().min(0, "Duration must be non-negative"),
  is_preview: Yup.boolean().required("Preview status is required"),
  is_active: Yup.boolean().required("Status is required"),
  module_id: Yup.number().required("Module is required"),
})
