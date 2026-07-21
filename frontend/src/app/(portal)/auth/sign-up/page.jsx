"use client"

import React from "react"
import CTextField from "@/components/form/CTextField"

import { Box, Typography, Button, Stack, Divider, alpha } from "@mui/material"
import { Google, Person, PersonAddOutlined } from "@mui/icons-material"
import Link from "next/link"
import { motion } from "framer-motion"
import { useFormik } from "formik"

import { signUpSchema } from "@/schema/auth"
import CButton from "@/components/ui/CButton"
import CPasswordField from "@/components/form/CPasswordField"
import AuthLogo from "@/components/ui/AuthLogo"
import { useSignUpMutation } from "@/features/auth/authAPI"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { mapApiErrorsToFormik } from "@/utils/shared"
import { ROUTES } from "@/lib/constants"

export default function Page() {
  const router = useRouter()
  const [signUp, { isLoading }] = useSignUpMutation()

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: signUpSchema,
    onSubmit: async (values, { setErrors }) => {
      try {
        const response = await signUp(values).unwrap()

        toast.success(
          response.message || "Signup successful! Please check your email to verify your account."
        )
        router.push("/auth/verify-email?email=" + values.email)
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)

        toast.error(error?.data?.message || "Signup failed. Please try again.")
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
        maxWidth: 450,
        mx: "auto",
      }}
    >
      <AuthLogo />

      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "text.primary",
          textAlign: "center",
          mb: 0.5,
        }}
      >
        Create an Account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 3 }}>
        Join ecoFin Institute and accelerate your career.
      </Typography>

      <form noValidate autoComplete="off" onSubmit={formik.handleSubmit}>
        <Stack spacing={2.5} sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <CTextField
              fullWidth
              id="first_name"
              name="first_name"
              label="First Name"
              variant="outlined"
              value={formik.values.first_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.first_name && Boolean(formik.errors.first_name)}
              helperText={formik.touched.first_name && formik.errors.first_name}
              required
            />
            <CTextField
              fullWidth
              id="last_name"
              name="last_name"
              label="Last Name"
              variant="outlined"
              value={formik.values.last_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.last_name && Boolean(formik.errors.last_name)}
              helperText={formik.touched.last_name && formik.errors.last_name}
              required
            />
          </Box>

          <CTextField
            fullWidth
            id="username"
            name="username"
            label="Username"
            variant="outlined"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
            required
          />

          <CTextField
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            variant="outlined"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            required
          />

          <CPasswordField
            id="password"
            name="password"
            label="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            required
            showStrengthIndicator
            showRequirements
          />

          <CPasswordField
            id="confirm_password"
            name="confirm_password"
            label="Confirm Password"
            value={formik.values.confirm_password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
            helperText={formik.touched.confirm_password && formik.errors.confirm_password}
            required
          />
        </Stack>

        <CButton
          label={isLoading ? "Signing Up..." : "Sign Up"}
          disabled={isLoading}
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          color="secondary"
          action="sign-up"
          sx={{
            py: 1.2,
            borderRadius: 1,
            fontWeight: 700,
            fontSize: "1rem",
            transition: "all 0.3s ease",
            mb: 2.5,
          }}
        />
      </form>

      <Divider
        sx={{
          mb: 2.5,
          color: "text.secondary",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        OR CONTINUE WITH
      </Divider>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google />}
          sx={{
            py: 1,
            borderRadius: 1,
            fontWeight: 600,
            color: "text.primary",
            borderColor: theme => alpha(theme.palette.text.primary, 0.15),
            "&:hover": {
              borderColor: "text.primary",
              bgcolor: theme => alpha(theme.palette.text.primary, 0.02),
            },
          }}
        >
          Google
        </Button>
      </Stack>

      <Typography variant="body2" align="center" color="text.secondary">
        Already have an account?{" "}
        <Typography
          component={Link}
          href={ROUTES.portal.signIn.path}
          variant="body2"
          sx={{
            color: "text.primary",
            fontWeight: 700,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Sign in here
        </Typography>
      </Typography>
    </Box>
  )
}
