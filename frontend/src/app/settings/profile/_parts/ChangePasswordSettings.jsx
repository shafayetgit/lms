"use client"
import React, { useState } from "react"
import { Box, Stack, Alert } from "@mui/material"
import { toast } from "react-toastify"
import { useFormik } from "formik"
import { useChangePasswordMutation } from "@/features/auth/authAPI"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import { changePasswordSchema } from "@/schema/profile"

export default function ChangePasswordSettings() {
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const [error, setError] = useState(null)

  const formik = useFormik({
    initialValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    validationSchema: changePasswordSchema,
    onSubmit: async (values, { resetForm }) => {
      setError(null)
      try {
        await changePassword({
          current_password: values.current_password,
          new_password: values.new_password,
        }).unwrap()

        toast.success("Password changed successfully")
        resetForm()
      } catch (err) {
        setError(err?.data?.message || err?.data?.detail || "Failed to change password")
      }
    },
  })

  return (
    <Box sx={{ maxWidth: 500 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <CForm
        onSubmit={formik.handleSubmit}
        btnProps={{
          label: "Change",
          action: "",
          loading: isLoading,
        }}
      >
        <Stack spacing={2.5}>
          <CTextField
            label="Current Password"
            name="current_password"
            type="password"
            value={formik.values.current_password}
            onChange={formik.handleChange}
            error={formik.touched.current_password && Boolean(formik.errors.current_password)}
            helperText={formik.touched.current_password && formik.errors.current_password}
            fullWidth
            required
          />
          <CTextField
            label="New Password"
            name="new_password"
            type="password"
            value={formik.values.new_password}
            onChange={formik.handleChange}
            error={formik.touched.new_password && Boolean(formik.errors.new_password)}
            helperText={formik.touched.new_password && formik.errors.new_password}
            fullWidth
            required
          />
          <CTextField
            label="Confirm New Password"
            name="confirm_password"
            type="password"
            value={formik.values.confirm_password}
            onChange={formik.handleChange}
            error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
            helperText={formik.touched.confirm_password && formik.errors.confirm_password}
            fullWidth
            required
          />
        </Stack>
      </CForm>
    </Box>
  )
}
