"use client";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLazyReadQuizzesQuery } from "@/features/quiz/quizAPI";
import CDataTable from "@/components/table/CDatatable";
import { formatDate } from "@/utils/cdayjs";
import { renderCell } from "@/utils/tableTools";
import CDelete from "@/components/actions/CDelete";
import CPageLoader from "@/components/ui/CPageLoader";
import CError from "@/components/ui/CError";
import ModuleContainer from "@/components/ui/ModuleContainer";
import CreateDialog from "./_parts/CreateDialog";
import { Stack, Chip } from "@mui/material";
import CButton from "@/components/ui/CButton";
import Link from "next/link";

import { Suspense } from "react"

const breadcrumbs = [
  { label: "Dashboard", path: "/" },
  { label: "Quizzes", path: "/admin/quizzes" },
]

function QuizList() {
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
    },
    {
      field: "course_id",
      headerName: "Course ID",
      width: 100,
    },
    {
      field: "time_limit",
      headerName: "Time Limit (min)",
      width: 150,
      renderCell: ({ value }) => value || "No Limit",
    },
    {
      field: "passing_score",
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
    {
      field: "Actions",
      headerName: "Actions",
      width: 150,
      renderCell: (row) =>
        renderCell(
          <Stack direction="row" spacing={1}>
            <CDelete
              values={{
                model: "Quiz",
                filters: [
                  {
                    field: "id",
                    operator: "eq",
                    value: row.id,
                  },
                ],
              }}
              invalidateTag="QUIZZES"
            />
            <CButton
              iconButton
              action="edit"
              component={Link}
              href={`/admin/quizzes/${row.id}`}
            />
            <CButton
              iconButton
              action="list"
              tooltip="Manage Questions"
              component={Link}
              href={`/admin/quizzes/${row.id}/questions`}
              color="info"
            />
          </Stack>,
        ),
    },
  ];

  return <CDataTable columns={columns} rows={data} meta={meta} loading={isLoading} />
}

export default function Page() {
  return (
    <ModuleContainer breadcrumbs={breadcrumbs} action={<CreateDialog />}>
      <Suspense fallback={<CPageLoader fullPage={false} />}>
        <QuizList />
      </Suspense>
    </ModuleContainer>
  );
}

