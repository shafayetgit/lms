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
} from "@mui/material"
import Grid from "@mui/material/Grid"
import { InfoOutlined } from "@mui/icons-material"
import { toast } from "react-toastify"
import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CSectionLabel from "@/components/ui/CSectionLabel"
import Image from "next/image"
import {
  EMAIL_SERVICES,
  SERVICE_COLORS,
  SERVICE_INITIALS,
  SERVICE_IMAGES,
  PROVIDER_FIELDS,
  INCOMING_OUTGOING_FIELDS,
} from "../emailConfig"
import { useUpdateEmailAccountMutation } from "@/features/shared/emailAccountAPI"

export default function EmailAccountEditDialog({ open, handleCDialogClose, account }) {
  const service = EMAIL_SERVICES.find(s => s.name === account.service) || {
    name: account.service,
    label: account.service,
    info: "Configuring email accounts allows system messaging and notifications.",
    link: null,
  }

  const [values, setValues] = useState({
    email_account_name: account.email_account_name || "",
    email_id: account.email_id || "",
    password: "", // never pre-filled for security
    enable_incoming: account.enable_incoming || false,
    enable_outgoing: account.enable_outgoing || false,
    default_incoming: account.default_incoming || false,
    default_outgoing: account.default_outgoing || false,
  })
  const [errors, setErrors] = useState({})
  const [updateAccount, { isLoading }] = useUpdateEmailAccountMutation()

  const color = SERVICE_COLORS[account.service] || "#607D8B"
  const initials = SERVICE_INITIALS[account.service] || "?"
  const sImage = SERVICE_IMAGES[account.service]

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setValues(v => ({ ...v, [name]: type === "checkbox" ? checked : value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!values.email_account_name?.trim()) errs.email_account_name = "Account name is required"
    if (!values.email_id?.trim()) errs.email_id = "Email ID is required"
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    // Only send non-empty fields — skip password if blank (keep current)
    const payload = {}
    Object.entries(values).forEach(([k, v]) => {
      if (k === "password" && !v) return
      if (v !== "" && v !== null && v !== undefined) payload[k] = v
    })

    try {
      await updateAccount({ id: account.public_id, body: payload }).unwrap()
      toast.success("Email account updated successfully")
      handleCDialogClose()
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.detail || "Failed to update email account")
    }
  }

  return (
    <CDialog
      title="Edit Email Account"
      open={open}
      handleCDialogClose={handleCDialogClose}
      maxWidth="sm"
    >
      <Box sx={{ mt: 1 }}>
        {/* Provider badge */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
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
                border: "1px solid",
                borderColor: "divider",
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
              sx={{ width: 26, height: 26, bgcolor: color, fontSize: "0.6rem", fontWeight: 700 }}
            >
              {initials}
            </Avatar>
          )}
          <Box>
            <Typography variant="body1" fontWeight={600}>
              {account.email_account_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {service.label}
            </Typography>
          </Box>
        </Box>

        {/* Info banner */}
        {service.info && (
          <Alert
            severity="info"
            icon={<InfoOutlined fontSize="small" />}
            sx={{ mb: 3, borderRadius: 2, alignItems: "center" }}
          >
            {service.info}{" "}
            {service.link && (
              <a
                href={service.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}
              >
                Learn more
              </a>
            )}
          </Alert>
        )}

        <CForm
          onSubmit={handleSubmit}
          dialog
          btnProps={{
            loading: isLoading,
            label: "Save",
            action: "",
          }}
        >
          <Box sx={{ mb: 3 }}>
            {/* Credentials */}
            <CSectionLabel label="Credentials" />
            <Stack spacing={2.5}>
              {PROVIDER_FIELDS.map(field => (
                <CTextField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type || "text"}
                  placeholder={
                    field.name === "password"
                      ? account.has_password
                        ? "Leave blank to keep current"
                        : field.placeholder
                      : field.placeholder
                  }
                  value={values[field.name] || ""}
                  onChange={handleChange}
                  required={field.required && field.name !== "password"}
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
                  {INCOMING_OUTGOING_FIELDS.filter(f => f.name.includes("incoming")).map(field => {
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
                  })}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={3}>
                  {/* Outgoing column */}
                  {INCOMING_OUTGOING_FIELDS.filter(f => f.name.includes("outgoing")).map(field => {
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
                  })}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </CForm>
      </Box>
    </CDialog>
  )
}
