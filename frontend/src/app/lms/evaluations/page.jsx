"use client";
import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import CPageLoader from "@/components/ui/CPageLoader";
import CDataTable from "@/components/table/CDatatable";
import { renderCell } from "@/utils/tableTools";
import CModuleLayout from "@/components/ui/CModuleLayout";

import { useLazyReadEvaluationsQuery } from "@/features/certificate/certificateApi";
import CreateDialog from "./_parts/CreateDialog";


function EvaluationsList({ action }) {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ?? 1;

  const [trigger, { data: { data, meta } = {}, isLoading }] = useLazyReadEvaluationsQuery();

  useEffect(() => {
    trigger({ page });
  }, [page, trigger]);

  if (isLoading) return <CPageLoader fullPage={false} />;

  const columns = [
    {
      field: "member",
      headerName: "Student",
      flex: 1.5,
      renderCell: ({ value, row }) => (
        <Link
          href={`/lms/evaluations/${row.public_id}`}
          style={{ textDecoration: "none", color: "inherit", fontWeight: "600" }}
        >
          {value?.full_name || value?.email || "Unknown Student"}
        </Link>
      ),
    },
    {
      field: "course",
      headerName: "Course/Batch",
      flex: 1.5,
      renderCell: ({ value, row }) => renderCell(value?.title || row.batch?.title || "N/A"),
    },
    {
      field: "evaluator",
      headerName: "Evaluator",
      flex: 1.2,
      renderCell: ({ value }) => renderCell(value?.full_name || "Unassigned"),
    },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "rating", headerName: "Rating", flex: 0.8 },
  ];

  return (
    <CDataTable
      columns={columns}
      rows={data}
      meta={meta}
      loading={isLoading}
      action={action}
      deleteData={{ model: "CertificateEvaluation", invalidateTag: "CERTIFICATES" }}
    />
  );
}

export default function EvaluationsPage() {
  const helpTips = {
    description: "A Certificate Evaluation is a live session where an assigned instructor/evaluator reviews and grades a student before issuing their certificate. Think of it like a viva voce or oral exam — the student doesn't just automatically get a certificate by completing a course. They go through a human review step first.",
    tips: [
      {
        title: "What is an Evaluation?",
        description: "A live session (online or in-person) where the assigned evaluator reviews the student's understanding before issuing a certificate.",
      },
      {
        title: "Grading Students",
        description: "Click on a student's name to view session details, provide feedback, and record their Pass/Fail status.",
      },
      {
        title: "Pass → Certificate Issued",
        description: "If the student passes, a certificate is automatically generated and published for them.",
      },
      {
        title: "Fail → No Certificate",
        description: "If the student fails, no certificate is issued. They may re-request when ready.",
      },
    ],
  };

  return (
    <CModuleLayout helpTips={helpTips}>
      <Suspense fallback={<CPageLoader fullPage={false} />}>
        <EvaluationsList action={<CreateDialog />} />
      </Suspense>
    </CModuleLayout>
  );
}
