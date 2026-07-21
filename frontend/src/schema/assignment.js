import * as Yup from "yup"

export const assignmentValidationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  type: Yup.string()
    .oneOf(["Document", "PDF", "URL", "Image", "Text"], "Invalid assignment type")
    .required("Type is required"),
  question: Yup.string().required("Question is required"),
  course_id: Yup.number().nullable(),
  show_answer: Yup.boolean().default(false),
  answer: Yup.string().nullable(),
  grade_assignment: Yup.boolean().default(false),
})

export const assignmentSubmissionValidationSchema = Yup.object().shape({
  answer: Yup.string().required("Answer is required"),
})
