"use client"
import React from "react"
import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material"
import Image from "next/image"
import {
  MailOutline as MailOutlineIcon,
  CheckCircleOutline,
  RadioButtonUnchecked,
  EditOutlined,
} from "@mui/icons-material"
import CButton from "@/components/ui/CButton"
import CPageLoader from "@/components/ui/CPageLoader"
import CDelete from "@/components/actions/CDelete"
import { useListEmailAccountsQuery } from "@/features/shared/emailAccountAPI"
import { SERVICE_COLORS, SERVICE_INITIALS, SERVICE_IMAGES } from "../emailConfig"

export default function EmailAccountList({ onAddOpen, onEditOpen }) {
  const theme = useTheme()
  const { data, isLoading } = useListEmailAccountsQuery({})

  const accounts = data?.data || []

  return (
    <Box>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={600} mb={0.5}>
            Email Accounts
          </Typography>
        </Box>
        <CButton label="Add Account" onClick={onAddOpen} action="add" variant="contained" />
      </Box>

      {isLoading && (
        <Box sx={{ mt: 4 }}>
          <CPageLoader fullPage={false} />
        </Box>
      )}

      {/* Empty state */}
      {!isLoading && accounts.length === 0 && (
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
          <MailOutlineIcon sx={{ fontSize: 28, mb: 1.5, color: "text.secondary", opacity: 0.6 }} />
          <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "text.primary", mb: 0.5 }}>
            No Accounts Found
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "text.secondary", opacity: 0.8 }}>
            No email accounts have been created yet. Click &quot;Add Account&quot; to add one.
          </Typography>
        </Box>
      )}

      {/* Account list */}
      {!isLoading && accounts.length > 0 && (
        <Stack spacing={2}>
          {accounts.map(account => {
            const color = SERVICE_COLORS[account.service] || "#607D8B"
            const initials = SERVICE_INITIALS[account.service] || "?"
            const sImage = SERVICE_IMAGES[account.service]

            return (
              <Paper
                key={account.public_id}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                {/* Main row */}
                <Box
                  sx={{
                    p: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    cursor: "pointer",
                  }}
                  onClick={() => onEditOpen(account)}
                >
                  {/* Provider avatar */}
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
                        flexShrink: 0,
                        p: 0.25,
                      }}
                    >
                      <Image
                        src={sImage}
                        alt={account.service}
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
                        bgcolor: color,
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </Avatar>
                  )}

                  {/* Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" fontWeight={600} noWrap>
                      {account.email_account_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {account.email_id}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={e => {
                          e.stopPropagation()
                          onEditOpen(account)
                        }}
                        sx={{ color: "text.secondary" }}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Box onClick={e => e.stopPropagation()}>
                      <CDelete
                        size="small"
                        sx={{ color: "error.light" }}
                        values={{
                          model: "EmailAccount",
                          filters: [
                            { field: "public_id", operator: "eq", value: account.public_id },
                          ],
                        }}
                        invalidateTag="EMAIL_ACCOUNTS"
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Feature flags */}
                <Divider />
                <Box sx={{ px: 2.5, py: 1.5, display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <FeatureFlag label="Incoming" active={account.enable_incoming} />
                  <FeatureFlag label="Outgoing" active={account.enable_outgoing} />
                  <FeatureFlag label="Default Incoming" active={account.default_incoming} />
                  <FeatureFlag label="Default Outgoing" active={account.default_outgoing} />
                </Box>
              </Paper>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}

function FeatureFlag({ label, active }) {
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
        {label}
      </Typography>
    </Box>
  )
}
