"use client"
import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Box, Stack, Chip, IconButton } from "@mui/material"
import { EditOutlined } from "@mui/icons-material"
import CDataTable from "@/components/table/CDatatable"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CreateUserDialog from "./_parts/CreateUserDialog"
import { useGetUsersQuery } from "@/features/user/userAPI"
import { formatDate } from "@/utils/cdayjs"

function UsersPageContent() {
  const searchParams = useSearchParams()
  const page = Number(searchParams.get("page") ?? 1)
  const term = searchParams.get("term") ?? ""
  const limit = 10

  const { data, isLoading, isError } = useGetUsersQuery({
    page,
    size: limit,
    term,
  })

  const getUserType = role => {
    const r = role?.toLowerCase()
    if (r === "superadmin" || r === "super_admin" || r === "admin") return "System User"
    if (r === "sales_manager") return "Manager User"
    return "Sales User"
  }

  const columns = [
    {
      field: "name",
      headerName: "Full Name",
      flex: 1.2,
      renderCell: ({ row }) => (
        <Link
          href={`/core/users/${row.public_id}`}
          style={{ fontWeight: 600, color: "inherit", textDecoration: "none" }}
        >
          {`${row.first_name || ""} ${row.last_name || ""}`}
        </Link>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
    },
    {
      field: "roles",
      headerName: "Roles",
      flex: 1.2,
      renderCell: ({ row }) => {
        const roles = row.roles || []
        if (roles.length === 0) return "-"
        return (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {roles.map(role => (
              <Chip
                key={role.public_id}
                label={role.name}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "11px",
                  height: "20px",
                  textTransform: "capitalize",
                }}
              />
            ))}
          </Stack>
        )
      },
    },
    {
      field: "is_active",
      headerName: "Status",
      flex: 0.8,
      renderCell: ({ value }) => (
        <Chip
          label={value ? "Active" : "Disabled"}
          size="small"
          color={value ? "success" : "error"}
        />
      ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      renderCell: ({ value }) => (value ? formatDate(value) : "-"),
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
        getRowId={row => row.public_id}
        checkboxSelection={true}
        hasFilter={true}
        action={<CreateUserDialog />}
        deleteData={{ model: "User", invalidateTag: "USERS", idField: "public_id" }}
      />
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
