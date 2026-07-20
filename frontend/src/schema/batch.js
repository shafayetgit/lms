import * as Yup from "yup"

export const batchValidationSchema = Yup.object().shape({
  title: Yup.string().trim().required("Title is required").max(200, "Title must be at most 200 characters"),
  description: Yup.string().trim().nullable(),
  batch_details: Yup.string().nullable(),
  start_date: Yup.date().nullable(),
  end_date: Yup.date().nullable().min(
    Yup.ref('start_date'),
    "End date cannot be before start date"
  ),
  start_time: Yup.string().nullable(),
  end_time: Yup.string().nullable(),
  timezone: Yup.string().default("UTC"),
  published: Yup.boolean(),
  allow_self_enrollment: Yup.boolean(),
  seat_count: Yup.number().min(0, "Seat count must be non-negative").nullable(),
  category_id: Yup.number().nullable(),
  medium: Yup.string().nullable(),
  paid_batch: Yup.boolean(),
  amount: Yup.number().min(0, "Amount must be non-negative").nullable(),
  currency: Yup.string().nullable(),
  evaluation: Yup.boolean(),
  evaluation_end_date: Yup.date().nullable(),
  certification: Yup.boolean(),
  meta_image: Yup.mixed().nullable(),
  video_link: Yup.string()
    .nullable()
    .test("is-url", "Must be a valid URL", (val) => !val || val.trim() === "" || /^https?:\/\/.+/.test(val)),
})

export const timetableValidationSchema = Yup.object().shape({
  date: Yup.string().required("Date is required"),
  start_time: Yup.string().required("Start time is required"),
  end_time: Yup.string().required("End time is required"),
  topic: Yup.string().trim().required("Topic is required"),
  description: Yup.string().trim().nullable(),
  meeting_link: Yup.string()
    .nullable()
    .test("is-url", "Must be a valid URL", (val) => !val || val.trim() === "" || /^https?:\/\/.+/.test(val)),
})
