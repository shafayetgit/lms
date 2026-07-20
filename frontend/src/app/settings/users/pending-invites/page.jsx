"use client"
import React, { Suspense, useState } from "react"
import { Box } from "@mui/material"
import CPageLoader from "@/components/ui/CPageLoader"
import usePermissions from "@/hooks/usePermissions"
import InviteUserDialog from "../_parts/InviteUserDialog"
import PendingInvitesTab from "../_parts/PendingInvitesTab"

function PendingInvitesPageContent() {
  const { can, isSuperAdmin } = usePermissions()
  const canCreate = isSuperAdmin || can("user", "create")
  const canDelete = isSuperAdmin || can("user", "delete")

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  return (
    <Box sx={{ width: "100%" }}>
      <PendingInvitesTab
        canCreate={canCreate}
        canDelete={canDelete}
        onInviteClick={() => setInviteDialogOpen(true)}
      />
      <InviteUserDialog open={inviteDialogOpen} handleClose={() => setInviteDialogOpen(false)} />
    </Box>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<CPageLoader fullPage={false} />}>
      <PendingInvitesPageContent />
    </Suspense>
  )
}
