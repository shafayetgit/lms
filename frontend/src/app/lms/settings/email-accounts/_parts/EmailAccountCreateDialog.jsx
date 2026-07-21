"use client"
import React, { useState } from "react"
import {
  Box,
  Typography,
  Stack,
  Avatar,
  Alert,
  Divider,
  FormControlLabel,
  Checkbox,
  alpha,
  useTheme,
} from "@mui/material"
import Grid from "@mui/material/Grid"
import { InfoOutlined } from "@mui/icons-material"
import { toast } from "react-toastify"
import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CSectionTitle from "@/components/ui/CSectionTitle"
import Image from "next/image"
import {
  EMAIL_SERVICES,
  SERVICE_COLORS,
  SERVICE_INITIALS,
  SERVICE_IMAGES,
  PROVIDER_FIELDS,
  INCOMING_OUTGOING_FIELDS,
  validateAccountForm,
} from "../emailConfig"
import { useCreateEmailAccountMutation } from "@/features/shared/emailAccountAPI"

const DEFAULT_VALUES = {
  email_account_name: "",
  email_id: "",
  password: "",
  enable_incoming: false,
  enable_outgoing: false,
  default_incoming: false,
  default_outgoing: false,
}

export default function EmailAccountCreateDialog({ open, handleCDialogClose }) {
  const theme = useTheme()
  const [selected, setSelected] = useState(null)
  const [values, setValues] = useState(DEFAULT_VALUES)
  const [errors, setErrors] = useState({})
  const [createAccount, { isLoading }] = useCreateEmailAccountMutation()

  function handleSelect(service) {
    setSelected(service)
    setValues({ ...DEFAULT_VALUES, service: service.name })
    setErrors({})
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setValues(v => ({ ...v, [name]: type === "checkbox" ? checked : value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selected) {
      toast.warning("Please select a provider first.")
      return
    }

    const errs = validateAccountForm(values)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    try {
      await createAccount({ ...values, service: selected.name }).unwrap()
      toast.success("Email account created successfully")
      handleCDialogClose()
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.detail || "Failed to create email account")
    }
  }

  return (
    <CDialog
      resource="email_account"
      action="create"
      title="Setup Email Account"
      open={open}
      handleCDialogClose={handleCDialogClose}
      maxWidth="sm"
    >
      <Box sx={{ mt: 1 }}>
        {/* Provider selection grid */}
        <Box sx={{ mb: 3 }}>
          <CSectionTitle>Select Provider</CSectionTitle>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {EMAIL_SERVICES.map(service => {
              const isSelected = selected?.name === service.name
              const sColor = SERVICE_COLORS[service.name] || "#607D8B"
              const sInitials = SERVICE_INITIALS[service.name] || "?"
              const sImage = SERVICE_IMAGES[service.name]
              return (
                <Box
                  key={service.name}
                  onClick={() => handleSelect(service)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.75,
                    py: 1.5,
                    px: 1,
                    cursor: "pointer",
                    borderRadius: 2,
                    border: "1.5px solid",
                    borderColor: isSelected ? sColor : "divider",
                    bgcolor: isSelected ? alpha(sColor, 0.06) : "transparent",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: sColor, bgcolor: alpha(sColor, 0.04) },
                    minWidth: 80,
                  }}
                >
                  {sImage ? (
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        bgcolor: "white",
                        overflow: "hidden",
                        p: 0.5,
                      }}
                    >
                      <Image
                        src={sImage}
                        alt={service.label}
                        width={16}
                        height={16}
                        style={{ objectFit: "contain" }}
                      />
                    </Box>
                  ) : (
                    <Avatar
                      sx={{
                        width: 26,
                        height: 26,
                        bgcolor: sColor,
                        fontSize: "0.6rem",
                        fontWeight: 700,
                      }}
                    >
                      {sInitials}
                    </Avatar>
                  )}
                  <Typography
                    variant="caption"
                    fontWeight={isSelected ? 700 : 500}
                    color={isSelected ? sColor : "text.primary"}
                    noWrap
                  >
                    {service.label}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        </Box>

        {/* Provider form */}
        {selected && (
          <CForm
            onSubmit={handleSubmit}
            dialog
            btnProps={{
              loading: isLoading,
              label: "Create",
              action: "",
            }}
          >
            {/* Info banner */}
            {selected.info && (
              <Alert
                severity="info"
                icon={<InfoOutlined fontSize="small" />}
                sx={{ mb: 3, borderRadius: 2, alignItems: "center" }}
              >
                {selected.info}{" "}
                {selected.link && (
                  <a
                    href={selected.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}
                  >
                    Learn more
                  </a>
                )}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              {/* Credentials */}
              <CSectionTitle>Credentials</CSectionTitle>
              <Stack spacing={2.5}>
                {PROVIDER_FIELDS.map(field => (
                  <CTextField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={values[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                    error={Boolean(errors[field.name])}
                    helperText={errors[field.name]}
                  />
                ))}
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Toggles */}
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={3}>
                    {/* Incoming column */}
                    {INCOMING_OUTGOING_FIELDS.filter(f => f.name.includes("incoming")).map(
                      field => {
                        if (field.condition && !field.condition(values)) return null
                        return (
                          <Box key={field.name}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  name={field.name}
                                  checked={Boolean(values[field.name])}
                                  onChange={handleChange}
                                  sx={{ p: 0.5 }}
                                />
                              }
                              label={
                                <Typography variant="body2" fontWeight={500} sx={{ ml: 0.5 }}>
                                  {field.label}
                                </Typography>
                              }
                              sx={{ ml: 0 }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ ml: 4, mt: 0.5 }}
                            >
                              {field.description}
                            </Typography>
                          </Box>
                        )
                      }
                    )}
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={3}>
                    {/* Outgoing column */}
                    {INCOMING_OUTGOING_FIELDS.filter(f => f.name.includes("outgoing")).map(
                      field => {
                        if (field.condition && !field.condition(values)) return null
                        return (
                          <Box key={field.name}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  name={field.name}
                                  checked={Boolean(values[field.name])}
                                  onChange={handleChange}
                                  sx={{ p: 0.5 }}
                                />
                              }
                              label={
                                <Typography variant="body2" fontWeight={500} sx={{ ml: 0.5 }}>
                                  {field.label}
                                </Typography>
                              }
                              sx={{ ml: 0 }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ ml: 4, mt: 0.5 }}
                            >
                              {field.description}
                            </Typography>
                          </Box>
                        )
                      }
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </CForm>
        )}
      </Box>
    </CDialog>
  )
}
