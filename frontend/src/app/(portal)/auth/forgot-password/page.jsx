"use client"

import React from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Box, Typography, Divider, Stack, alpha } from "@mui/material"
import { motion } from "framer-motion"
import { LockOutlined, ArrowBack } from "@mui/icons-material"
import { toast } from "react-toastify"
import Link from "next/link"
import { useRouter } from "next/navigation"

import CTextField from "@/components/form/CTextField"
import CButton from "@/components/ui/CButton"
import AuthLogo from "@/components/ui/AuthLogo"

import { useForgotPasswordMutation } from "@/features/auth/authAPI"

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const ForgotPassword = () => {
  const router = useRouter()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Please enter a valid email address").required("Email is required"),
    }),
    onSubmit: async values => {
      try {
        const response = await forgotPassword(values).unwrap()
        toast.success(response.message || "Password reset link sent to your email!")
        router.push("/auth/sign-in")
      } catch (error) {
        toast.error(error?.data?.message || "Failed to send reset link. Please try again.")
      }
    },
  })

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
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
      {/* Header Icon & Title */}
      <Box textAlign="center" mb={3}>
        <motion.div variants={itemVariants}>
          <AuthLogo />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              letterSpacing: "-0.5px",
              color: "text.primary",
              mb: 0.5,
            }}
          >
            Forgot Password?
          </Typography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography variant="body2" color="text.secondary" px={2} lineHeight={1.5}>
            Enter your registered email address and we&apos;re sending you instructions to reset
            your password.
          </Typography>
        </motion.div>
      </Box>

      {/* Form Container */}
      <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ px: { xs: 0, sm: 2 } }}>
        <Stack spacing={2.5}>
          <motion.div variants={itemVariants}>
            <CTextField
              label="Email Address"
              name="email"
              placeholder="e.g. john@example.com"
              fullWidth
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  backgroundColor: theme =>
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.02)
                      : alpha(theme.palette.common.black, 0.01),
                },
              }}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CButton
              type="submit"
              label="Send Reset Link"
              fullWidth
              size="large"
              color="secondary"
              loading={isLoading}
              disabled={isLoading || !formik.isValid || !formik.dirty}
              action="send"
              sx={{
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
          </motion.div>
        </Stack>
      </Box>

      <motion.div variants={itemVariants}>
        <Divider sx={{ my: 2.5, borderColor: "divider", opacity: 0.6 }} />
      </motion.div>

      {/* Footer Actions */}
      <motion.div variants={itemVariants}>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
          <ArrowBack sx={{ fontSize: 18, color: "text.secondary" }} />
          <Link href="/auth/sign-in" style={{ textDecoration: "none" }}>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{
                color: "primary.main",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Back to Sign In
            </Typography>
          </Link>
        </Stack>
      </motion.div>
    </Box>
  )
}

export default ForgotPassword
