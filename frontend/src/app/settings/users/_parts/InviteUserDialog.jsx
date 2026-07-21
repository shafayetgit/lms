"use client"
import React, { useState, useEffect } from "react"
import { Box, Stack, MenuItem, Typography } from "@mui/material"
import { toast } from "react-toastify"
import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import { useCreateInvitationsMutation, useGetUserRolesQuery } from "@/features/user/userAPI"

export default function InviteUserDialog({ open, handleClose }) {
  const [emails, setEmails] = useState("")
  const [role, setRole] = useState("student")
  const [createInvitations, { isLoading: isInviting }] = useCreateInvitationsMutation()
  const { data: rolesResponse } = useGetUserRolesQuery()
  const roles = rolesResponse?.data || []

  const activeRole = roles.some(r => r.slug === role) ? role : roles[0]?.slug || "student"
  const selectedRoleObj = roles.find(r => r.slug === activeRole)
  const roleDescription = selectedRoleObj?.description || ""

  const handleSendInvites = async e => {
    e.preventDefault()
    if (!emails.trim()) {
      toast.error("Please enter email addresses")
      return
    }

    try {
      await createInvitations({
        emails: emails,
        role: activeRole,
      }).unwrap()
      toast.success("Invitations sent successfully")
      setEmails("")
      handleClose()
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.detail || "Failed to send invitations")
    }
  }

  return (
    <CDialog title="Invite New User" open={open} handleCDialogClose={handleClose} maxWidth="sm">
      <Box sx={{ mt: 1 }}>
        <CForm
          onSubmit={handleSendInvites}
          dialog
          btnProps={{
            label: "Send Invites",
            action: "",
            loading: isInviting,
            disabled: isInviting,
          }}
        >
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Invite users to access TheBioSport LMS. Specify their roles to control access and
              permissions.
            </Typography>

            <CTextField
              label="Invite By Email"
              placeholder="user1@example.com, user2@example.com"
              multiline
              rows={3}
              value={emails}
              onChange={e => setEmails(e.target.value)}
              helperText="You can invite multiple users by comma separating their email addresses."
              required
            />

            <Box>
              <CTextField
                label="Invite As"
                select
                value={activeRole}
                onChange={e => setRole(e.target.value)}
                required
              >
                {roles.map(r => (
                  <MenuItem key={r.id} value={r.slug}>
                    {r.name}
                  </MenuItem>
                ))}
              </CTextField>
              {roleDescription && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  {roleDescription}
                </Typography>
              )}
            </Box>
          </Stack>
        </CForm>
      </Box>
    </CDialog>
  )
}
