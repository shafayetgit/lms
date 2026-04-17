"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  alpha,
} from "@mui/material";
import { Google, Person } from "@mui/icons-material";
import Link from "next/link";
import { motion } from "framer-motion";

import CTextField from "@/components/ui/CTextField";
import CPasswordField from "@/components/ui/CPasswordField";

import { useFormik } from "formik";
import { useSignInMutation } from "@/features/auth/authAPI";
import { signInSchema } from "@/schema/auth";

import { toast } from "react-toastify";
import { mapApiErrorsToFormik } from "@/utils/shared";
import CButton from "@/components/ui/CButton";
import { setAuthCookie } from "@/lib/auth/cookie";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter()
  const [signIn, { isLoading }] = useSignInMutation();

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: signInSchema,
    onSubmit: async (values, { setErrors }) => {
      try {
        const response = await signIn(values).unwrap();
        setAuthCookie(response)
        toast.success(
          response.message ||
          "Sign-in successful! Welcome back to your account.",
        );
        // Perform a hard redirect instead of router.push so global layouts like Topbar correctly re-hydrate their cookie state.
        window.location.href = '/';
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);

        if (error.status === 403) {
          toast.error(
            <div>
              <div>
                Your account is not verified. Please check your email for the
                verification link.
              </div>
              <CButton
                label="Verify Email"
                variant="outlined"
                component={Link}
                href={"/auth/verify-email?email=" + values.username}
                sx={{ mt: 1 }}

              />
            </div>,
          );
        } else {
          console.log(error)
          toast.error(
            error?.message || "Sign-in failed. Please try again.",
          );
        }
      }
    },
  });

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
          <Person sx={{ fontSize: 32, color: "white" }} />
        </Box>
      </Box>

      <Typography
        variant="h3"
        sx={{ fontWeight: 800, textAlign: "center", mb: 1 }}
      >
        Welcome Back
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ textAlign: "center", mb: 4 }}
      >
        Enter your credentials to access your account.
      </Typography>

      <form noValidate autoComplete="off" onSubmit={formik.handleSubmit}>
        <Stack spacing={3} sx={{ mb: 4 }}>
          <CTextField
            name="username"
            label="Username or Email"
            type="text" // allow both email and username
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.username && Boolean(formik.errors.username)
            }
            helperText={formik.touched.username && formik.errors.username}
          />

          <CPasswordField
            name="password"
            label="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.password && Boolean(formik.errors.password)
            }
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

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          color="secondary"
          sx={{
            py: 1.5,
            borderRadius: "50px",
            fontWeight: 700,
            mb: 3,
          }}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <Divider sx={{ mb: 3 }}>OR CONTINUE WITH</Divider>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button fullWidth variant="outlined" startIcon={<Google />}>
          Google
        </Button>
      </Stack>

      <Typography variant="body2" align="center">
        Don't have an account?{" "}
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
  );
}
