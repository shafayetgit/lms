"use client";

import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Box, Typography, Divider, Stack, alpha } from "@mui/material";
import { motion } from "framer-motion";
import { LockOutlined, ArrowBack } from "@mui/icons-material";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";

import CTextField from "@/components/ui/CTextField";
import CButton from "@/components/ui/CButton";

import { useForgotPasswordMutation } from "@/features/auth/authAPI";

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
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const ForgotPassword = () => {
  const router = useRouter();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Please enter a valid email address")
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await forgotPassword(values).unwrap();
        toast.success(
          response.message || "Password reset link sent to your email!",
        );
        router.push("/auth/sign-in");
      } catch (error) {
        toast.error(
          error?.data?.message ||
          "Failed to send reset link. Please try again.",
        );
      }
    },
  });

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        bgcolor: "background.paper",
        p: { xs: 4, md: 6 },
        borderRadius: 6,
        boxShadow: (theme) => `0 12px 40px ${alpha(theme.palette.text.primary, 0.08)}`,
        border: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.04)}`,
      }}
    >
      {/* Header Icon & Title */}
      <Box textAlign="center" mb={4}>
        <motion.div variants={itemVariants}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "secondary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: (theme) =>
                `0 8px 24px ${alpha(theme.palette.secondary.main, 0.3)}`, // Modern shadow
            }}
          >
            <LockOutlined sx={{ fontSize: 32, color: "white" }} />
          </Box>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              letterSpacing: "-0.5px",
              color: "text.primary",
              mb: 1.5,
            }}
          >
            Forgot Password?
          </Typography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography
            variant="body1"
            color="text.secondary"
            px={2}
            lineHeight={1.6}
          >
            Enter your registered email address and we're sending you
            instructions to reset your password.
          </Typography>
        </motion.div>
      </Box>

      {/* Form Container */}
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        noValidate
        sx={{ px: { xs: 0, sm: 2 } }}
      >
        <Stack spacing={3.5}>
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
                  borderRadius: 3.5,
                  backgroundColor: (theme) =>
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
              sx={{
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
          </motion.div>
        </Stack>
      </Box>

      <motion.div variants={itemVariants}>
        <Divider sx={{ my: 4.5, borderColor: "divider", opacity: 0.6 }} />
      </motion.div>

      {/* Footer Actions */}
      <motion.div variants={itemVariants}>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
        >
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
  );
};

export default ForgotPassword;
