"use client"
import React, { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLazyReadCategoriesQuery } from "@/features/category/categoryAPI"
import CDataTable from "@/components/table/CDatatable"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import CreateDialog from "./_parts/CreateDialog"
import { CATEGORY_TIPS } from "@/choices/helpTips/category"
import Link from "next/link"
import PermissionGuard from "@/components/ui/PermissionGuard"

export default function Page() {
  const searchParams = useSearchParams()
  const term = searchParams.get("term") ?? ""
  const page = searchParams.get("page") ?? 1

  const [trigger, { data: { data, meta } = {}, isLoading, isError }] = useLazyReadCategoriesQuery()

  useEffect(() => {
    trigger({ page, term })
  }, [page, term, trigger])

  if (isLoading) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: ({ value, row }) => (
        <Link
          href={`/lms/categories/${row.public_id}`}
          style={{ textDecoration: "none", color: "inherit", fontWeight: "600" }}
        >
          {value}
        </Link>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
    },

    {
      field: "is_active",
      headerName: "Is Active",
      flex: 1,
      renderCell: ({ value }) => (value ? "Yes" : "No"),
    },
  ]

  return (
    <CModuleLayout helpTips={CATEGORY_TIPS.list}>
      <CDataTable
        columns={columns}
        rows={data}
        meta={meta}
        loading={isLoading}
        action={
          <PermissionGuard resource="category" action="create" silent>
            <CreateDialog />
          </PermissionGuard>
        }
        deleteData={{ model: "Category", invalidateTag: "CATEGORIES" }}
      />
    </CModuleLayout>
  )
}
