import * as Yup from "yup";

export const profileSchema = Yup.object().shape({
  first_name: Yup.string()
    .max(100, "First name must be at most 100 characters")
    .required("First name is required"),
  last_name: Yup.string()
    .max(100, "Last name must be at most 100 characters")
    .required("Last name is required"),
  phone_number: Yup.string().max(20, "Phone number must be at most 20 characters").nullable(),
  timezone: Yup.string().nullable(),
});

export const changePasswordSchema = Yup.object().shape({
  current_password: Yup.string().required("Current password is required"),
  new_password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("new_password"), null], "Passwords must match")
    .required("Confirm new password is required"),
});
