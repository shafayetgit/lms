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

  type: Yup.string()
    .oneOf(values, "Invalid type")
    .required("Type is required"),

  isActive: Yup.boolean().required("Status is required"),
});