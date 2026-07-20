import React, { useState } from "react"
import { useFormik } from "formik"
import {
  Box,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  IconButton,
} from "@mui/material"
import { ExpandMore, Visibility, VisibilityOff } from "@mui/icons-material"
import { toast } from "react-toastify"
import CTextField from "@/components/form/CTextField"
import CCheckbox from "@/components/form/CCheckbox"
import CForm from "@/components/ui/CForm"
import { useUpdateUserMutation } from "@/features/user/userAPI"
import { mapApiErrorsToFormik } from "@/utils/shared"

export default function SettingsTab({ userId }) {
  const [updateUser, { isLoading: isPasswordUpdating }] = useUpdateUserMutation()
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik({
    initialValues: {
      new_password: "",
      logout_all_devices: true,
    },
    onSubmit: async (values, { setErrors, resetForm }) => {
      if (!values.new_password) {
        toast.error("Please enter a new password")
        return
      }
      if (values.new_password.length < 8) {
        toast.error("Password must be at least 8 characters long")
        return
      }
      try {
        await updateUser({
          publicId: userId,
          password: values.new_password,
          logout_all_devices: values.logout_all_devices,
        }).unwrap()
        toast.success("Password updated successfully")
        resetForm()
      } catch (err) {
        const formikErrors = mapApiErrorsToFormik(err)
        setErrors(formikErrors)
        toast.error(err?.data?.detail || err?.data?.message || "Failed to update password")
      }
    },
  })

  return (
    <Box sx={{ maxWidth: 900 }}>
      <CForm
        onSubmit={formik.handleSubmit}
        width="100%"
        btnProps={{
          label: "Save",
          action: "",
          loading: isPasswordUpdating,
        }}
      >
        <Accordion
          defaultExpanded
          elevation={0}
          sx={{
            bgcolor: "transparent",
            backgroundImage: "none",
            "&:before": { display: "none" },
            border: "none",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore sx={{ color: "text.primary" }} />}
            sx={{
              p: 0,
              minHeight: 0,
              "& .MuiAccordionSummary-content": { m: 0 },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Change Password
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CTextField
                  label="Set New Password"
                  name="new_password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.new_password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.new_password && Boolean(formik.errors.new_password)}
                  helperText={formik.touched.new_password && formik.errors.new_password}
                  placeholder="Enter new password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: "text.secondary" }}
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
              <CCheckbox
                label="Logout From All Devices After Changing Password"
                checked={formik.values.logout_all_devices}
                onChange={e => formik.setFieldValue("logout_all_devices", e.target.checked)}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </CForm>
    </Box>
  )
}
