"use client"
import React, { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Box, Avatar, Typography } from "@mui/material"
import CButton from "@/components/ui/CButton"
import CDataTable from "@/components/table/CDatatable"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import { useGetUsersQuery } from "@/features/user/userAPI"
import RoleSelector from "./_parts/RoleSelector"
import usePermissions from "@/hooks/usePermissions"
import InviteUserDialog from "./_parts/InviteUserDialog"

function UsersPageContent() {
  const { can, isSuperAdmin } = usePermissions()
  const canCreate = isSuperAdmin || can("user", "create")
  const canDelete = isSuperAdmin || can("user", "delete")
  const searchParams = useSearchParams()
  const page = Number(searchParams.get("page") ?? 1)
  const term = searchParams.get("term") ?? ""
  const limit = 10

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const { data, isLoading, isError } = useGetUsersQuery({
    skip: (page - 1) * limit,
    limit,
    term,
  })

  const columns = [
    {
      field: "profile",
      headerName: "User Profile",
      flex: 2,
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1 }}>
          <Avatar
            src={row.avatar ? row.avatar : undefined}
            sx={{
              width: 40,
              height: 40,
              bgcolor: "action.selected",
              color: "text.primary",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            {row.first_name
              ? row.first_name.charAt(0).toUpperCase()
              : row.email
                ? row.email.charAt(0).toUpperCase()
                : "U"}
          </Avatar>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.2 }}
            >
              {row.full_name ||
                `${row.first_name || ""} ${row.last_name || ""}`.trim() ||
                row.username ||
                "User"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.25 }}>
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      renderCell: ({ row }) => <RoleSelector user={row} />,
    },
  ]

  const items = data?.data || []
  const meta = data?.meta || {
    total: 0,
    page: page,
    size: limit,
    pages: 1,
  }

  if (isLoading) return <CPageLoader />
  if (isError) return <CError fullPage={false} />

  return (
    <Box sx={{ width: "100%" }}>
      <CDataTable
        columns={columns}
        rows={items}
        meta={meta}
        isLoading={isLoading}
        getRowId={row => row.public_id || row.id}
        checkboxSelection={canDelete}
        hasFilter={true}
        getRowHeight={70}
        deleteData={
          canDelete ? { model: "User", invalidateTag: "USERS", idField: "public_id" } : undefined
        }
        action={
          canCreate ? (
            <CButton
              label="Invite New User"
              action="add"
              onClick={() => setInviteDialogOpen(true)}
            />
          ) : undefined
        }
      />
      <InviteUserDialog open={inviteDialogOpen} handleClose={() => setInviteDialogOpen(false)} />
    </Box>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<CPageLoader fullPage={false} />}>
      <UsersPageContent />
    </Suspense>
  )
}
