import * as Yup from "yup"

export const couponValidationSchema = Yup.object().shape({
  code: Yup.string().required("Coupon code is required").max(50),
  type: Yup.string()
    .oneOf(["Percent", "Amount"], "Invalid coupon type")
    .required("Type is required"),
  discount: Yup.number().required("Discount amount/percentage is required").min(0),
  validity: Yup.date().nullable(),
  max_uses: Yup.number().nullable().min(1, "Must be at least 1 if set"),
  is_active: Yup.boolean().default(true),
  applicable_items: Yup.array()
    .of(
      Yup.object().shape({
        reference_type: Yup.string().oneOf(["Course", "Batch", "Program"]).required(),
        reference_id: Yup.number().required("Item selection is required"),
      })
    )
    .nullable(),
})

export const paymentStatusValidationSchema = Yup.object().shape({
  status: Yup.string()
    .oneOf(["Pending", "Completed", "Failed", "Refunded"], "Invalid status")
    .required("Status is required"),
})
