import { CATEGORY_CHOICES } from "@/choices/category";
import * as Yup from "yup";

const values = CATEGORY_CHOICES.map((item) => item.value);

export const categoryValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .max(100, "Name must be at most 100 characters"),

  description: Yup.string()
    .trim()
    .nullable()
    .max(500, "Description must be at most 500 characters"),

  badge: Yup.string()
    .oneOf(values, "Invalid badge")
    .required("Badge is required"),

  is_active: Yup.boolean().required("Status is required"),
});