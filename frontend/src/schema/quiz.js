import * as yup from "yup"

export const quizValidationSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().nullable(),
  duration: yup.number().nullable().min(0),
  passing_percentage: yup.number().min(0).max(100).default(50),
  max_attempts: yup.number().min(1).default(1),
  shuffle_questions: yup.boolean().default(false),
  enable_negative_marking: yup.boolean().default(false),
  marks_to_cut: yup.number().min(0).default(0),
  show_answers: yup.boolean().default(false),
  show_submission_history: yup.boolean().default(false),
  is_active: yup.boolean().default(true),
})
