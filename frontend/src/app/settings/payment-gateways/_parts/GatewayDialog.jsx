"use client";
import React, { useState } from "react";
import {
  Box,
  Stack,
  Avatar,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  alpha,
} from "@mui/material";
import { toast } from "react-toastify";
import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CSectionLabel from "@/components/ui/CSectionLabel";
import {
  useCreateGatewayConfigMutation,
  useUpdateGatewayConfigMutation,
} from "@/features/payment/paymentGatewayApi";

const GATEWAYS = [
  {
    name: "SSLCommerz",
    label: "SSLCommerz",
    color: "#e63327",
    initials: "SSL",
    info: "Bangladesh's most popular payment gateway. Supports bKash, Nagad, cards, and internet banking.",
  },
  {
    name: "Stripe",
    label: "Stripe",
    color: "#635bff",
    initials: "STR",
    info: "Global card payment provider. Requires a Stripe account with webhooks configured.",
  },
];

const FIELDS_BY_GATEWAY = {
  SSLCommerz: [
    { name: "ssl_store_id", label: "Store ID", required: true },
    { name: "ssl_store_password", label: "Store Password", type: "password", required: true },
  ],
  Stripe: [
    { name: "stripe_publishable_key", label: "Publishable Key", required: true },
    { name: "stripe_secret_key", label: "Secret Key", type: "password", required: true },
    { name: "stripe_webhook_secret", label: "Webhook Secret", type: "password" },
  ],
};

const emptyValues = () => ({
  ssl_store_id: "",
  ssl_store_password: "",
  ssl_sandbox: true,
  stripe_publishable_key: "",
  stripe_secret_key: "",
  stripe_webhook_secret: "",
  is_active: false,
});

export default function GatewayDialog({ open, onClose, existing }) {
  const isEdit = !!existing;
  // Derive initial state from props — avoid calling setState inside useEffect
  const initialGateway = existing ? GATEWAYS.find((g) => g.name === existing.gateway) || null : null;
  const initialValues = existing ? { ...emptyValues(), ...existing } : emptyValues();

  const [selectedGateway, setSelectedGateway] = useState(initialGateway);
  const [values, setValues] = useState(initialValues);

  // Reset when dialog opens/closes or existing changes
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    setSelectedGateway(open && existing ? GATEWAYS.find((g) => g.name === existing.gateway) || null : null);
    setValues(open && existing ? { ...emptyValues(), ...existing } : emptyValues());
  }

  const [createConfig, { isLoading: isCreating }] = useCreateGatewayConfigMutation();
  const [updateConfig, { isLoading: isUpdating }] = useUpdateGatewayConfigMutation();
  const isLoading = isCreating || isUpdating;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedGateway) {
      toast.warning("Please select a gateway first.");
      return;
    }

    const payload = { ...values, gateway: selectedGateway.name };

    try {
      if (isEdit) {
        // Only send non-empty secret fields to avoid wiping existing ones
        const updatePayload = Object.fromEntries(
          Object.entries(payload).filter(([, v]) => v !== "" && v !== null)
        );
        await updateConfig({ gateway: selectedGateway.name, body: updatePayload }).unwrap();
        toast.success(`${selectedGateway.label} configuration updated`);
      } else {
        await createConfig(payload).unwrap();
        toast.success(`${selectedGateway.label} gateway added`);
      }
      onClose();
    } catch (err) {
      if (err?.data?.errors && Array.isArray(err.data.errors)) {
        err.data.errors.forEach((e) => {
          toast.error(e.message);
        });
      } else {
        toast.error(err?.data?.message || err?.data?.detail || "Failed to save gateway configuration");
      }
    }
  }

  const fields = selectedGateway ? FIELDS_BY_GATEWAY[selectedGateway.name] || [] : [];

  return (
    <CDialog
      title={isEdit ? `Edit ${existing?.gateway} Gateway` : "Add Payment Gateway"}
      open={open}
      handleCDialogClose={onClose}
      maxWidth="sm"
    >
      <Box sx={{ mt: 1 }}>
        {/* Gateway selector — only shown on create */}
        {!isEdit && (
          <Box sx={{ mb: 3 }}>
            <CSectionLabel label="Select Gateway" />
            <Box sx={{ display: "flex", gap: 1.5 }}>
              {GATEWAYS.map((gw) => {
                const isSelected = selectedGateway?.name === gw.name;
                return (
                  <Box
                    key={gw.name}
                    onClick={() => setSelectedGateway(gw)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.75,
                      py: 1.5,
                      px: 1.5,
                      cursor: "pointer",
                      borderRadius: 2,
                      border: "1.5px solid",
                      borderColor: isSelected ? gw.color : "divider",
                      bgcolor: isSelected ? alpha(gw.color, 0.06) : "transparent",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: gw.color, bgcolor: alpha(gw.color, 0.04) },
                      minWidth: 90,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 30,
                        height: 30,
                        bgcolor: gw.color,
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        letterSpacing: 0.5,
                      }}
                    >
                      {gw.initials}
                    </Avatar>
                    <Typography
                      variant="caption"
                      fontWeight={isSelected ? 700 : 500}
                      color={isSelected ? gw.color : "text.primary"}
                      noWrap
                    >
                      {gw.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Form shown once gateway is selected */}
        {selectedGateway && (
          <CForm
            onSubmit={handleSubmit}
            dialog
            btnProps={{ loading: isLoading, label: isEdit ? "Save Changes" : "Add Gateway", action: "" }}
          >
            {selectedGateway.info && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                {selectedGateway.info}
              </Alert>
            )}

            <CSectionLabel label="Credentials" />
            <Stack spacing={2.5} sx={{ mb: 3 }}>
              {fields.map((field) => (
                <CTextField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type || "text"}
                  placeholder={isEdit && field.type === "password" ? "Leave blank to keep existing" : ""}
                  value={values[field.name] || ""}
                  onChange={handleChange}
                  required={!isEdit && field.required}
                />
              ))}

              {/* SSLCommerz sandbox toggle */}
              {selectedGateway.name === "SSLCommerz" && (
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      name="ssl_sandbox"
                      checked={Boolean(values.ssl_sandbox)}
                      onChange={handleChange}
                      sx={{ p: 0.5 }}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500} sx={{ ml: 0.5 }}>
                      Use Sandbox (test) mode
                    </Typography>
                  }
                  sx={{ ml: 0 }}
                />
              )}
            </Stack>

            <CSectionLabel label="Status" />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  name="is_active"
                  checked={Boolean(values.is_active)}
                  onChange={handleChange}
                  sx={{ p: 0.5 }}
                />
              }
              label={
                <Box sx={{ ml: 0.5 }}>
                  <Typography variant="body2" fontWeight={500}>Set as Active Gateway</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Only one gateway can be active at a time. Activating this will deactivate others.
                  </Typography>
                </Box>
              }
              sx={{ ml: 0, alignItems: "flex-start" }}
            />
          </CForm>
        )}
      </Box>
    </CDialog>
  );
}
