import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Grid,
  Switch,
  Stack,
  Button,
  Card,
  CardContent,
  Paper,
} from "@mui/material"
import { toast } from "react-toastify"
import { FlagOutlined } from "@mui/icons-material"
import CForm from "@/components/ui/CForm"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import { useGetFeatureFlagsQuery } from "@/features/feature-flag/featureFlagAPI"
import { useGetUserQuery, useUpdateUserMutation } from "@/features/user/userAPI"
import { mapApiErrorsToFormik } from "@/utils/shared"
import { useFormik } from "formik"

export default function FeatureFlagsTab({ userId }) {
  const {
    data: userResponse,
    isLoading: isLoadingUser,
    isError,
  } = useGetUserQuery(userId, { skip: !userId })

  const { data: flagsData, isLoading: isLoadingFlags } = useGetFeatureFlagsQuery({ limit: 100 })
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()

  const user = userResponse?.data
  const flags = flagsData?.data || []

  const [selectedFlagIds, setSelectedFlagIds] = useState([])

  const formik = useFormik({
    initialValues: {},
    onSubmit: async (values, { setErrors }) => {
      try {
        const payload = {
          publicId: userId,
          feature_flag_public_ids: selectedFlagIds,
        }

        await updateUser(payload).unwrap()
        toast.success("Feature Flags updated successfully")
      } catch (error) {
        const formikErrors = mapApiErrorsToFormik(error)
        setErrors(formikErrors)
        toast.error(error?.data?.detail || error?.data?.message || "Failed to update feature flags")
      }
    },
  })

  useEffect(() => {
    if (user) {
      const userFlags = (user.feature_flags || []).map(f => f.public_id)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFlagIds(userFlags)
    }
  }, [user])

  const handleToggleFlag = flagPublicId => {
    setSelectedFlagIds(prev =>
      prev.includes(flagPublicId)
        ? prev.filter(flagId => flagId !== flagPublicId)
        : [...prev, flagPublicId]
    )
  }

  const handleSelectAll = () => {
    const allFlagIds = flags.map(f => f.public_id)
    setSelectedFlagIds(allFlagIds)
  }

  const handleUnselectAll = () => {
    setSelectedFlagIds([])
  }

  if (isLoadingUser || isLoadingFlags) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

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
      {/* Checkbox helpers */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }} alignItems="center">
        <Button
          size="small"
          onClick={handleSelectAll}
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
          onClick={handleUnselectAll}
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

      {flags.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No feature flags have been defined yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }}>
          {[...flags]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(flag => {
              const isChecked = selectedFlagIds.includes(flag.public_id)
              return (
                <Grid key={flag.public_id} size={{ xs: 6, sm: 4, md: 4 }}>
                  <Card
                    elevation={0}
                    onClick={() => handleToggleFlag(flag.public_id)}
                    sx={{
                      height: "100%",
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: isChecked ? "primary.main" : "divider",
                      bgcolor: isChecked ? "action.hover" : "background.paper",
                      transition: "all 0.2s ease-in-out",
                      position: "relative",
                      overflow: "visible",
                      "&:hover": {
                        borderColor: isChecked ? "primary.main" : "text.secondary",
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
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
                            <FlagOutlined fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                              {flag.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5, fontSize: "12px", lineHeight: 1.4 }}
                            >
                              {flag.description || "No description provided."}
                            </Typography>
                          </Box>
                        </Stack>
                        <Switch
                          size="small"
                          checked={isChecked}
                          onChange={e => {
                            e.stopPropagation()
                            handleToggleFlag(flag.public_id)
                          }}
                          onClick={e => e.stopPropagation()}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
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
      )}
    </CForm>
  )
}
