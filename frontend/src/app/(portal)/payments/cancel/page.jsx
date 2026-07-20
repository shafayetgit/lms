"use client";
import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, Typography, Button, Paper } from "@mui/material";
import { CancelOutlined } from "@mui/icons-material";
import CPageLoader from "@/components/ui/CPageLoader";

function CancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

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
        <CancelOutlined sx={{ fontSize: 56, color: "warning.main", mb: 1.5 }} />

        <Typography variant="h6" fontWeight={700} mb={0.5}>
          Payment Cancelled
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Your payment was not completed. No charges were made.
        </Typography>
        {ref && (
          <Typography variant="caption" color="text.disabled" display="block" mb={2.5}>
            Reference: {ref}
          </Typography>
        )}

        <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => router.back()}
            sx={{ borderRadius: 1, textTransform: "none", fontWeight: 600 }}
          >
            Try Again
          </Button>
          <Button
            variant="text"
            fullWidth
            onClick={() => router.push("/lms/dashboard")}
            sx={{ borderRadius: 1, textTransform: "none" }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<CPageLoader />}>
      <CancelContent />
    </Suspense>
  );
}
