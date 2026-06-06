"use client"
import React, { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLazyReadReviewsQuery, useUpdateReviewMutation } from "@/features/review/reviewAPI"
import CDataTable from "@/components/table/CDatatable"
import { formatDate } from "@/utils/cdayjs"
import { renderCell } from "@/utils/tableTools"
import CDelete from "@/components/actions/CDelete"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import ModuleContainer from "@/components/ui/ModuleContainer"
import { Stack, Rating, Switch } from "@mui/material"
import { toast } from "react-toastify"
import CourseLayout from "../_components/CourseLayout"
import Navigation from "../_components/Navigation"
import { useParams } from "next/navigation"

export default function Page() {
  const { id: courseId } = useParams()
  const searchParams = useSearchParams()
  const page = searchParams.get("page") ?? 1

  const [trigger, { data: { data, meta } = {}, isLoading, isError }] = useLazyReadReviewsQuery()
  const [updateReview] = useUpdateReviewMutation()

  useEffect(() => {
    if (courseId) {
      trigger({ page, course_id: courseId })
    }
  }, [page, trigger, courseId])

  if (isLoading) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  const columns = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.5,
    },
    {
      field: "course_id",
      headerName: "Course ID",
      flex: 1,
    },
    {
      field: "student_id",
      headerName: "Student ID",
      flex: 1,
    },
    {
      field: "rating",
      headerName: "Rating",
      flex: 1.5,
      renderCell: ({ value }) => (
        <Rating value={value} readOnly size="small" />
      ),
    },
    {
      field: "is_active",
      headerName: "Active",
      flex: 0.8,
      renderCell: ({ value, row }) => (
        <Switch
          checked={value}
          onChange={async (e) => {
            const checked = e.target.checked
            try {
              await updateReview({ id: row.id, body: { is_active: checked } }).unwrap()
              toast.success(`Review ${checked ? 'activated' : 'deactivated'} successfully`)
            } catch (err) {
              toast.error("Failed to update review status")
            }
          }}
          size="small"
        />
      ),
    },
    {
      field: "created_at",
      headerName: "Created At",
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
                model: "Review",
                filters: [
                  {
                    field: "id",
                    operator: "eq",
                    value: row.id,
                  },
                ],
              }}
              invalidateTag="REVIEWS"
            />
          </Stack>
        ),
    },
  ]

  const breadcrumbs = [
    { label: "Dashboard", path: "/" },
    { label: "Courses", path: "/admin/courses" },
    { label: "Update", path: `/admin/courses/${courseId}` },
    { label: "Reviews", path: "" },
  ]

  return (
    <CourseLayout Navigation={<Navigation />}>
      <ModuleContainer breadcrumbs={breadcrumbs}>
        <CDataTable columns={columns} rows={data} meta={meta} loading={isLoading} />
      </ModuleContainer>
    </CourseLayout>
  )
}
