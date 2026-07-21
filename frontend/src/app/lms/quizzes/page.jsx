"use client"
import React, { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLazyReadQuizzesQuery } from "@/features/quiz/quizAPI"
import CDataTable from "@/components/table/CDatatable"
import { formatDate } from "@/utils/cdayjs"
import { renderCell } from "@/utils/tableTools"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import CreateDialog from "./_parts/CreateDialog"
import { Chip } from "@mui/material"
import Link from "next/link"
import { QUIZ_TIPS } from "@/choices/helpTips/quiz"

import PermissionGuard from "@/components/ui/PermissionGuard"

export default function Page() {
  const searchParams = useSearchParams()
  const term = searchParams.get("term") ?? ""
  const page = searchParams.get("page") ?? 1

  const [trigger, { data: { data, meta } = {}, isLoading, isError }] = useLazyReadQuizzesQuery()

  useEffect(() => {
    trigger({ page, term })
  }, [page, term, trigger])

  if (isLoading) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  const columns = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      renderCell: ({ value, row }) => (
        <Link
          href={`/lms/quizzes/${row.public_id}`}
          style={{ textDecoration: "none", color: "inherit", fontWeight: "600" }}
        >
          {value}
        </Link>
      ),
    },
    {
      field: "duration",
      headerName: "Duration (min)",
      width: 150,
      renderCell: ({ value }) => value || "No Limit",
    },
    {
      field: "passing_percentage",
      headerName: "Passing Score",
      width: 150,
      renderCell: ({ value }) => `${value}%`,
    },
    {
      field: "is_active",
      headerName: "Status",
      width: 120,
      renderCell: ({ value }) => (
        <Chip
          label={value ? "Active" : "Inactive"}
          color={value ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      width: 150,
      renderCell: ({ value }) => value && formatDate(value),
    },
  ]

  return (
    <CModuleLayout helpTips={QUIZ_TIPS.list}>
      <CDataTable
        columns={columns}
        rows={data}
        meta={meta}
        loading={isLoading}
        action={
          <PermissionGuard resource="quiz" action="create" silent>
            <CreateDialog />
          </PermissionGuard>
        }
        deleteData={{ model: "Quiz", invalidateTag: "QUIZZES" }}
      />
    </CModuleLayout>
  )
}
