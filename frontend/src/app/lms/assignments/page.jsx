"use client";
import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import CPageLoader from "@/components/ui/CPageLoader";
import CDataTable from "@/components/table/CDatatable";
import CModuleLayout from "@/components/ui/CModuleLayout";
import PermissionGuard from "@/components/ui/PermissionGuard";
import { renderCell } from "@/utils/tableTools";
import { ASSIGNMENT_TIPS } from "@/choices/helpTips/assignment";

import { useLazyReadAssignmentsQuery } from "@/features/assignment/assignmentApi";
import CreateDialog from "./_parts/CreateDialog";


function AssignmentList() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ?? 1;

  const [trigger, { data: { data, meta } = {}, isLoading }] = useLazyReadAssignmentsQuery();

  useEffect(() => {
    trigger({ page });
  }, [page, trigger]);

  if (isLoading) return <CPageLoader fullPage={false} />;

  const columns = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      renderCell: ({ value, row }) => (
        <Link
          href={`/lms/assignments/${row.public_id}`}
          style={{ textDecoration: "none", color: "inherit", fontWeight: "600" }}
        >
          {value}
        </Link>
      ),
    },
    { field: "type", headerName: "Type", flex: 1 },
    {
      field: "grade_assignment",
      headerName: "Graded",
      flex: 1,
      renderCell: (row) => renderCell(row.value ? "Yes" : "No"),
    },
  ];

  return (
    <CDataTable
      columns={columns}
      rows={data}
      meta={meta}
      loading={isLoading}
      action={
        <PermissionGuard resource="assignment" action="create" silent>
          <CreateDialog />
        </PermissionGuard>
      }
      bulkDelete={{ model: "Assignment", invalidateTag: "ASSIGNMENTS" }}
    />
  );
}

export default function AssignmentsPage() {
  return (
    <PermissionGuard resource="assignment" action="read">
      <CModuleLayout helpTips={ASSIGNMENT_TIPS.list}>
        <Suspense fallback={<CPageLoader fullPage={false} />}>
          <AssignmentList />
        </Suspense>
      </CModuleLayout>
    </PermissionGuard>
  );
}
