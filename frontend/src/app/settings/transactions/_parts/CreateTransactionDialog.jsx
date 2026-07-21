"use client"
import React, { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import Grid from "@mui/material/Grid"
import { toast } from "react-toastify"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CAutocomplete from "@/components/form/CAutocomplete"
import CTextField from "@/components/form/CTextField"
import CSelect from "@/components/form/CSelect"

import { useCreatePaymentMutation } from "@/features/payment/paymentApi"
import { useReadEnrollmentMetaQuery } from "@/features/enrollment/enrollmentAPI"
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY } from "@/lib/constants/currency"

export default function CreateTransactionDialog({ onSuccess }) {
  const [open, setOpen] = useState(false)
  const [createPayment, { isLoading }] = useCreatePaymentMutation()
  const { data: { data: meta } = {} } = useReadEnrollmentMetaQuery(undefined, { skip: !open })

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    formik.resetForm()
  }

  const formik = useFormik({
    initialValues: {
      student: null,
      payment_for_type: "Course",
      item: null,
      amount: "",
      currency: DEFAULT_CURRENCY,
      source: "Manual",
      status: "Completed",
      billing_name: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      student: Yup.object().nullable().required("Student is required"),
      payment_for_type: Yup.string().required("Type is required"),
      item: Yup.object().nullable().required("Course or Batch is required"),
      amount: Yup.number().required("Amount is required").min(0, "Amount cannot be negative"),
      currency: Yup.string().required("Currency is required"),
      source: Yup.string().required("Payment method is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { setErrors }) => {
      try {
        const payload = {
          member_id: values.student.value,
          billing_name: values.billing_name || values.student.label || "",
          payment_for_type: values.payment_for_type,
          payment_for_id: values.item.value,
          amount: parseFloat(values.amount),
          original_amount: parseFloat(values.amount),
          currency: values.currency,
          status: values.status,
          source: values.source,
        }
        await createPayment(payload).unwrap()
        toast.success("Transaction created successfully")
        if (onSuccess) onSuccess()
        handleClose()
      } catch (error) {
        toast.error(error?.data?.message || "Failed to create transaction")
      }
    },
  })

  const itemOptions =
    formik.values.payment_for_type === "Course" ? meta?.courses || [] : meta?.batches || []

  return (
    <>
      <CDialog
        resource="payment"
        action="create"
        title="New Transaction"
        btnProps={{ label: "New Transaction", action: "add" }}
        open={open}
        handleCDialogOpen={handleOpen}
        handleCDialogClose={handleClose}
        maxWidth="xs"
      >
        <CForm
          onSubmit={formik.handleSubmit}
          width="100%"
          btnProps={{ label: "Create", loading: isLoading }}
          dialog
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CAutocomplete
                label="Student / Member"
                name="student"
                value={formik.values.student}
                options={meta?.users || []}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                getOptionLabel={option => option?.label || ""}
                onChange={(e, value) => {
                  formik.setFieldValue("student", value)
                  if (value && !formik.values.billing_name) {
                    formik.setFieldValue("billing_name", value.label.split(" (")[0])
                  }
                }}
                required
                error={formik.touched.student && Boolean(formik.errors.student)}
                helperText={formik.touched.student && formik.errors.student}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CSelect
                label="Payment For Type"
                name="payment_for_type"
                required
                value={formik.values.payment_for_type}
                onChange={e => {
                  formik.setFieldValue("payment_for_type", e.target.value)
                  formik.setFieldValue("item", null)
                }}
                options={[
                  { label: "Course", value: "Course" },
                  { label: "Batch", value: "Batch" },
                ]}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CAutocomplete
                label={formik.values.payment_for_type === "Course" ? "Course" : "Batch"}
                name="item"
                value={formik.values.item}
                options={itemOptions}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                getOptionLabel={option => option?.label || ""}
                onChange={(e, value) => formik.setFieldValue("item", value)}
                required
                error={formik.touched.item && Boolean(formik.errors.item)}
                helperText={formik.touched.item && formik.errors.item}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CTextField
                label="Billing Name"
                name="billing_name"
                value={formik.values.billing_name}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <CTextField
                label="Amount"
                name="amount"
                type="number"
                required
                value={formik.values.amount}
                onChange={formik.handleChange}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={formik.touched.amount && formik.errors.amount}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <CSelect
                label="Currency"
                name="currency"
                required
                value={formik.values.currency}
                onChange={e => formik.setFieldValue("currency", e.target.value)}
                options={CURRENCY_OPTIONS}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <CTextField
                label="Method / Source"
                name="source"
                required
                value={formik.values.source}
                onChange={formik.handleChange}
                error={formik.touched.source && Boolean(formik.errors.source)}
                helperText={formik.touched.source && formik.errors.source}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <CSelect
                label="Status"
                name="status"
                required
                value={formik.values.status}
                onChange={e => formik.setFieldValue("status", e.target.value)}
                options={[
                  { label: "Completed", value: "Completed" },
                  { label: "Pending", value: "Pending" },
                  { label: "Failed", value: "Failed" },
                  { label: "Refunded", value: "Refunded" },
                ]}
              />
            </Grid>
          </Grid>
        </CForm>
      </CDialog>
    </>
  )
}
