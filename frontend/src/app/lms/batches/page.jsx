"use client"
import React, { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Box } from "@mui/material"
import Link from "next/link"

import CPageLoader from "@/components/ui/CPageLoader"
import CDataTable from "@/components/table/CDatatable"
import CModuleLayout from "@/components/ui/CModuleLayout"
import { BATCH_TIPS } from "@/choices/helpTips/batch"
import { renderCell } from "@/utils/tableTools"

import { useLazyReadBatchesQuery } from "@/features/batch/batchAPI"
import CreateDialog from "./_parts/CreateDialog"


function BatchList({ action }) {
  const searchParams = useSearchParams()
  const page = searchParams.get("page") ?? 1

  const [trigger, { data: { data, meta } = {}, isLoading }] = useLazyReadBatchesQuery()

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
          href={`/lms/batches/${row.public_id || row.id}`}
          style={{ textDecoration: "none", color: "inherit", fontWeight: "600" }}
        >
          {value}
        </Link>
      ),
    },
    { field: "start_date", headerName: "Start Date", flex: 1 },
    { field: "end_date", headerName: "End Date", flex: 1 },
    {
      field: "medium",
      headerName: "Medium",
      flex: 1,
      renderCell: (row) => renderCell(row.value || "Online"),
    },
    {
      field: "seat_count",
      headerName: "Seats",
      flex: 0.8,
      renderCell: (row) => (row.value && row.value > 0 ? row.value : "Unlimited"),
    },
    {
      field: "published",
      headerName: "Status",
      flex: 1,
      renderCell: (row) => renderCell(row.value ? "Published" : "Draft"),
    },
  ]

  return (
    <CDataTable
      getRowId={(row) => row?.public_id || row?.id}
      columns={columns}
      rows={data}
      meta={meta}
      loading={isLoading}
      action={action}
      bulkDelete={{ model: "Batch", invalidateTag: "BATCHES" }}
    />
  )
}

export default function BatchesPage() {
  return (
    <CModuleLayout helpTips={BATCH_TIPS.list}>
      <Box sx={{ width: "100%", p: 0 }}>
        <Suspense fallback={<CPageLoader fullPage={false} />}>
          <BatchList action={<CreateDialog />} />
        </Suspense>
      </Box>
    </CModuleLayout>
  )
}
