import * as Yup from "yup"

export const certificateValidationSchema = Yup.object().shape({
  member_public_id: Yup.string().required("Member is required"),
  course_public_id: Yup.string().nullable(),
  batch_public_id: Yup.string().nullable(),
  issue_date: Yup.date().required("Issue date is required"),
  expiry_date: Yup.date().nullable(),
  template: Yup.string().nullable(),
  published: Yup.boolean().default(false),
})

export const evaluationValidationSchema = Yup.object().shape({
  status: Yup.string()
    .oneOf(["Pending", "In Progress", "Pass", "Fail"], "Invalid status")
    .required("Status is required"),
  rating: Yup.number().min(0).max(5).nullable(),
  summary: Yup.string().nullable(),
})

export const requestValidationSchema = Yup.object()
  .shape({
    course_public_id: Yup.string().nullable(),
    batch_public_id: Yup.string().nullable(),
  })
  .test(
    "at-least-one",
    "Must provide either a course or a batch",
    value => !!value.course_public_id || !!value.batch_public_id
  )
