"use client"
import React, { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLazyReadQuizSubmissionsQuery } from "@/features/quizSubmission/quizSubmissionAPI"
import { useReadQuizQuery } from "@/features/quiz/quizAPI"
import CDataTable from "@/components/table/CDatatable"
import { formatDate } from "@/utils/cdayjs"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import PermissionGuard from "@/components/ui/PermissionGuard"
import { Chip } from "@mui/material"
import { useParams } from "next/navigation"
import { InfoOutlined, Quiz, Assignment } from "@mui/icons-material"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"
import { QUIZ_TIPS } from "@/choices/helpTips/quiz"

export default function Page() {
  const { id: quizId } = useParams()
  const searchParams = useSearchParams()
  const page = searchParams.get("page") ?? 1

  const { data: quizData } = useReadQuizQuery({ id: quizId }, { skip: !quizId })
  useSetBreadcrumb(quizData?.data?.title, `/lms/quizzes/${quizId}`)
  const [trigger, { data: { data, meta } = {}, isLoading, isError }] = useLazyReadQuizSubmissionsQuery()

  useEffect(() => {
    if (quizId) {
      trigger({ page, quiz_id: quizId })
    }
  }, [page, trigger, quizId])

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
      flex: 0.8,
    },
    {
      field: "score",
      headerName: "Score",
      flex: 1,
      renderCell: ({ row }) => (
        <span>{row.score} / {row.total_points}</span>
      ),
    },
    {
      field: "percentage",
      headerName: "Percentage",
      flex: 1,
      renderCell: ({ value }) => `${value?.toFixed(2)}%`,
    },
    {
      field: "is_passed",
      headerName: "Passed",
      flex: 0.8,
      renderCell: ({ value }) => (
        <Chip 
          label={value ? "Yes" : "No"} 
          color={value ? "success" : "error"} 
          size="small" 
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: ({ value }) => {
        const getStatusColor = (status) => {
          switch (status) {
            case "completed": return "success";
            case "in_progress": return "warning";
            case "timed_out": return "error";
            default: return "default";
          }
        };
        return (
          <Chip
            label={value.replace("_", " ").toUpperCase()}
            color={getStatusColor(value)}
            size="small"
            variant="outlined"
          />
        );
      }
    },
    {
      field: "start_time",
      headerName: "Started",
      flex: 1.2,
      renderCell: ({ value }) => value && formatDate(value),
    },
    {
      field: "end_time",
      headerName: "Completed",
      flex: 1.2,
      renderCell: ({ value }) => value && formatDate(value),
    },
  ]

  const navigators = [
    { label: "Details", href: `/lms/quizzes/${quizId}`, icon: <InfoOutlined />, resource: "quiz", action: "read" },
    { label: "Questions", href: `/lms/quizzes/${quizId}/questions`, icon: <Quiz />, resource: "question", action: "read" },
    { label: "Submissions", href: `/lms/quizzes/${quizId}/submissions`, icon: <Assignment />, resource: "quiz_submission", action: "read" },
  ]
  
  return (
    <PermissionGuard resource="quiz_submission" action="read">
      <CModuleLayout
        navigators={navigators}
        helpTips={QUIZ_TIPS.details}
      >
        <CDataTable columns={columns} rows={data} meta={meta} loading={isLoading} />
      </CModuleLayout>
    </PermissionGuard>
  )
}
