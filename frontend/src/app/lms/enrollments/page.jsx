"use client"
import React, { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Chip, Box, LinearProgress, Typography } from "@mui/material"

import CDataTable from "@/components/table/CDatatable"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import PermissionGuard from "@/components/ui/PermissionGuard"
import { formatDate } from "@/utils/cdayjs"
import { ENROLLMENT_TIPS } from "@/choices/helpTips/enrollment"
import { useLazyReadEnrollmentsQuery } from "@/features/enrollment/enrollmentAPI"
import CreateDialog from "./_parts/CreateDialog"

function EnrollmentList({ action }) {
  const searchParams = useSearchParams()
  const page = searchParams.get("page") ?? 1

  const [trigger, { data: { data, meta } = {}, isLoading, isError }] = useLazyReadEnrollmentsQuery()

  useEffect(() => {
    trigger({ page })
  }, [page, trigger])

  if (isLoading) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  const columns = [
    {
      field: "student",
      headerName: "Student",
      flex: 1.2,
      renderCell: ({ row }) => {
        const fullName =
          row.user?.full_name ||
          `${row.user?.first_name || ""} ${row.user?.last_name || ""}`.trim() ||
          `User #${row.user_id}`
        return (
          <Link
            href={`/lms/enrollments/${row.public_id || row.id}`}
            style={{ textDecoration: "none", color: "inherit", fontWeight: "600" }}
          >
            {fullName}
          </Link>
        )
      },
    },
    {
      field: "course",
      headerName: "Course",
      flex: 1.5,
      renderCell: ({ row }) => row.course?.title || `Course #${row.course_id}`,
    },
    {
      field: "progress",
      headerName: "Progress",
      flex: 1.2,
      renderCell: ({ value = 0 }) => (
        <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(value, 100)}
            sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
          />
          <Typography
            variant="caption"
            sx={{ fontWeight: 600 }}
          >{`${Math.round(value)}%`}</Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.9,
      renderCell: ({ value }) => (
        <Chip
          label={value}
          color={value === "active" ? "success" : value === "completed" ? "info" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "enrolled_at",
      headerName: "Enrolled At",
      flex: 1.2,
      renderCell: ({ value }) => value && formatDate(value),
    },
  ]

  return (
    <CDataTable
      columns={columns}
      rows={data}
      meta={meta}
      loading={isLoading}
      action={action}
      bulkDelete={{ model: "Enrollment", invalidateTag: "ENROLLMENTS" }}
    />
  )
}

export default function Page() {
  return (
    <PermissionGuard resource="enrollment" action="read">
      <CModuleLayout helpTips={ENROLLMENT_TIPS.list}>
        <Suspense fallback={<CPageLoader fullPage={false} />}>
          <EnrollmentList action={<CreateDialog />} />
        </Suspense>
      </CModuleLayout>
    </PermissionGuard>
  )
}
