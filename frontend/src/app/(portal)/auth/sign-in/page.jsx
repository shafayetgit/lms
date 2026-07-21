"use client"

import React from "react"
import { Box, Typography, Button, Stack, Divider, alpha } from "@mui/material"
import { Google, Person } from "@mui/icons-material"
import Link from "next/link"
import { motion } from "framer-motion"

import CTextField from "@/components/form/CTextField"
import CPasswordField from "@/components/form/CPasswordField"
import AuthLogo from "@/components/ui/AuthLogo"

import { useFormik } from "formik"
import { useSignInMutation } from "@/features/auth/authAPI"
import { signInSchema } from "@/schema/auth"

import { toast } from "react-toastify"
import { mapApiErrorsToFormik } from "@/utils/shared"
import CButton from "@/components/ui/CButton"
import { setAuthCookie } from "@/lib/auth/cookie"
import { useRouter, useSearchParams } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("next") || "/"
  const [signIn, { isLoading }] = useSignInMutation()

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: signInSchema,
    onSubmit: async (values, { setErrors }) => {
      try {
        const response = await signIn(values).unwrap()
        setAuthCookie(response)
        toast.success(response.message || "Sign-in successful! Welcome back to your account.")
        window.location.href = redirectUrl
        router.push(redirectUrl)
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)

        if (error.status === 403) {
          toast.error(
            <div>
              <div>
                Your account is not verified. Please check your email for the verification link.
              </div>
              <CButton
                label="Verify Email"
                variant="outlined"
                component={Link}
                href={"/auth/verify-email?email=" + values.username}
                sx={{ mt: 1, borderRadius: 1 }}
              />
            </div>
          )
        } else {
          toast.error(error?.data?.message || "Sign-in failed. Please try again.")
        }
      }
    },
  })

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

      <Typography variant="h4" sx={{ fontWeight: 800, textAlign: "center", mb: 0.5 }}>
        Welcome Back
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 3 }}>
        Enter your credentials to access your account.
      </Typography>

      <form noValidate autoComplete="off" onSubmit={formik.handleSubmit}>
        <Stack spacing={2.5} sx={{ mb: 3 }}>
          <CTextField
            name="username"
            label="Username or Email"
            type="text" // allow both email and username
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />

          <CPasswordField
            name="password"
            label="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Typography
              component={Link}
              href="/auth/forgot-password"
              variant="body2"
              sx={{
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Forgot Password?
            </Typography>
          </Box>
        </Stack>

        <CButton
          type="submit"
          fullWidth
          size="large"
          loading={isLoading}
          disabled={isLoading}
          color="secondary"
          action="sign-in"
          label={isLoading ? "Signing in..." : "Sign In"}
          sx={{
            py: 1.2,
            borderRadius: 1,
            fontWeight: 700,
            mb: 2.5,
          }}
        />
      </form>

      <Divider sx={{ mb: 2.5 }}>OR CONTINUE WITH</Divider>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button fullWidth variant="outlined" startIcon={<Google />} sx={{ borderRadius: 1, py: 1 }}>
          Google
        </Button>
      </Stack>

      <Typography variant="body2" align="center">
        Don&apos;t have an account?{" "}
        <Typography
          component={Link}
          href="/auth/sign-up"
          sx={{
            fontWeight: 700,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Sign up here
        </Typography>
      </Typography>
    </Box>
  )
}
