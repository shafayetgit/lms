import * as yup from "yup";

export const quizValidationSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  course_id: yup.number().required("Course is required").positive(),
  description: yup.string().nullable(),
  time_limit: yup.number().nullable().positive("Time limit must be a positive number"),
  passing_score: yup.number().min(0).max(100).default(70),
  is_active: yup.boolean().default(true),
});
