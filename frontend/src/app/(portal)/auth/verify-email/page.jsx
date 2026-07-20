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
import AuthLogo from "@/components/ui/AuthLogo"

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
        p: { xs: 3, md: 4 },
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        maxWidth: 420,
        mx: "auto",
      }}
    >
      <AuthLogo />

      <Typography
        fontWeight={800}
        textAlign="center"
        gutterBottom
        sx={{
          fontSize: "1.5rem",
          letterSpacing: "-0.5px",
          color: "text.primary",
          mb: 0.5,
        }}
      >
        Verify your email
      </Typography>

      <Typography
        color="text.secondary"
        textAlign="center"
        mb={3}
        sx={{ fontSize: "0.875rem" }}
      >
        We sent a {OTP_LENGTH}-digit code to{" "}
        <Typography
          component="span"
          fontWeight={700}
          color="text.primary"
          sx={{
            fontSize: "0.875rem",
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
          action="confirm"
          sx={{
            mb: 2,
            py: 1.2,
            borderRadius: 1,
            fontSize: "1rem",
            fontWeight: 700,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
            },
          }}
        />

        <ResendButton onResend={handleResendOtp} isLoading={isLoadingResendOTP} />
      </Box>

      <Divider sx={{ my: 2.5 }} />

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