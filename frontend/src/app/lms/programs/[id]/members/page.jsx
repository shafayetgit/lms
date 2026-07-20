"use client";
import React from "react";
import { Box } from "@mui/material";
import { InfoOutlined, SchoolOutlined, AssignmentTurnedInOutlined } from "@mui/icons-material";
import { useParams } from "next/navigation";

import CPageLoader from "@/components/ui/CPageLoader";
import CDataTable from "@/components/table/CDatatable";
import CModuleLayout from "@/components/ui/CModuleLayout";
import { PROGRAM_TIPS } from "@/choices/helpTips/program";
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb";

import {
  useReadProgramQuery,
  useReadProgramMembersQuery,
} from "@/features/program/programApi";
import PermissionGuard from "@/components/ui/PermissionGuard";

export default function ProgramMembersPage() {
  const { id } = useParams();

  const { data: { data: programDataObj } = {}, isLoading: isLoadingProgram } = useReadProgramQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: !id,
  });

  useSetBreadcrumb(programDataObj?.title, `/lms/programs/${id}`);

  const { data: { data: membersList } = {}, isLoading: isLoadingMembers } = useReadProgramMembersQuery(id, {
    skip: !id,
  });

  if (isLoadingProgram) return <CPageLoader fullPage={false} />;

  const memberColumns = [
    {
      field: "member",
      headerName: "Member Name",
      flex: 2,
      valueGetter: (value, row) => {
        const first = row.member?.first_name || "";
        const last = row.member?.last_name || "";
        return `${first} ${last}`.trim() || row.member?.username || "Unknown Student";
      },
    },
    {
      field: "email",
      headerName: "Email",
      flex: 2,
      valueGetter: (value, row) => row.member?.email || "-",
    },
    {
      field: "progress",
      headerName: "Progress",
      flex: 1,
      renderCell: (params) => {
        return `${params.row.progress}%`;
      },
    },
  ];

  const navigators = [
    { label: "Details", href: `/lms/programs/${id}`, icon: <InfoOutlined />, resource: "program", action: "read" },
    { label: "Courses", href: `/lms/programs/${id}/courses`, icon: <SchoolOutlined />, resource: "program", action: "read" },
    { label: "Members", href: `/lms/programs/${id}/members`, icon: <AssignmentTurnedInOutlined />, resource: "program", action: "read" },
  ];

  return (
    <PermissionGuard resource="program" action="read">
      <CModuleLayout navigators={navigators} helpTips={PROGRAM_TIPS.details}>
        <Box sx={{ mt: 1 }}>
          <CDataTable
            columns={memberColumns}
            rows={membersList || []}
            loading={isLoadingMembers}
            disableRowSelectionOnClick
          />
        </Box>
      </CModuleLayout>
    </PermissionGuard>
  );
}
