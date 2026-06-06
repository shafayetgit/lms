"use client"
import React, { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLazyReadInstructorsQuery } from "@/features/instructor/instructorAPI"
import CDataTable from "@/components/table/CDatatable"
import Image from "next/image"
import { CATEGORY_DEFAULT_IMAGE } from "@/lib/constants"
import { formatDate } from "@/utils/cdayjs"
import { renderCell } from "@/utils/tableTools"
import CDelete from "@/components/actions/CDelete"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import ModuleContainer from "@/components/ui/ModuleContainer"
import CreateDialog from "./_parts/CreateDialog"

import { Stack } from "@mui/material"
import CButton from "@/components/ui/CButton"
import Link from "next/link"

import { Suspense } from "react"

const breadcrumbs = [
  { label: "Dashboard", path: "/" },
  { label: "Instructors", path: "/admin/instructors" },
]

function InstructorList() {
  const searchParams = useSearchParams()
  const term = searchParams.get("term") ?? ""
  const page = searchParams.get("page") ?? 1

  const [trigger, { data: { items, meta } = {}, isLoading, isError }] = useLazyReadInstructorsQuery()

  useEffect(() => {
    trigger({ page, term })
  }, [page, term, trigger])

  if (isLoading) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  const columns = [
    {
      field: "first_name",
      headerName: "First Name",
      flex: 1,
    },
    {
      field: "last_name",
      headerName: "Last Name",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
    },
    {
      field: "department",
      headerName: "Department",
      flex: 1,
    },
    {
      field: "avatar",
      headerName: "Avatar",
      flex: 1,
      renderCell: ({ value }) => (
        <Image src={value || CATEGORY_DEFAULT_IMAGE} alt="image" width={50} height={50} />
      ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
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
                model: "Instructor",
                filters: [
                  {
                    field: "id",
                    operator: "eq",
                    value: row.id,
                  },
                ],
              }}
              invalidateTag="INSTRUCTORS"
            />

            <CButton
              iconButton
              action="edit"
              component={Link}
              href={`/admin/instructors/${row.id}`}
            />
          </Stack>
        ),
    },
  ]

  return <CDataTable columns={columns} rows={items} meta={meta} loading={isLoading} />
}

export default function Page() {
  return (
    <ModuleContainer breadcrumbs={breadcrumbs} action={<CreateDialog />}>
      <Suspense fallback={<CPageLoader fullPage={false} />}>
        <InstructorList />
      </Suspense>
    </ModuleContainer>
  )
}
