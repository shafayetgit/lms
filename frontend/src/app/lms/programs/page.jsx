"use client"
import React, { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLazyReadProgramsQuery } from "@/features/program/programApi"
import CDataTable from "@/components/table/CDatatable"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import CreateDialog from "./_parts/CreateDialog"
import { Chip } from "@mui/material"
import Link from "next/link"
import { PROGRAM_TIPS } from "@/choices/helpTips/program"
import PermissionGuard from "@/components/ui/PermissionGuard"

export default function Page() {
  const searchParams = useSearchParams()
  const term = searchParams.get("term") ?? ""
  const page = searchParams.get("page") ?? 1

  const [trigger, { data: { data, meta } = {}, isLoading, isError }] = useLazyReadProgramsQuery()

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
          href={`/lms/programs/${row.public_id}`}
          style={{ textDecoration: "none", color: "inherit", fontWeight: "600" }}
        >
          {value}
        </Link>
      ),
    },
    {
      field: "course_count",
      headerName: "Courses",
      flex: 1,
    },
    {
      field: "member_count",
      headerName: "Members",
      flex: 1,
    },
    {
      field: "published",
      headerName: "Status",
      flex: 1,
      renderCell: ({ value }) => (
        <Chip
          label={value ? "Published" : "Draft"}
          size="small"
          color={value ? "primary" : "default"}
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
  ]

  return (
    <CModuleLayout helpTips={PROGRAM_TIPS.list}>
      <CDataTable
        columns={columns}
        rows={data}
        meta={meta}
        loading={isLoading}
        action={
          <PermissionGuard resource="program" action="create" silent>
            <CreateDialog />
          </PermissionGuard>
        }
        bulkDelete={{ model: "program", invalidateTag: "PROGRAMS" }}
      />
    </CModuleLayout>
  )
}
