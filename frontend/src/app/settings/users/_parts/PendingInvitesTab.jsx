"use client"
import React from "react"
import { useSearchParams } from "next/navigation"
import { Box } from "@mui/material"
import CDataTable from "@/components/table/CDatatable"
import CButton from "@/components/ui/CButton"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import { useGetInvitationsQuery } from "@/features/user/userAPI"
import { formatDate } from "@/utils/cdayjs"

export default function PendingInvitesTab({ canCreate, canDelete, onInviteClick }) {
  const searchParams = useSearchParams()
  const page = Number(searchParams.get("page") ?? 1)
  const term = searchParams.get("term") ?? ""
  const limit = 10

  const { data, isLoading, isError } = useGetInvitationsQuery({
    skip: (page - 1) * limit,
    limit,
    term,
  })

  const items = data?.data || []
  const meta = data?.meta || {
    total: 0,
    page: page,
    size: limit,
    pages: 1,
  }

  const columns = [
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      renderCell: ({ value }) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : "-"),
    },
    {
      field: "created_at",
      headerName: "Sent At",
      flex: 1,
      renderCell: ({ value }) => (value ? formatDate(value) : "-"),
    },
  ]

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
          canDelete
            ? { model: "Invitation", invalidateTag: "INVITATIONS", idField: "public_id" }
            : undefined
        }
        action={
          canCreate ? (
            <CButton label="Invite New User" action="add" onClick={onInviteClick} />
          ) : undefined
        }
      />
    </Box>
  )
}
