import * as Yup from "yup"

export const courseValidationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().nullable(),
  instructor_id: Yup.number().required("Instructor is required"),
  category_id: Yup.number().required("Category is required").nullable(),
  level: Yup.string().required("Level is required"),
  language: Yup.string().required("Language is required"),
  price: Yup.number().min(0, "Price must be non-negative").required("Price is required"),
  is_free: Yup.boolean(),
  is_active: Yup.boolean(),
  badge: Yup.string().required("Badge is required"),
  thumbnail: Yup.mixed().nullable(),
  duration: Yup.number().nullable().min(0, "Duration must be non-negative"),
})
