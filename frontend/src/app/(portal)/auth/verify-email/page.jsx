"use client"

import { useFormik } from "formik"
import * as Yup from "yup"
import { Box, Typography, Divider, alpha } from "@mui/material"
import { MarkEmailRead } from "@mui/icons-material"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import OtpInput, { OTP_LENGTH } from "./_components/OtpInput"
import ResendButton from "./_components/ResendButton"
import { useResendOTPMutation, useVerifyEmailMutation } from "@/features/auth/authAPI"
import CButton from "@/components/ui/CButton"

const VerifyEmail = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation()
  const [resendOtp, { isLoading: isLoadingResendOTP }] = useResendOTPMutation()

  const email = searchParams.get("email")

  const formik = useFormik({
    initialValues: { otp: "" },
    validationSchema: Yup.object({
      otp: Yup.string()
        .length(OTP_LENGTH, `Code must be ${OTP_LENGTH} digits`)
        .required("OTP is required"),
    }),
    onSubmit: async ({ otp }) => {
      try {
        const response = await verifyEmail({ otp, email }).unwrap()
        const nextUrl = searchParams.get("next") || "/auth/sign-in"
        toast.success(response?.data?.message || "Email verified successfully")
        router.push(nextUrl)
      } catch (error) {
        toast.error(error?.data?.message || "Something went wrong")
        const apiErrors = error?.data?.errors
        if (apiErrors) {
          const formattedErrors = {}
          Object.keys(apiErrors).forEach(field => {
            formattedErrors[field] = apiErrors[field][0]
          })
          formik.setErrors(formattedErrors)
        }
      }
    },
  })

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email is missing. Cannot resend OTP.")
      return
    }
    try {
      const response = await resendOtp({ email }).unwrap()
      toast.success(response?.data?.message || "OTP resent successfully")
    } catch (error) {
      console.error("Resend OTP error:", error)
      toast.error(error?.data?.message || "Failed to resend OTP")
    }
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      sx={{
        bgcolor: "background.paper",
        p: { xs: 4, md: 6 },
        borderRadius: 6,
        boxShadow: (theme) => `0 12px 40px ${alpha(theme.palette.text.primary, 0.08)}`,
        border: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.04)}`,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "secondary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: (theme) =>
              `0 8px 24px ${alpha(theme.palette.secondary.main, 0.3)}`,
          }}
        >
          <MarkEmailRead sx={{ fontSize: 32, color: "white" }} />
        </Box>
      </Box>

      <Typography
        fontWeight={800}
        textAlign="center"
        gutterBottom
        sx={{
          fontSize: "clamp(1.25rem, 5vw, 1.75rem)",
          letterSpacing: "-0.5px",
          color: "text.primary",
        }}
      >
        Verify your email
      </Typography>

      <Typography
        color="text.secondary"
        textAlign="center"
        mb={4}
        sx={{ fontSize: "clamp(0.8125rem, 3vw, 0.875rem)" }}
      >
        We sent a {OTP_LENGTH}-digit code to{" "}
        <Typography
          component="span"
          fontWeight={700}
          color="text.primary"
          sx={{
            fontSize: "clamp(0.8125rem, 3vw, 0.875rem)",
            wordBreak: "break-all",
          }}
        >
          {email}
        </Typography>
      </Typography>

      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <OtpInput
          onChange={val => formik.setFieldValue("otp", val)}
          error={formik.touched.otp && Boolean(formik.errors.otp)}
        />

        {formik.touched.otp && formik.errors.otp && (
          <Typography variant="caption" color="error" display="block" mb={2} textAlign="center">
            {formik.errors.otp}
          </Typography>
        )}

        <CButton
          type="submit"
          label="Verify email"
          fullWidth
          size="large"
          color="secondary"
          loading={isLoading}
          disabled={isLoading || formik.values.otp.length < OTP_LENGTH}
          sx={{
            mb: 2,
            py: 1.8,
            borderRadius: 3.5,
            fontSize: "1rem",
            fontWeight: 700,
            boxShadow: (theme) =>
              `0 6px 20px ${alpha(theme.palette.secondary.main, 0.35)}`,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: (theme) =>
                `0 8px 25px ${alpha(theme.palette.secondary.main, 0.4)}`,
            },
          }}
        />

        <ResendButton onResend={handleResendOtp} isLoading={isLoadingResendOTP} />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography textAlign="center" variant="body2">
        Back to{" "}
        <Link href="/auth/sign-in" style={{ textDecoration: "none" }}>
          <Typography
            component="span"
            color="primary.main"
            fontWeight={700}
            sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          >
            Sign in
          </Typography>
        </Link>
      </Typography>
    </Box>
  )
}

export default VerifyEmail