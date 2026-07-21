"use client"
import React, { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Stack, Box } from "@mui/material"
import Link from "next/link"
import dayjs from "dayjs"
import { SchoolOutlined, AssignmentTurnedInOutlined } from "@mui/icons-material"

import CPageLoader from "@/components/ui/CPageLoader"
import CDataTable from "@/components/table/CDatatable"
import { renderCell } from "@/utils/tableTools"
import CModuleLayout from "@/components/ui/CModuleLayout"

import { useLazyReadCertificateRequestsQuery } from "@/features/certificate/certificateApi"

function RequestsList({ action }) {
  const searchParams = useSearchParams()
  const page = searchParams.get("page") ?? 1

  const [trigger, { data: { data, meta } = {}, isLoading }] = useLazyReadCertificateRequestsQuery()

  useEffect(() => {
    trigger({ page })
  }, [page, trigger])

  if (isLoading) return <CPageLoader fullPage={false} />

  const columns = [
    {
      field: "member",
      headerName: "Student",
      flex: 1.5,
      renderCell: ({ value, row }) => (
        <Link
          href={`/lms/evaluations/requests/${row.public_id}`}
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

  return (
    <CDataTable columns={columns} rows={data} meta={meta} loading={isLoading} action={action} />
  )
}

export default function RequestsPage() {
  const navigators = [
    { label: "Evaluation Sessions", href: "/lms/evaluations", icon: <SchoolOutlined /> },
    {
      label: "Certificate Requests",
      href: "/lms/evaluations/requests",
      icon: <AssignmentTurnedInOutlined />,
    },
  ]

  const helpTips = {
    description: "Manage student evaluation sessions and certificate requests.",
    tips: [
      {
        title: "Evaluation Sessions",
        description:
          "Sessions represent scheduled online/practical evaluations for students by their assigned instructor.",
      },
      {
        title: "Certificate Requests",
        description:
          "Students submit certificate requests upon batch/course completion. Approving them schedules a new evaluation session.",
      },
    ],
  }

  return (
    <CModuleLayout navigators={navigators} helpTips={helpTips}>
      <Suspense fallback={<CPageLoader fullPage={false} />}>
        <RequestsList />
      </Suspense>
    </CModuleLayout>
  )
}
