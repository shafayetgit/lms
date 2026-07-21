import * as Yup from "yup"

export const LESSON_TYPES = [
  { value: "video", label: "Video" },
  { value: "content", label: "Content" },
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Assignment" },
]

export const lessonValidationSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .required("Title is required")
    .max(220, "Title must be at most 220 characters"),
  lesson_type: Yup.string().oneOf(["video", "content", "quiz", "assignment"]).required(),
  description: Yup.string().trim().nullable(),
  // video
  body: Yup.string().nullable(),
  youtube: Yup.string().url("Must be a valid URL").nullable(),
  duration: Yup.number().nullable().min(0, "Duration must be non-negative"),
  // content
  content: Yup.string().nullable(),
  // quiz / assignment
  quiz_id: Yup.number().nullable(),
  assignment_id: Yup.number().nullable(),
  // meta
  include_in_preview: Yup.boolean(),
  is_active: Yup.boolean(),
  // public_id (UUID string) or integer — backend resolves to integer FK
  chapter_id: Yup.mixed().required("Chapter is required"),
  course_id: Yup.mixed().required(),
  order_index: Yup.number().min(0),
})
