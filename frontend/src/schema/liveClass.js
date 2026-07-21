import * as Yup from "yup"

export const liveClassValidationSchema = Yup.object()
  .shape({
    title: Yup.string().required("Title is required").max(150),
    description: Yup.string().nullable(),
    batch_id: Yup.number().nullable(),
    course_id: Yup.number().nullable(),
    host_id: Yup.number().required("Host is required"),
    date: Yup.date().required("Date is required"),
    time: Yup.string().required("Time is required"), // HH:mm format
    duration: Yup.number()
      .required("Duration is required")
      .min(1, "Duration must be at least 1 minute"),
    timezone: Yup.string().required("Timezone is required"),
    meeting_link: Yup.string().url("Must be a valid URL").required("Meeting link is required"),
    password: Yup.string().nullable(),
    auto_recording: Yup.boolean().default(false),
    recording_link: Yup.string().url("Must be a valid URL").nullable(),
    status: Yup.string()
      .oneOf(["Scheduled", "Live", "Completed", "Cancelled"])
      .default("Scheduled"),
  })
  .test(
    "requires-course-or-batch",
    "Live class must be bound to a Course or a Batch",
    function (values) {
      if (!values.batch_id && !values.course_id) {
        return this.createError({
          path: "course_id",
          message: "Live class must be bound to a Course or a Batch",
        })
      }
      return true
    }
  )
