"use client"
import React, { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLazyReadEnrollmentsQuery } from "@/features/enrollment/enrollmentAPI"
import CDataTable from "@/components/table/CDatatable"
import { formatDate } from "@/utils/cdayjs"
import { renderCell } from "@/utils/tableTools"
import CDelete from "@/components/actions/CDelete"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import ModuleContainer from "@/components/ui/ModuleContainer"
import CreateDialog from "./_parts/CreateDialog"

import { Stack, Chip } from "@mui/material"
import CButton from "@/components/ui/CButton"
import Link from "next/link"

import { Suspense } from "react"

const breadcrumbs = [
  { label: "Dashboard", path: "/" },
  { label: "Enrollments", path: "/admin/enrollments" },
]

function EnrollmentList() {
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
      field: "id",
      headerName: "ID",
      flex: 0.5,
    },
    {
      field: "user_id",
      headerName: "User ID",
      flex: 1,
    },
    {
      field: "course_id",
      headerName: "Course ID",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
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
      flex: 1.5,
      renderCell: ({ value }) => value && formatDate(value),
    },
    {
      field: "Actions",
      headerName: "Actions",
      flex: 1,
      renderCell: row =>
        renderCell(
          <Stack direction="row" spacing={1}>
            <CDelete
              values={{
                model: "Enrollment",
                filters: [
                  {
                    field: "id",
                    operator: "eq",
                    value: row.id,
                  },
                ],
              }}
              invalidateTag="ENROLLMENTS"
            />

            <CButton
              iconButton
              action="edit"
              component={Link}
              href={`/admin/enrollments/${row.id}`}
            />
          </Stack>
        ),
    },
  ]

  return <CDataTable columns={columns} rows={data} meta={meta} loading={isLoading} />
}

export default function Page() {
  return (
    <ModuleContainer breadcrumbs={breadcrumbs} action={<CreateDialog />}>
      <Suspense fallback={<CPageLoader fullPage={false} />}>
        <EnrollmentList />
      </Suspense>
    </ModuleContainer>
  )
}
