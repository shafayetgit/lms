"use client"
import React, { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Stack, Chip, Typography, Box } from "@mui/material"
import Link from "next/link"
import dayjs from "dayjs"

import CPageLoader from "@/components/ui/CPageLoader"
import CDataTable from "@/components/table/CDatatable"
import CButton from "@/components/ui/CButton"
import { renderCell } from "@/utils/tableTools"

import { useLazyReadLiveClassesQuery } from "@/features/liveClass/liveClassApi"
import CreateDialog from "./_parts/CreateDialog"

const statusColors = {
  Scheduled: "primary",
  Live: "success",
  Completed: "default",
  Cancelled: "error",
}

function LiveClassList({ action }) {
  const searchParams = useSearchParams()
  const page = searchParams.get("page") ?? 1

  const [trigger, { data: { data, meta } = {}, isLoading }] = useLazyReadLiveClassesQuery()

  useEffect(() => {
    trigger({ page })
  }, [page, trigger])

  if (isLoading) return <CPageLoader fullPage={false} />

  const columns = [
    {
      field: "title",
      headerName: "Title",
      flex: 1.5,
      renderCell: ({ value, row }) => (
        <Link
          href={`/lms/live-classes/${row.public_id}`}
          style={{ textDecoration: "none", color: "inherit", fontWeight: "600" }}
        >
          {value}
        </Link>
      ),
    },
    {
      field: "schedule",
      headerName: "Schedule",
      flex: 1,
      renderCell: row =>
        renderCell(
          <Box>
            <Typography variant="body2">{dayjs(row.date).format("MMM DD, YYYY")}</Typography>
            <Typography variant="caption" color="textSecondary">
              {row.time} ({row.duration}m)
            </Typography>
          </Box>
        ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      renderCell: row =>
        renderCell(
          <Chip label={row.value} color={statusColors[row.value] || "default"} size="small" />
        ),
    },
    {
      field: "host_id",
      headerName: "Host ID",
      flex: 0.5,
    },
  ]

  return (
    <CDataTable
      columns={columns}
      rows={data}
      meta={meta}
      loading={isLoading}
      action={action}
      bulkDelete={{ model: "Live Class", invalidateTag: "LIVE_CLASSES" }}
    />
  )
}

export default function LiveClassesPage() {
  return (
    <Box sx={{ width: "100%", p: 0 }}>
      <Suspense fallback={<CPageLoader fullPage={false} />}>
        <LiveClassList action={<CreateDialog />} />
      </Suspense>
    </Box>
  )
}
