"use client"
import React, { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLazyReadReviewsQuery } from "@/features/review/reviewAPI"
import { useReadCourseQuery } from "@/features/course/courseAPI"
import CDataTable from "@/components/table/CDatatable"
import { formatDate } from "@/utils/cdayjs"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import { Box, Avatar, Typography, Rating } from "@mui/material"
import CModuleLayout from "@/components/ui/CModuleLayout"
import { useParams } from "next/navigation"
import { REVIEW_TIPS } from "@/choices/helpTips/review"
import { Star, InfoOutlined, AssignmentTurnedInOutlined, MenuBookOutlined, DashboardOutlined, VisibilityOutlined } from "@mui/icons-material"
import CreateDialog from "./_parts/CreateDialog"
import PermissionGuard from "@/components/ui/PermissionGuard"

export default function Page() {
  const { id: courseId } = useParams()
  const searchParams = useSearchParams()
  const page = searchParams.get("page") ?? 1

  const { data: { data: courseData } = {} } = useReadCourseQuery({ id: courseId }, { skip: !courseId })
  const [trigger, { data: { data, meta } = {}, isLoading, isError }] = useLazyReadReviewsQuery()

  useEffect(() => {
    if (courseId) {
      trigger({ page, course_id: courseId })
    }
  }, [page, trigger, courseId])

  if (isLoading) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  const columns = [
    {
      field: "student",
      headerName: "Student",
      flex: 1.8,
      renderCell: ({ row }) => {
        const student = row.student
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
            <Avatar src={student?.avatar} sx={{ width: 36, height: 36, fontSize: "0.85rem", bgcolor: "primary.main" }}>
              {student?.first_name?.[0]}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} color="text.primary" noWrap>
                {student ? `${student.first_name} ${student.last_name}` : "Unknown"}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {student?.email || "—"}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      field: "rating",
      headerName: "Rating",
      flex: 1.2,
      renderCell: ({ value }) => (
        <Rating value={value} readOnly size="small" precision={0.5} />
      ),
    },
    {
      field: "body",
      headerName: "Comment",
      flex: 3,
      renderCell: ({ value }) => (
        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "normal", wordBreak: "break-word", py: 1 }}>
          {value || <span style={{ color: "text.disabled", fontStyle: "italic" }}>No comment provided</span>}
        </Typography>
      ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1.2,
      renderCell: ({ value }) => value && formatDate(value),
    },
  ]

  const navigators = [
    { label: "Details", href: `/lms/courses/${courseId}`, icon: <InfoOutlined />, resource: "course", action: "read" },
    { label: "Chapters", href: `/lms/courses/${courseId}/chapters`, icon: <MenuBookOutlined />, resource: "chapter", action: "read" },
    { label: "Reviews", href: `/lms/courses/${courseId}/reviews`, icon: <Star />, resource: "review", action: "read" },
    { label: "Enrollments", href: `/lms/courses/${courseId}/enrollments`, icon: <AssignmentTurnedInOutlined />, resource: "enrollment", action: "read" },
    { label: "Dashboard", href: `/lms/courses/${courseId}/dashboard`, icon: <DashboardOutlined />, resource: "course", action: "read" },
    { label: "Preview", href: `/courses/${courseData?.slug || ""}`, target: "_blank", icon: <VisibilityOutlined />, resource: "course", action: "read" },
  ]

  return (
    <CModuleLayout 
      navigators={navigators}
      helpTips={REVIEW_TIPS.list}
    >
      <Box sx={{ width: "100%" }}>
        <Box sx={{ bgcolor: "background.paper" }}>
          <CDataTable 
            columns={columns} 
            rows={data} 
            meta={meta} 
            loading={isLoading} 
            action={
              <PermissionGuard resource="review" action="create" silent>
                <CreateDialog courseId={courseId} />
              </PermissionGuard>
            }
          />
        </Box>
      </Box>
    </CModuleLayout>
  )
}
