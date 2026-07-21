"use client"
import React, { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { FormControl, Select, MenuItem, Box } from "@mui/material"

import CPageLoader from "@/components/ui/CPageLoader"
import CDataTable from "@/components/table/CDatatable"
import { renderCell } from "@/utils/tableTools"
import CModuleLayout from "@/components/ui/CModuleLayout"

import { useLazyReadCertificateRequestsQuery } from "@/features/certificate/certificateApi"
import CreateDialog from "./_parts/CreateDialog"

function RequestsList({ action }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const page = searchParams.get("page") ?? 1
  const [statusFilter, setStatusFilter] = useState("Pending")

  const [trigger, { data: { data, meta } = {}, isLoading }] = useLazyReadCertificateRequestsQuery()

  useEffect(() => {
    const params = { page }
    if (statusFilter !== "All") {
      params.status_filter = statusFilter
    }
    trigger(params)
  }, [page, statusFilter, trigger])

  const handleDropdownChange = event => {
    setStatusFilter(event.target.value)
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  if (isLoading) return <CPageLoader fullPage={false} />

  const columns = [
    {
      field: "member",
      headerName: "Student",
      flex: 1.5,
      renderCell: ({ value, row }) => (
        <Link
          href={`/lms/certificate-requests/${row.public_id}`}
          style={{ textDecoration: "none", color: "inherit", fontWeight: "600" }}
        >
          {value?.full_name || value?.email || "Unknown Student"}
        </Link>
      ),
    },
    {
      field: "course",
      headerName: "Course/Batch",
      flex: 1.5,
      renderCell: ({ value, row }) => renderCell(value?.title || row.batch?.title || "N/A"),
    },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "evaluator",
      headerName: "Evaluator",
      flex: 1.2,
      renderCell: ({ value }) => renderCell(value?.full_name || "Unassigned"),
    },
  ]

  const dropdownFilter = (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <Select
        value={statusFilter}
        onChange={handleDropdownChange}
        displayEmpty
        sx={{
          borderRadius: 1,
          fontSize: "0.875rem",
          fontWeight: 600,
          "& .MuiSelect-select": {
            py: 1,
            px: 2,
          },
        }}
      >
        <MenuItem value="Pending" sx={{ fontWeight: 600 }}>
          Pending
        </MenuItem>
        <MenuItem value="Approved" sx={{ fontWeight: 600 }}>
          Approved
        </MenuItem>
        <MenuItem value="Rejected" sx={{ fontWeight: 600 }}>
          Rejected
        </MenuItem>
        <MenuItem value="All" sx={{ fontWeight: 600 }}>
          All Statuses
        </MenuItem>
      </Select>
    </FormControl>
  )

  return (
    <CDataTable
      columns={columns}
      rows={data}
      meta={meta}
      loading={isLoading}
      action={action}
      deleteData={{ model: "CertificateRequest", invalidateTag: "CERTIFICATES" }}
      additionalFilters={dropdownFilter}
    />
  )
}

export default function RequestsPage() {
  const helpTips = {
    description: "Manage student certificate requests and evaluation assignments.",
    tips: [
      {
        title: "Certificate Requests",
        description:
          "Students submit certificate requests upon batch/course completion. Click on a student name to process.",
      },
      {
        title: "Evaluation Assignment",
        description:
          "Approving a certificate request schedules an evaluation session and assigns the designated instructor.",
      },
    ],
  }

  return (
    <CModuleLayout helpTips={helpTips}>
      <Suspense fallback={<CPageLoader fullPage={false} />}>
        <RequestsList action={<CreateDialog />} />
      </Suspense>
    </CModuleLayout>
  )
}
