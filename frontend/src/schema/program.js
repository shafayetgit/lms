import * as Yup from "yup";

export const programValidationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().nullable(),
  published: Yup.boolean().default(false),
  enforce_course_order: Yup.boolean().default(false),
  courses: Yup.array().of(
    Yup.object().shape({
      course_id: Yup.number().required("Course selection is required"),
      order_index: Yup.number().default(0),
    })
  ).nullable(),
});
