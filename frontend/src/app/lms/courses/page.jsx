"use client"
import React, { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLazyReadCoursesQuery } from "@/features/course/courseAPI"
import CDataTable from "@/components/table/CDatatable"
import Image from "next/image"
import { COURSE_DEFAULT_IMAGE } from "@/lib/constants"
import { formatDate } from "@/utils/cdayjs"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import CreateDialog from "./_parts/CreateDialog"
import { Box, Chip } from "@mui/material"
import Link from "next/link"
import { COURSE_TIPS } from "@/choices/helpTips/course"
import PermissionGuard from "@/components/ui/PermissionGuard"
import { getGradient } from "@/utils/shared"

export default function Page() {
  const searchParams = useSearchParams()
  const term = searchParams.get("term") ?? ""
  const page = searchParams.get("page") ?? 1

  const [trigger, { data: { data, meta } = {}, isLoading, isError }] = useLazyReadCoursesQuery()

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
          href={`/lms/courses/${row.public_id}`}
          style={{ textDecoration: "none", color: "inherit", fontWeight: "600" }}
        >
          {value}
        </Link>
      ),
    },

    {
      field: "course_price",
      headerName: "Price",
      flex: 1,
      renderCell: ({ row }) => {
        const isFree = !row.paid_course
        const currencySymbol = row.currency === "BDT" ? "৳" : row.currency || "$"
        return isFree
          ? "Free"
          : `${currencySymbol} ${Number(row.course_price || 0).toLocaleString()}`
      },
    },
    {
      field: "thumbnail",
      headerName: "Thumbnail",
      flex: 1,
      renderCell: ({ row }) =>
        row.thumbnail ? (
          <Image
            src={row.thumbnail}
            alt="image"
            width={50}
            height={50}
            style={{ objectFit: "cover", borderRadius: "4px" }}
          />
        ) : (
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: "4px",
              backgroundImage: getGradient(row.card_gradient),
            }}
          />
        ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      renderCell: ({ value }) => value && formatDate(value),
    },
  ]

  return (
    <CModuleLayout helpTips={COURSE_TIPS.list}>
      <CDataTable
        columns={columns}
        rows={data}
        meta={meta}
        loading={isLoading}
        action={
          <PermissionGuard resource="course" action="create" silent>
            <CreateDialog />
          </PermissionGuard>
        }
        bulkDelete={{ model: "Course", invalidateTag: "COURSES" }}
      />
    </CModuleLayout>
  )
}
