"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { InfoOutlined, Assignment as AssignmentIcon } from "@mui/icons-material";
import { Chip } from "@mui/material";

import CDataTable from "@/components/table/CDatatable";
import CPageLoader from "@/components/ui/CPageLoader";
import CError from "@/components/ui/CError";
import CModuleLayout from "@/components/ui/CModuleLayout";
import PermissionGuard from "@/components/ui/PermissionGuard";
import CButton from "@/components/ui/CButton";
import { formatDate } from "@/utils/cdayjs";
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb";
import { ASSIGNMENT_TIPS } from "@/choices/helpTips/assignment";
import GradeSubmissionDialog from "./_parts/GradeSubmissionDialog";

import { useReadAssignmentQuery, useGetSubmissionsQuery } from "@/features/assignment/assignmentApi";

export default function AssignmentSubmissionsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ?? 1;

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: assignmentRes } = useReadAssignmentQuery(id, { skip: !id });
  const assignmentData = assignmentRes?.data || assignmentRes;
  useSetBreadcrumb(assignmentData?.title, `/lms/assignments/${id}`);

  const { data: submissionsRes, isLoading, isError } = useGetSubmissionsQuery({
    id,
    params: { page },
  }, { skip: !id });

  const rows = submissionsRes?.data || [];
  const meta = submissionsRes?.meta;

  const handleOpenReview = (row) => {
    setSelectedSubmission(row);
    setDialogOpen(true);
  };

  const handleCloseReview = () => {
    setSelectedSubmission(null);
    setDialogOpen(false);
  };

  if (isLoading) return <CPageLoader fullPage={false} />;
  if (isError) return <CError fullPage={false} />;

  const columns = [
    {
      field: "member",
      headerName: "Student",
      flex: 1.5,
      renderCell: ({ row }) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.member?.full_name || "Unknown Student"}</div>
          <div style={{ fontSize: "0.8rem", color: "gray" }}>{row.member?.email}</div>
        </div>
      ),
    },
    { field: "grade", headerName: "Grade", flex: 0.6, renderCell: ({ value }) => value ?? "N/A" },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: ({ value }) => {
        let color = "warning";
        if (value === "Accepted") color = "success";
        if (value === "Rejected") color = "error";
        return (
          <Chip
            label={value || "Pending"}
            color={color}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: "created_at",
      headerName: "Submitted At",
      flex: 1,
      renderCell: ({ value }) => value && formatDate(value),
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 0.8,
      renderCell: ({ row }) => (
        <CButton
          size="small"
          variant="outlined"
          label="Review"
          onClick={() => handleOpenReview(row)}
        />
      ),
    },
  ];

  const navigators = [
    { label: "Details", href: `/lms/assignments/${id}`, icon: <InfoOutlined />, resource: "assignment", action: "read" },
    { label: "Submissions", href: `/lms/assignments/${id}/submissions`, icon: <AssignmentIcon />, resource: "assignment", action: "read" },
  ];

  return (
    <PermissionGuard resource="assignment" action="read">
      <CModuleLayout navigators={navigators} helpTips={ASSIGNMENT_TIPS.details}>
        <CDataTable columns={columns} rows={rows} meta={meta} loading={isLoading} checkboxSelection={false} />
        {dialogOpen && (
          <GradeSubmissionDialog
            open={dialogOpen}
            handleClose={handleCloseReview}
            submission={selectedSubmission}
            assignment={assignmentData}
          />
        )}
      </CModuleLayout>
    </PermissionGuard>
  );
}
