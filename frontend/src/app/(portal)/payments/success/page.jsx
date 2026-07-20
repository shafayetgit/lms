"use client";
import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, Typography, Button, Paper, Divider } from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import { useReadPaymentByPublicIdQuery } from "@/features/payment/paymentApi";
import CPageLoader from "@/components/ui/CPageLoader";
import dayjs from "dayjs";
import { getRole } from "@/utils/shared";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const { data, isLoading } = useReadPaymentByPublicIdQuery(ref, { skip: !ref });
  const payment = data?.data;

  if (isLoading) return <CPageLoader />;

  const isFree = payment && parseFloat(payment.amount) === 0;
  const role = getRole();
  const isStudent = role === "student";

  let enrollmentsPath = "/lms/enrollments";
  let dashboardPath = "/lms/dashboard";
  let enrollmentsLabel = "Go to My Enrollments";

  if (isStudent) {
    dashboardPath = "/academy/dashboard";
    if (payment?.payment_for_type === "Batch") {
      enrollmentsPath = "/academy/batches";
      enrollmentsLabel = "Go to My Batches";
    } else {
      enrollmentsPath = "/academy/courses";
      enrollmentsLabel = "Go to My Courses";
    }
  } else {
    if (payment?.payment_for_type === "Batch") {
      enrollmentsPath = "/lms/batches";
      enrollmentsLabel = "Go to Batches";
    }
  }

  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 400,
          width: "100%",
          p: 3,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        <CheckCircleOutline sx={{ fontSize: 56, color: "success.main", mb: 1.5 }} />

        <Typography variant="h6" fontWeight={700} mb={0.5}>
          {isFree ? "Enrollment Successful!" : "Payment Successful!"}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2.5}>
          {isFree
            ? "Your enrollment is now active and you can start learning."
            : "Your payment has been received and your enrollment is now active."}
        </Typography>

        {payment && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ textAlign: "left", mb: 2.5 }}>
              {[
                ["Reference", payment.public_id],
                ["Amount", isFree ? "Free" : `${payment.currency} ${parseFloat(payment.amount).toFixed(2)}`],
                ["Type", payment.payment_for_type],
                ["Date", dayjs(payment.created_at).format("MMM DD, YYYY HH:mm")],
                ["Status", payment.status],
              ].map(([label, value]) => (
                <Box key={label} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{value}</Typography>
                </Box>
              ))}
            </Box>
          </>
        )}

        <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => router.push(enrollmentsPath)}
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 600 }}
          >
            {enrollmentsLabel}
          </Button>
          <Button
            variant="text"
            fullWidth
            onClick={() => router.push(dashboardPath)}
            sx={{ borderRadius: 1, textTransform: "none" }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<CPageLoader />}>
      <SuccessContent />
    </Suspense>
  );
}
