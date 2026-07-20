import * as Yup from "yup";

export const enrollmentCreateSchema = Yup.object({
  user_id: Yup.number().required("User ID is required").integer(),
  course_id: Yup.number().required("Course ID is required").integer(),
  batch_id: Yup.number().nullable().integer(),
  purchased_certificate: Yup.boolean().default(false),
  status: Yup.string().oneOf(["active", "completed", "cancelled", "expired", "suspended"]).required("Status is required"),
  is_active: Yup.boolean(),
  expires_at: Yup.date().nullable(),
});

export const enrollmentUpdateSchema = Yup.object({
  progress: Yup.number().min(0).max(100).nullable(),
  purchased_certificate: Yup.boolean().nullable(),
  status: Yup.string().oneOf(["active", "completed", "cancelled", "expired", "suspended"]).nullable(),
  is_active: Yup.boolean().nullable(),
  expires_at: Yup.date().nullable(),
  completed_at: Yup.date().nullable(),
});

