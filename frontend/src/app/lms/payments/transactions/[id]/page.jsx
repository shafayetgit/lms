"use client";
import React from "react";
import { useFormik } from "formik";
import { Box, Typography, Card, CardContent } from "@mui/material";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";

import CForm from "@/components/ui/CForm";
import CSelect from "@/components/form/CSelect";
import CPageLoader from "@/components/ui/CPageLoader";
import CModuleLayout from "@/components/ui/CModuleLayout";

import { useReadPaymentQuery, useUpdatePaymentStatusMutation } from "@/features/payment/paymentApi";
import { paymentStatusValidationSchema } from "@/schema/payment";
import { PAYMENT_TIPS } from "@/choices/helpTips/payment";
import { mapApiErrorsToFormik } from "@/utils/shared";

export default function TransactionDetailPage() {
  const { id } = useParams();

  const { data: paymentData, isLoading } = useReadPaymentQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: !id,
  });

  const [update, { isLoading: isUpdating }] = useUpdatePaymentStatusMutation();

  const formik = useFormik({
    initialValues: {
      status: paymentData?.status ?? "Pending",
    },
    validationSchema: paymentStatusValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        await update({ id, body: values }).unwrap();
        toast.success("Payment status updated successfully");
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        toast.error(error?.data?.message || "Update failed");
      }
    },
  });

  if (isLoading) return <CPageLoader fullPage={false} />;

  return (
    <CModuleLayout helpTips={PAYMENT_TIPS.details}>
      <Box sx={{ width: "100%" }}>
        <Typography variant="h6" mb={2}>
          Transaction Details
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
              <Grid size={{ xs: 4, sm: 4, md: 6 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Payment ID
                </Typography>
                <Typography variant="body1">{paymentData?.id}</Typography>
              </Grid>
              <Grid size={{ xs: 4, sm: 4, md: 6 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Member ID
                </Typography>
                <Typography variant="body1">{paymentData?.member_id}</Typography>
              </Grid>
              <Grid size={{ xs: 4, sm: 4, md: 6 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Target
                </Typography>
                <Typography variant="body1">
                  {paymentData?.payment_for_type} ({paymentData?.payment_for_id})
                </Typography>
              </Grid>
              <Grid size={{ xs: 4, sm: 4, md: 6 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Gateway Reference
                </Typography>
                <Typography variant="body1">{paymentData?.payment_id || "N/A"}</Typography>
              </Grid>
              <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Original Amount
                </Typography>
                <Typography variant="body1">
                  {paymentData?.currency} {paymentData?.original_amount?.toFixed?.(2) ?? paymentData?.original_amount}
                </Typography>
              </Grid>
              <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Discount
                </Typography>
                <Typography variant="body1">
                  {paymentData?.currency} {paymentData?.discount_amount?.toFixed?.(2) ?? paymentData?.discount_amount}
                </Typography>
              </Grid>
              <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Final Amount Paid
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {paymentData?.currency} {paymentData?.amount?.toFixed?.(2) ?? paymentData?.amount}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Typography variant="h6" mb={2}>
          Update Status
        </Typography>
        <CForm onSubmit={formik.handleSubmit} width="100%" btnProps={{ loading: isUpdating, label: "Update Status" }}>
          <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            <Grid size={{ xs: 4, sm: 4, md: 6 }}>
              <CSelect
                label="Status"
                name="status"
                value={formik.values.status}
                options={[
                  { label: "Pending", value: "Pending" },
                  { label: "Completed", value: "Completed" },
                  { label: "Failed", value: "Failed" },
                  { label: "Refunded", value: "Refunded" },
                ]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && formik.errors.status}
              />
            </Grid>
          </Grid>
        </CForm>
      </Box>
    </CModuleLayout>
  );
}
