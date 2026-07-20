"use client"
import React, { useEffect, useState, useMemo } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Grid, Box, Typography, Checkbox, FormControlLabel, Paper, Divider } from "@mui/material"
import { toast } from "react-toastify"
import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CSelect from "@/components/form/CSelect"
import CCheckbox from "@/components/form/CCheckbox"
import { useGetRolesQuery } from "@/features/role/roleAPI"
import { useGetRoleProfilesQuery } from "@/features/role-profile/roleProfileAPI"
import { useCreateUserMutation } from "@/features/user/userAPI"
import { mapApiErrorsToFormik } from "@/utils/shared"
import CPageLoader from "@/components/ui/CPageLoader"

const userValidationSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  username: Yup.string().required("Username is required").max(50, "Username too long"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  phone_number: Yup.string().nullable(),
  timezone: Yup.string().required("Timezone is required"),
  is_active: Yup.boolean(),
  send_welcome_email: Yup.boolean(),
})

const ALLOWED_ROLE_NAMES = ["admin", "sales manager", "sales user"]

export default function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    formik.resetForm()
    setSelectedRoleIds([])
    setIsLockedByProfile(false)
  }

  const [create, { isLoading: isCreating }] = useCreateUserMutation()

  // Fetch roles and profiles
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery({ limit: 100 })
  const { data: profilesData, isLoading: isLoadingProfiles } = useGetRoleProfilesQuery({
    limit: 100,
  })

  // Restrict to only roles Sales Manager, Sales User, and Admin
  const roles = (rolesData?.data || []).filter(role =>
    ALLOWED_ROLE_NAMES.includes(role.name?.toLowerCase())
  )

  const profiles = useMemo(() => profilesData?.data || [], [profilesData?.data])

  const [selectedRoleIds, setSelectedRoleIds] = useState([])
  const [isLockedByProfile, setIsLockedByProfile] = useState(false)

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      phone_number: "",
      timezone: "UTC",
      is_active: true,
      role_profile_public_id: "",
      send_welcome_email: false,
    },
    validationSchema: userValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const payload = {
          first_name: values.first_name,
          last_name: values.last_name,
          username: values.username,
          email: values.email,
          password: values.password,
          phone_number: values.phone_number || null,
          timezone: values.timezone,
          is_active: values.is_active,
          role_profile_public_id: values.role_profile_public_id || "",
          role_public_ids: selectedRoleIds,
          send_welcome_email: values.send_welcome_email,
        }

        await create(payload).unwrap()
        toast.success("User created successfully")
        handleClose()
      } catch (error) {
        const formikErrors = mapApiErrorsToFormik(error)
        setErrors(formikErrors)
        toast.error(error?.data?.detail || error?.data?.message || "Operation failed")
      }
    },
  })

  // Watch for Role Profile changes
  useEffect(() => {
    const profilePublicId = formik.values.role_profile_public_id
    if (profilePublicId) {
      const selectedProfile = profiles.find(p => p.public_id === profilePublicId)
      if (selectedProfile) {
        const profileRoles = (selectedProfile.roles || [])
          .filter(r => ALLOWED_ROLE_NAMES.includes(r.name?.toLowerCase()))
          .map(r => r.public_id)
        setSelectedRoleIds(profileRoles)
        setIsLockedByProfile(true)
      }
    } else {
      setIsLockedByProfile(false)
      setSelectedRoleIds([])
    }
  }, [formik.values.role_profile_public_id, profiles])

  const handleToggleRole = rolePublicId => {
    if (isLockedByProfile) return
    setSelectedRoleIds(prev =>
      prev.includes(rolePublicId) ? prev.filter(id => id !== rolePublicId) : [...prev, rolePublicId]
    )
  }

  const profileOptions = [
    { label: "None (Manual Role Assignment)", value: "" },
    ...profiles.map(p => ({ label: p.name, value: p.public_id })),
  ]

  return (
    <CDialog
      resource="user"
      action="create"
      title="New User"
      btnProps={{ label: "New User", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
      maxWidth="sm"
    >
      <CForm
        onSubmit={formik.handleSubmit}
        dialog
        btnProps={{ loading: isCreating, action: "", label: "Create" }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <CTextField
              label="First Name"
              name="first_name"
              value={formik.values.first_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.first_name && Boolean(formik.errors.first_name)}
              helperText={formik.touched.first_name && formik.errors.first_name}
              required
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CTextField
              label="Last Name"
              name="last_name"
              value={formik.values.last_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.last_name && Boolean(formik.errors.last_name)}
              helperText={formik.touched.last_name && formik.errors.last_name}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CTextField
              label="Username"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CTextField
              label="Email Address"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Password"
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              required
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CTextField
              label="Phone Number"
              name="phone_number"
              value={formik.values.phone_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
              helperText={formik.touched.phone_number && formik.errors.phone_number}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CTextField
              label="Timezone"
              name="timezone"
              value={formik.values.timezone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.timezone && Boolean(formik.errors.timezone)}
              helperText={formik.touched.timezone && formik.errors.timezone}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CCheckbox
              label="Active"
              checked={formik.values.is_active}
              onChange={e => formik.setFieldValue("is_active", e.target.checked)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CCheckbox
              label="Send Welcome Email"
              checked={formik.values.send_welcome_email}
              onChange={e => formik.setFieldValue("send_welcome_email", e.target.checked)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CSelect
              label="Role Profile"
              name="role_profile_public_id"
              value={formik.values.role_profile_public_id}
              onChange={formik.handleChange}
              options={profileOptions}
            />
            {isLockedByProfile && (
              <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: "block" }}>
                * Roles are managed by the selected Role Profile and cannot be toggled manually.
              </Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Assign Roles:
            </Typography>
            {isLoadingRoles || isLoadingProfiles ? (
              <CPageLoader fullPage={false} />
            ) : roles.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No custom roles defined. Go to Roles tab to create one.
              </Typography>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  padding: 1,
                  bgcolor: isLockedByProfile ? "action.disabledBackground" : "background.paper",
                  borderRadius: 1,
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              >
                <Grid container spacing={1}>
                  {roles.map(role => {
                    const isChecked = selectedRoleIds.includes(role.public_id)
                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={role.public_id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              checked={isChecked}
                              disabled={isLockedByProfile}
                              onChange={() => handleToggleRole(role.public_id)}
                            />
                          }
                          label={
                            <Box sx={{ ml: 0.5 }}>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={isLockedByProfile ? "text.disabled" : "text.primary"}
                              >
                                {role.name}
                              </Typography>
                              {role.description && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  sx={{ lineHeight: 1.2 }}
                                >
                                  {role.description}
                                </Typography>
                              )}
                            </Box>
                          }
                          sx={{
                            width: "100%",
                            alignItems: "flex-start",
                            p: 0.5,
                            m: 0,
                            borderRadius: 1,
                            "&:hover": {
                              bgcolor: isLockedByProfile ? "transparent" : "action.hover",
                            },
                          }}
                        />
                      </Grid>
                    )
                  })}
                </Grid>
              </Paper>
            )}
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
  )
}
