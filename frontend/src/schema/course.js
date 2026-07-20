import * as Yup from "yup"

export const courseValidationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  overview: Yup.string().nullable(),
  short_introduction: Yup.string().nullable(),
  instructor_public_ids: Yup.array().of(Yup.string()).min(1, "At least one instructor is required").required("Instructor is required"),
  category_public_id: Yup.string().required("Category is required").nullable(),

  published: Yup.boolean(),
  upcoming: Yup.boolean(),
  featured: Yup.boolean(),
  paid_course: Yup.boolean(),
  enable_certification: Yup.boolean(),
  course_price: Yup.number().min(0, "Price must be non-negative"),
  currency: Yup.string().nullable(),
  thumbnail: Yup.mixed().nullable(),

  video: Yup.string().nullable(),
  tags: Yup.string().nullable(),
  meta_description: Yup.string().nullable(),
  meta_keywords: Yup.string().nullable(),
  card_gradient: Yup.string().nullable(),
  disable_self_learning: Yup.boolean(),
  paid_certificate: Yup.boolean(),
  related_course_public_ids: Yup.array().of(Yup.string()).nullable(),
})
