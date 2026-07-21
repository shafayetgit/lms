import * as Yup from "yup"

export const badgeValidationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required").max(150),
  description: Yup.string().nullable(),
  image: Yup.string().nullable(),
  is_active: Yup.boolean().default(true),
  reference_table: Yup.string().nullable().max(100),
  event: Yup.string().nullable().max(50),
  user_field: Yup.string().nullable().max(100),
  field_to_check: Yup.string().nullable().max(100),
  condition: Yup.string().nullable(),
  grant_only_once: Yup.boolean().default(true),
})

export const badgeAssignmentValidationSchema = Yup.object().shape({
  badge_public_id: Yup.string().required("Badge is required"),
  member_public_id: Yup.string().required("User is required"),
})
