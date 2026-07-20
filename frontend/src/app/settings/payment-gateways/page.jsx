"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  PaymentsOutlined,
  CheckCircleOutline,
  RadioButtonUnchecked,
  EditOutlined,
  DeleteOutline,
} from "@mui/icons-material";
import CButton from "@/components/ui/CButton";
import CPageLoader from "@/components/ui/CPageLoader";
import CModuleLayout from "@/components/ui/CModuleLayout";
import {
  useListGatewayConfigsQuery,
  useDeleteGatewayConfigMutation,
} from "@/features/payment/paymentGatewayApi";
import { toast } from "react-toastify";
import GatewayDialog from "./_parts/GatewayDialog";

const GATEWAY_COLORS = {
  SSLCommerz: "#e63327",
  Stripe: "#635bff",
};

const GATEWAY_INITIALS = {
  SSLCommerz: "SSL",
  Stripe: "STR",
};

const helpTips = {
  description: "Configure the payment gateways used for course and batch purchases. Only one gateway can be active at a time.",
  tips: [
    { label: "SSLCommerz", text: "Most widely used Bangladeshi payment gateway. Supports cards, bKash, Nagad, and more." },
    { label: "Stripe", text: "Global card payment provider. Requires Stripe account and webhook secret for verification." },
    { label: "Razorpay", text: "Indian payment gateway. Uses JS-based checkout widget — your frontend needs Razorpay.js." },
    { label: "Active Gateway", text: "Only one gateway can be active. Activating one automatically deactivates the other." },
    { label: "Webhook URL", text: "Configure your gateway's webhook to POST to: /api/v1/payment-gateways/webhook/{gateway_name}" },
  ],
};

export default function PaymentGatewaysPage() {
  const { data, isLoading } = useListGatewayConfigsQuery();
  const [deleteConfig, { isLoading: isDeleting }] = useDeleteGatewayConfigMutation();
  const [dialogState, setDialogState] = useState({ open: false, gateway: null });

  const configs = Array.isArray(data) ? data : [];

  const handleDelete = async (gateway) => {
    try {
      await deleteConfig(gateway).unwrap();
      toast.success(`${gateway} configuration removed`);
    } catch {
      toast.error("Failed to remove gateway configuration");
    }
  };

  return (
    <CModuleLayout helpTips={helpTips}>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={600} mb={0.5}>
              Payment Gateways
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure the payment processors used for course and batch checkouts.
            </Typography>
          </Box>
          <CButton
            label="Add Gateway"
            action="add"
            variant="contained"
            onClick={() => setDialogState({ open: true, gateway: null })}
          />
        </Box>

        {isLoading && <CPageLoader fullPage={false} />}

        {!isLoading && configs.length === 0 && (
          <Box
            sx={{
              py: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <PaymentsOutlined sx={{ fontSize: 32, mb: 1.5, color: "text.secondary", opacity: 0.5 }} />
            <Typography sx={{ fontSize: "15px", fontWeight: 600, mb: 0.5 }}>
              No Gateways Configured
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
              Add a gateway to enable payments for courses and batches.
            </Typography>
          </Box>
        )}

        {!isLoading && configs.length > 0 && (
          <Stack spacing={2}>
            {configs.map((config) => {
              const color = GATEWAY_COLORS[config.gateway] || "#607D8B";
              const initials = GATEWAY_INITIALS[config.gateway] || "GW";

              return (
                <Paper
                  key={config.gateway}
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: config.is_active ? "primary.main" : "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <Box
                    sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: color,
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        flexShrink: 0,
                        letterSpacing: 0.5,
                      }}
                    >
                      {initials}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {config.gateway}
                        </Typography>
                        {config.is_active && (
                          <Chip label="Active" color="success" size="small" sx={{ height: 20, fontSize: "0.7rem" }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {config.gateway === "SSLCommerz"
                          ? config.ssl_sandbox ? "Sandbox mode" : "Live mode"
                          : config.gateway === "Stripe"
                          ? config.stripe_publishable_key ? "Configured" : "Not configured"
                          : config.razorpay_key_id ? "Configured" : "Not configured"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => setDialogState({ open: true, gateway: config })}
                          sx={{ color: "text.secondary" }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          disabled={isDeleting}
                          onClick={() => handleDelete(config.gateway)}
                          sx={{ color: "error.light" }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Divider />
                  <Box sx={{ px: 2.5, py: 1.5, display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <StatusFlag label="Active" active={config.is_active} />
                    {config.gateway === "SSLCommerz" && (
                      <>
                        <StatusFlag label="Store ID" active={!!config.ssl_store_id} />
                        <StatusFlag label="Sandbox" active={config.ssl_sandbox} />
                      </>
                    )}
                    {config.gateway === "Stripe" && (
                      <>
                        <StatusFlag label="Publishable Key" active={!!config.stripe_publishable_key} />
                        <StatusFlag label="Webhook Secret" active={false} note="masked" />
                      </>
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}

        <GatewayDialog
          open={dialogState.open}
          onClose={() => setDialogState({ open: false, gateway: null })}
          existing={dialogState.gateway}
        />
      </Box>
    </CModuleLayout>
  );
}

function StatusFlag({ label, active, note }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {active ? (
        <CheckCircleOutline sx={{ fontSize: 15, color: "success.main" }} />
      ) : (
        <RadioButtonUnchecked sx={{ fontSize: 15, color: "text.disabled" }} />
      )}
      <Typography
        variant="caption"
        color={active ? "text.primary" : "text.disabled"}
        fontWeight={active ? 600 : 400}
      >
        {label}{note ? ` (${note})` : ""}
      </Typography>
    </Box>
  );
}
