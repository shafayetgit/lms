"use client"
import React, { useState, useMemo } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Divider from "@mui/material/Divider"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import AddIcon from "@mui/icons-material/Add"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { toast } from "react-toastify"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CCheckbox from "@/components/form/CCheckbox"
import CAutocomplete from "@/components/form/CAutocomplete"
import CTextField from "@/components/form/CTextField"
import CSelect from "@/components/form/CSelect"

import { useCreateBatchEnrollmentMutation, useReadBatchQuery } from "@/features/batch/batchAPI"
import { useReadEnrollmentMetaQuery } from "@/features/enrollment/enrollmentAPI"
import { useCreatePaymentMutation, useLazyReadPaymentsQuery } from "@/features/payment/paymentApi"
import { mapApiErrorsToFormik } from "@/utils/shared"

const createCustomPaper = (onClear, onCreateNew) => {
  return function CustomPaper({ children, ...other }) {
    return (
      <Paper {...other}>
        <Box
          onMouseDown={e => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          {children}
          <Divider />
          <Box sx={{ display: "flex", justifyContent: "space-between", px: 1.5, py: 1 }}>
            <Button
              size="small"
              onClick={onClear}
              sx={{ textTransform: "none", color: "text.secondary" }}
            >
              Clear
            </Button>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={onCreateNew}
              sx={{ textTransform: "none" }}
            >
              Create New
            </Button>
          </Box>
        </Box>
      </Paper>
    )
  }
}

function CreatePaymentDialog({ open, onClose, student, batch, onSuccess }) {
  const [createPayment, { isLoading }] = useCreatePaymentMutation()

  const formik = useFormik({
    initialValues: {
      amount: batch?.amount || 0,
      currency: batch?.currency || "USD",
      source: "Manual",
      status: "Completed",
      billing_name: student ? `${student.first_name || student.label || ""}`.trim() : "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      amount: Yup.number().required("Amount is required").min(0, "Amount cannot be negative"),
      currency: Yup.string().required("Currency is required"),
      source: Yup.string().required("Payment method is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async values => {
      try {
        const payload = {
          member_id: student.value,
          billing_name: values.billing_name || student.label,
          payment_for_type: "Batch",
          payment_for_id: batch.id,
          amount: parseFloat(values.amount),
          original_amount: parseFloat(values.amount),
          currency: values.currency,
          status: values.status,
          source: values.source,
        }
        const res = await createPayment(payload).unwrap()
        toast.success("Payment logged successfully")
        onSuccess(res.data)
        onClose()
      } catch (error) {
        toast.error(error?.data?.message || "Failed to create payment")
      }
    },
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Create Manual Payment</DialogTitle>
      <Divider />
      <DialogContent sx={{ bgcolor: "background.default", pt: 2 }}>
        <CForm
          onSubmit={formik.handleSubmit}
          btnProps={{ label: "Create Payment", loading: isLoading }}
          dialog
        >
          <Grid container spacing={2}>
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
                options={[
                  { label: "USD", value: "USD" },
                  { label: "BDT", value: "BDT" },
                  { label: "EUR", value: "EUR" },
                ]}
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
                ]}
              />
            </Grid>
          </Grid>
        </CForm>
      </DialogContent>
    </Dialog>
  )
}

export default function EnrollStudentDialog({ batchPublicId }) {
  const [open, setOpen] = useState(false)
  const [createPaymentOpen, setCreatePaymentOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
    formik.resetForm()
  }
  const handleOpen = () => setOpen(true)

  const { data: { data: meta } = {} } = useReadEnrollmentMetaQuery(undefined, { skip: !open })
  const { data: { data: batch } = {} } = useReadBatchQuery(
    { id: batchPublicId },
    { skip: !open || !batchPublicId }
  )
  const [enrollStudent, { isLoading }] = useCreateBatchEnrollmentMutation()
  const [fetchPayments, { data: paymentsData, isLoading: paymentsLoading }] =
    useLazyReadPaymentsQuery()

  const payments = paymentsData?.data || []

  const formik = useFormik({
    initialValues: {
      member_public_id: "",
      is_paid: false,
      payment_public_id: "",
      temp_user: null,
      temp_payment: null,
    },
    validationSchema: Yup.object({
      member_public_id: Yup.string().required("Student is required"),
      payment_public_id: Yup.string().nullable(),
    }),
    onSubmit: async (values, { setErrors }) => {
      try {
        const payload = {
          member_public_id: values.member_public_id,
          is_paid: values.is_paid,
          payment_public_id: values.payment_public_id || null,
        }
        await enrollStudent({ batchId: batchPublicId, body: payload }).unwrap()
        toast.success("Student enrolled in cohort successfully")
        handleClose()
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Failed to enroll student. Please try again.")
      }
    },
  })

  const CustomPaper = useMemo(() => {
    return createCustomPaper(
      () => {
        formik.setFieldValue("payment_public_id", "")
        formik.setFieldValue("temp_payment", null)
      },
      () => {
        setCreatePaymentOpen(true)
      }
    )
  }, [formik])

  return (
    <>
      <CDialog
        title="Enroll Student"
        btnProps={{ label: "Enroll Student", action: "add" }}
        open={open}
        handleCDialogOpen={handleOpen}
        handleCDialogClose={handleClose}
        maxWidth="xs"
      >
        <CForm
          onSubmit={formik.handleSubmit}
          width="100%"
          btnProps={{ label: "Enroll", loading: isLoading }}
          dialog
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CAutocomplete
                label="Student"
                name="member_public_id"
                value={formik.values.temp_user}
                options={meta?.users || []}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                getOptionLabel={option => option?.label || ""}
                onChange={(e, value) => {
                  formik.setFieldValue("member_public_id", value ? value.public_id : "")
                  formik.setFieldValue("temp_user", value)
                  if (value) {
                    fetchPayments({ member_id: value.value, limit: 100 })
                  } else {
                    formik.setFieldValue("payment_public_id", "")
                    formik.setFieldValue("temp_payment", null)
                  }
                }}
                onBlur={formik.handleBlur}
                required
                error={formik.touched.member_public_id && Boolean(formik.errors.member_public_id)}
                helperText={formik.touched.member_public_id && formik.errors.member_public_id}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CAutocomplete
                label="Payment"
                name="payment_public_id"
                disabled={!formik.values.member_public_id}
                value={formik.values.temp_payment}
                options={payments}
                isOptionEqualToValue={(option, value) => option.public_id === value?.public_id}
                getOptionLabel={option => {
                  if (!option) return ""
                  const txnId = option.payment_id || option.id
                  return `${txnId} - ${option.amount} ${option.currency} (${option.status})`
                }}
                onChange={(e, value) => {
                  formik.setFieldValue("payment_public_id", value ? value.public_id : "")
                  formik.setFieldValue("temp_payment", value)
                  if (value && value.status === "Completed") {
                    formik.setFieldValue("is_paid", true)
                  }
                }}
                PaperComponent={CustomPaper}
                loading={paymentsLoading}
                noOptionsText="No results"
              />
            </Grid>
            {formik.values.temp_payment && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: -1,
                    mb: 1,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    border: "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      flexGrow: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {`${window.location.origin}/payments/checkout?payment_public_id=${formik.values.temp_payment.public_id}`}
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => {
                      const link = `${window.location.origin}/payments/checkout?payment_public_id=${formik.values.temp_payment.public_id}`
                      navigator.clipboard.writeText(link)
                      toast.success("Payment link copied!")
                    }}
                    sx={{ textTransform: "none", py: 0 }}
                  >
                    Copy
                  </Button>
                </Box>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <CCheckbox
                label="Is Paid (Tuition Fee Cleared)"
                checked={formik.values.is_paid}
                onChange={e => formik.setFieldValue("is_paid", e.target.checked)}
              />
            </Grid>
          </Grid>
        </CForm>
      </CDialog>

      {createPaymentOpen && (
        <CreatePaymentDialog
          open={createPaymentOpen}
          onClose={() => setCreatePaymentOpen(false)}
          student={formik.values.temp_user}
          batch={batch}
          onSuccess={newPayment => {
            // Refetch payments for this user so it appears in the select options
            if (formik.values.temp_user) {
              fetchPayments({ member_id: formik.values.temp_user.value, limit: 100 })
            }
            formik.setFieldValue("payment_public_id", newPayment.public_id)
            formik.setFieldValue("temp_payment", newPayment)
            if (newPayment.status === "Completed") {
              formik.setFieldValue("is_paid", true)
            }
          }}
        />
      )}
    </>
  )
}
