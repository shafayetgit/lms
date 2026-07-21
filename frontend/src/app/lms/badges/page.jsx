"use client"
import React, { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Stack, Chip, Avatar, Box } from "@mui/material"
import Link from "next/link"
import dayjs from "dayjs"

import CPageLoader from "@/components/ui/CPageLoader"
import CDataTable from "@/components/table/CDatatable"
import CButton from "@/components/ui/CButton"
import { renderCell } from "@/utils/tableTools"

import { useLazyReadBadgesQuery } from "@/features/badge/badgeApi"
import CreateDialog from "./_parts/CreateDialog"

import CModuleLayout from "@/components/ui/CModuleLayout"
import { BADGE_TIPS } from "@/choices/helpTips/badge"

function BadgeList({ action }) {
  const searchParams = useSearchParams()
  const page = searchParams.get("page") ?? 1

  const [trigger, { data: { data, meta } = {}, isLoading }] = useLazyReadBadgesQuery()

  useEffect(() => {
    trigger({ page })
  }, [page, trigger])

  if (isLoading) return <CPageLoader fullPage={false} />

  const columns = [
    {
      field: "image",
      headerName: "Icon",
      width: 80,
      renderCell: row =>
        renderCell(<Avatar src={row.value || ""} alt={row.title} variant="rounded" />),
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      renderCell: ({ value, row }) => (
        <Link
          href={`/lms/badges/${row.public_id}`}
          style={{ textDecoration: "none", color: "inherit", fontWeight: "600" }}
        >
          {value}
        </Link>
      ),
    },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "is_active",
      headerName: "Status",
      flex: 1,
      renderCell: row =>
        renderCell(
          <Chip
            label={row.value ? "Active" : "Inactive"}
            color={row.value ? "success" : "default"}
            size="small"
          />
        ),
    },
    {
      field: "created_at",
      headerName: "Created",
      flex: 1,
      renderCell: row => renderCell(dayjs(row.value).format("MMM DD, YYYY")),
    },
  ]

  return (
    <CDataTable
      columns={columns}
      rows={data}
      meta={meta}
      loading={isLoading}
      action={action}
      bulkDelete={{ model: "Badge", invalidateTag: "BADGES" }}
    />
  )
}

export default function BadgesPage() {
  return (
    <CModuleLayout helpTips={BADGE_TIPS.list}>
      <Suspense fallback={<CPageLoader fullPage={false} />}>
        <BadgeList action={<CreateDialog />} />
      </Suspense>
    </CModuleLayout>
  )
}
