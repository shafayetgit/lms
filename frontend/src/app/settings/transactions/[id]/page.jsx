"use client";
import React from "react";
import { useFormik } from "formik";
import { Box, Typography, Card, CardContent, Stack, Avatar, Chip, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";

import CForm from "@/components/ui/CForm";
import CSelect from "@/components/form/CSelect";
import CPageLoader from "@/components/ui/CPageLoader";
import CModuleLayout from "@/components/ui/CModuleLayout";
import PermissionGuard from "@/components/ui/PermissionGuard";
import { InfoOutlined } from "@mui/icons-material";
import CircleIcon from "@mui/icons-material/Circle";
import CButton from "@/components/ui/CButton";
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb";
import usePermissions from "@/hooks/usePermissions";

import { useReadPaymentByPublicIdQuery, useUpdatePaymentStatusMutation } from "@/features/payment/paymentApi";
import { paymentStatusValidationSchema } from "@/schema/payment";
import { PAYMENT_TIPS } from "@/choices/helpTips/payment";
import { mapApiErrorsToFormik } from "@/utils/shared";

export default function TransactionDetailPage() {
  const { id } = useParams();

  const { data: response, isLoading } = useReadPaymentByPublicIdQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: !id,
  });
  const paymentData = response?.data;

  const transactionId = paymentData?.payment_id || paymentData?.public_id?.substring(0, 8) || "Details";
  useSetBreadcrumb(transactionId);

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

  const { can, isSuperAdmin } = usePermissions();
  const canUpdate = isSuperAdmin || can("payment", "update");

  if (isLoading) return <CPageLoader fullPage={false} />

  const navigators = [
    { label: "Details", href: `/settings/transactions/${id}`, icon: <InfoOutlined />, resource: "payment", action: "read" },
  ];

  return (
    <PermissionGuard resource="payment" action="read">
      <CModuleLayout navigators={navigators} helpTips={PAYMENT_TIPS.details}>
        <Box sx={{ width: "100%", maxWidth: "800px", mb: 4 }}>
          <Box py={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="overline" color="textSecondary" fontWeight={600}>
                  TRANSACTION ID
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {paymentData?.payment_id || paymentData?.public_id?.substring(0, 8)}
                </Typography>
              </Box>
              <Chip
                label={paymentData?.status}
                size="small"
                icon={<CircleIcon sx={{ fontSize: 10 }} />}
                color={paymentData?.status === "Completed" ? "success" : "default"}
                sx={{ borderRadius: 1, fontWeight: 600, px: 1, bgcolor: paymentData?.status === "Completed" ? "success.lighter" : undefined, color: paymentData?.status === "Completed" ? "success.dark" : undefined }}
              />
            </Stack>
            <Stack direction="row" spacing={4} mt={1}>
              <Box>
                <Typography variant="caption" color="textSecondary" display="block">Date</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {paymentData?.created_at ? new Date(paymentData.created_at).toLocaleString() : "-"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary" display="block">Source</Typography>
                <Typography variant="body2" fontWeight={500}>{paymentData?.source || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary" display="block">Purchased Item</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {paymentData?.item_details?.title || `${paymentData?.payment_for_type} (${paymentData?.payment_for_id})`}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Divider />

          <Box py={2.5}>
            <Typography variant="overline" color="textSecondary" fontWeight={600} mb={1.5} display="block">
              MEMBER
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" mb={2.5}>
              <Avatar sx={{ bgcolor: "primary.lighter", color: "primary.main", fontWeight: "bold" }}>
                {(() => {
                  const name = paymentData?.billing_name || paymentData?.member?.full_name || "User";
                  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                })()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {paymentData?.billing_name || paymentData?.member?.full_name || "-"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  @{paymentData?.member?.username || "-"}
                </Typography>
              </Box>
            </Stack>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
              <Grid size={{ xs: 4, sm: 4, md: 6 }}>
                <Typography variant="caption" color="textSecondary">
                  Member email
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {paymentData?.member?.email || paymentData?.member_email || "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 4, sm: 4, md: 6 }}>
                <Typography variant="caption" color="textSecondary">
                  Member username
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {paymentData?.member?.username || "-"}
                </Typography>
              </Grid>
            </Grid>
            {(paymentData?.billing_address_line_1 || paymentData?.billing_city || paymentData?.billing_country) && (
              <Box mt={3}>
                <Typography variant="caption" color="textSecondary" display="block" mb={0.5}>
                  Billing address
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {[paymentData.billing_address_line_1, paymentData.billing_address_line_2, paymentData.billing_city, paymentData.billing_state, paymentData.billing_country, paymentData.billing_postal_code].filter(Boolean).join(", ")}
                </Typography>
              </Box>
            )}
          </Box>
          <Divider />

          <Box py={2.5}>
            <Typography variant="overline" color="textSecondary" fontWeight={600} mb={1.5} display="block">
              PAYMENT
            </Typography>
            <Stack spacing={2.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1" color="textSecondary">Original amount</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {paymentData?.currency} {paymentData?.original_amount?.toFixed?.(2) ?? paymentData?.original_amount}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1" color="textSecondary">Discount</Typography>
                <Typography variant="body1" fontWeight={600} color="success.main">
                  {paymentData?.discount_amount > 0 ? "-" : ""} {paymentData?.currency} {paymentData?.discount_amount?.toFixed?.(2) ?? paymentData?.discount_amount}
                </Typography>
              </Stack>
              {paymentData?.coupon_code && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1" color="textSecondary">Coupon applied</Typography>
                  <Typography variant="body1" fontWeight={600} color="textSecondary">
                    {paymentData.coupon_code}
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Divider sx={{ my: 1.5, borderStyle: "dashed" }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight="bold">Final amount paid</Typography>
              <Typography variant="h6" fontWeight="400">
                {paymentData?.currency} {paymentData?.amount?.toFixed?.(2) ?? paymentData?.amount}
              </Typography>
            </Stack>
          </Box>
          <Divider />

          <Box py={2.5}>
            <Typography variant="overline" color="textSecondary" fontWeight={600} mb={1.5} display="block">
              UPDATE STATUS
            </Typography>
            <Box component="form" onSubmit={canUpdate ? formik.handleSubmit : undefined}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box sx={{ width: "300px" }}>
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
                </Box>
                <Box>
                  <CButton type="submit" label="Save" action="save" loading={isUpdating} />
                </Box>
              </Stack>
            </Box>
          </Box>
        </Box>
      </CModuleLayout>
    </PermissionGuard>
  );
}
