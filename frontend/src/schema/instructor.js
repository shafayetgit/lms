import * as Yup from "yup"

export const instructorCreateSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  qualification: Yup.string().required("Qualification is required"),
  specialization: Yup.string().nullable(),
  bio: Yup.string().nullable(),
  phone_number: Yup.string().nullable(),
  department: Yup.string().nullable(),
  is_active: Yup.boolean(),
})

export const instructorUpdateSchema = Yup.object({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  qualification: Yup.string().required("Qualification is required"),
  specialization: Yup.string().nullable(),
  bio: Yup.string().nullable(),
  phone_number: Yup.string().nullable(),
  department: Yup.string().nullable(),
  is_active: Yup.boolean(),
})
