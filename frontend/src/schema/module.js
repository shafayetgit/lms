import * as Yup from "yup"

export const moduleValidationSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .required("Title is required")
    .max(200, "Title must be at most 200 characters"),
  description: Yup.string().trim().nullable(),
  is_active: Yup.boolean().required("Status is required"),
  course_id: Yup.number().required("Course is required"),
})
