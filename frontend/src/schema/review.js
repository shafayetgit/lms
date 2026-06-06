import * as Yup from "yup";

export const reviewCreateSchema = Yup.object({
  course_id: Yup.number().required("Course ID is required").integer(),
  student_id: Yup.number().required("Student ID is required").integer(),
  rating: Yup.number().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5").required("Rating is required"),
  body: Yup.string().nullable(),
  is_active: Yup.boolean(),
});

export const reviewUpdateSchema = Yup.object({
  rating: Yup.number().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5").nullable(),
  body: Yup.string().nullable(),
  is_active: Yup.boolean().nullable(),
});
