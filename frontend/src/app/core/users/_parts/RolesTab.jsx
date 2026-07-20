import React, { useState, useEffect, useMemo } from "react"
import { useFormik } from "formik"
import { Box, Typography, Grid, Checkbox, Stack, Button, Card, CardContent } from "@mui/material"
import { ShieldOutlined } from "@mui/icons-material"
import { toast } from "react-toastify"
import CSelect from "@/components/form/CSelect"
import CForm from "@/components/ui/CForm"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import { useGetRolesQuery } from "@/features/role/roleAPI"
import { useGetRoleProfilesQuery } from "@/features/role-profile/roleProfileAPI"
import { useGetUserQuery, useUpdateUserMutation } from "@/features/user/userAPI"
import { mapApiErrorsToFormik } from "@/utils/shared"

export default function RolesTab({ userId }) {
  const {
    data: userResponse,
    isLoading: isLoadingUser,
    isError,
  } = useGetUserQuery(userId, { skip: !userId })
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery({ limit: 100 })
  const { data: profilesData, isLoading: isLoadingProfiles } = useGetRoleProfilesQuery({
    limit: 100,
  })
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()

  const user = userResponse?.data

  // Show all roles returned by the API
  const roles = rolesData?.data || []

  const profiles = useMemo(() => profilesData?.data || [], [profilesData?.data])

  const [selectedRoleIds, setSelectedRoleIds] = useState([])
  const [isLockedByProfile, setIsLockedByProfile] = useState(false)

  const formik = useFormik({
    initialValues: {
      role_profile_public_id: "",
    },
    onSubmit: async (values, { setErrors }) => {
      try {
        const payload = {
          publicId: userId,
          role_profile_public_id: values.role_profile_public_id || "",
          role_public_ids: selectedRoleIds,
        }

        await updateUser(payload).unwrap()
        toast.success("Roles updated successfully")
      } catch (error) {
        const formikErrors = mapApiErrorsToFormik(error)
        setErrors(formikErrors)
        toast.error(error?.data?.detail || error?.data?.message || "Failed to update roles")
      }
    },
  })

  const { setValues } = formik

  useEffect(() => {
    const profilePublicId = formik.values.role_profile_public_id
    if (profilePublicId) {
      const selectedProfile = profiles.find(p => p.public_id === profilePublicId)
      if (selectedProfile) {
        const profileRoles = (selectedProfile.roles || []).map(r => r.public_id)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedRoleIds(profileRoles)
        setIsLockedByProfile(true)
      }
    } else {
      setIsLockedByProfile(false)
      if (user) {
        const userRoles = (user.roles || []).map(r => r.public_id)
        setSelectedRoleIds(userRoles)
      }
    }
  }, [formik.values.role_profile_public_id, profiles, user])

  useEffect(() => {
    if (user) {
      setValues({
        role_profile_public_id: user.role_profile?.public_id || "",
      })
      const userRoles = (user.roles || []).map(r => r.public_id)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRoleIds(userRoles)
      setIsLockedByProfile(Boolean(user.role_profile))
    }
  }, [user, setValues])

  const handleToggleRole = rolePublicId => {
    if (isLockedByProfile) return
    setSelectedRoleIds(prev =>
      prev.includes(rolePublicId)
        ? prev.filter(roleId => roleId !== rolePublicId)
        : [...prev, rolePublicId]
    )
  }

  const handleSelectAllRoles = () => {
    if (isLockedByProfile) return
    const allRoleIds = roles.map(r => r.public_id)
    setSelectedRoleIds(allRoleIds)
  }

  const handleUnselectAllRoles = () => {
    if (isLockedByProfile) return
    setSelectedRoleIds([])
  }

  if (isLoadingUser) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  const profileOptions = [
    { label: "None (Manual Role Assignment)", value: "" },
    ...profiles.map(p => ({ label: p.name, value: p.public_id })),
  ]

  return (
    <CForm
      onSubmit={formik.handleSubmit}
      width="100%"
      sx={{ maxWidth: 900 }}
      btnProps={{
        label: "Save",
        loading: isUpdating,
        action: "",
      }}
    >
      {/* Profile Assignment Select Dropdown */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CSelect
            label="Role Profile"
            name="role_profile_public_id"
            value={formik.values.role_profile_public_id}
            onChange={formik.handleChange}
            options={profileOptions}
            disabled={isLoadingProfiles}
          />
        </Grid>
      </Grid>

      {/* Checkbox helpers */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }} alignItems="center">
        <Button
          size="small"
          onClick={handleSelectAllRoles}
          disabled={isLockedByProfile}
          variant="outlined"
          sx={{
            textTransform: "none",
            fontSize: "11px",
            borderColor: "divider",
            color: "text.primary",
            "&:hover": { borderColor: "text.primary" },
          }}
        >
          Select All
        </Button>
        <Button
          size="small"
          onClick={handleUnselectAllRoles}
          disabled={isLockedByProfile}
          variant="outlined"
          sx={{
            textTransform: "none",
            fontSize: "11px",
            borderColor: "divider",
            color: "text.primary",
            "&:hover": { borderColor: "text.primary" },
          }}
        >
          Unselect All
        </Button>
      </Stack>

      {isLoadingRoles || isLoadingProfiles ? (
        <CPageLoader fullPage={false} />
      ) : roles.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No custom roles defined.
        </Typography>
      ) : (
        <Box>
          <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }}>
            {[...roles]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(role => {
                const isChecked = selectedRoleIds.includes(role.public_id)
                return (
                  <Grid key={role.public_id} size={{ xs: 4, sm: 4, md: 6 }}>
                    <Card
                      elevation={0}
                      onClick={() => handleToggleRole(role.public_id)}
                      sx={{
                        height: "100%",
                        cursor: isLockedByProfile ? "not-allowed" : "pointer",
                        opacity: isLockedByProfile ? 0.75 : 1,
                        border: "1px solid",
                        borderColor: isChecked ? "primary.main" : "divider",
                        bgcolor: isChecked ? "action.hover" : "background.paper",
                        transition: "all 0.2s ease-in-out",
                        position: "relative",
                        overflow: "visible",
                        "&:hover": {
                          borderColor: isLockedByProfile
                            ? isChecked
                              ? "primary.main"
                              : "divider"
                            : isChecked
                              ? "primary.main"
                              : "text.secondary",
                          boxShadow: isLockedByProfile
                            ? "none"
                            : "0px 4px 20px rgba(0, 0, 0, 0.05)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="flex-start"
                          justifyContent="space-between"
                        >
                          <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: 1.5,
                                bgcolor: isChecked ? "primary.light" : "action.selected",
                                color: isChecked ? "primary.contrastText" : "text.secondary",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ShieldOutlined fontSize="small" />
                            </Box>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                color="text.primary"
                                sx={{ textTransform: "capitalize" }}
                              >
                                {role.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5, fontSize: "12px", lineHeight: 1.4 }}
                              >
                                {role.description || "No description provided."}
                              </Typography>
                            </Box>
                          </Stack>
                          <Checkbox
                            size="small"
                            checked={isChecked}
                            disabled={isLockedByProfile}
                            onChange={e => {
                              e.stopPropagation()
                              handleToggleRole(role.public_id)
                            }}
                            onClick={e => e.stopPropagation()}
                            sx={{
                              color: "text.secondary",
                              "&.Mui-checked": {
                                color: "primary.main",
                              },
                            }}
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
          </Grid>
        </Box>
      )}
    </CForm>
  )
}
