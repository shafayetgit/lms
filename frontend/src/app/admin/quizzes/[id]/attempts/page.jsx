"use client"
import React, { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLazyReadQuizAttemptsQuery } from "@/features/quizAttempt/quizAttemptAPI"
import CDataTable from "@/components/table/CDatatable"
import { formatDate } from "@/utils/cdayjs"
import { renderCell } from "@/utils/tableTools"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import ModuleContainer from "@/components/ui/ModuleContainer"

import { Chip } from "@mui/material"
import { useParams } from "next/navigation"

export default function Page() {
  const { id: quizId } = useParams()
  const searchParams = useSearchParams()
  const page = searchParams.get("page") ?? 1

  const [trigger, { data: { data, meta } = {}, isLoading, isError }] = useLazyReadQuizAttemptsQuery()

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

  const breadcrumbs = [
    { label: "Dashboard", path: "/" },
    { label: "Quizzes", path: "/admin/quizzes" },
    { label: "Questions", path: `/admin/quizzes/${quizId}/questions` },
    { label: "Attempts", path: "" },
  ]

  return (
    <ModuleContainer breadcrumbs={breadcrumbs}>
      <CDataTable columns={columns} rows={data} meta={meta} loading={isLoading} />
    </ModuleContainer>
  )
}
