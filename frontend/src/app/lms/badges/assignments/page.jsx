"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Stack, Avatar, Typography, Box } from "@mui/material";
import dayjs from "dayjs";
import { toast } from "react-toastify";

import CPageLoader from "@/components/ui/CPageLoader";
import CDataTable from "@/components/table/CDatatable";
import CDelete from "@/components/actions/CDelete";
import CButton from "@/components/ui/CButton";
import { renderCell } from "@/utils/tableTools";
import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CAutocomplete from "@/components/form/CAutocomplete";

import { useLazyReadBadgeAssignmentsQuery, useAssignBadgeMutation, useLazyReadBadgesQuery } from "@/features/badge/badgeApi";
import { useGetUsersQuery } from "@/features/user/userAPI";


import CModuleLayout from "@/components/ui/CModuleLayout";
import { BADGE_TIPS } from "@/choices/helpTips/badge";


function AssignDialog() {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const [assign, { isLoading: isAssigning }] = useAssignBadgeMutation();
  const [triggerBadges, { data: badgesData }] = useLazyReadBadgesQuery();
  const { data: usersData } = useGetUsersQuery();
  const studentsData = usersData;
  
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
      if(open) {
          triggerBadges({ page: 1, limit: 100, is_active: true });
      }
  }, [open, triggerBadges]);

  const handleAssign = async () => {
      if(!selectedBadge || !selectedStudent) {
          toast.error("Please select a badge and a student.");
          return;
      }
      try {
        await assign({ badge_public_id: selectedBadge.public_id, member_public_id: selectedStudent.public_id }).unwrap();
        toast.success("Badge assigned successfully");
        setSelectedBadge(null);
        setSelectedStudent(null);
        handleClose();
      } catch (error) {
        toast.error(error?.data?.message || "Assignment failed.");
      }
  };

  return (
    <CDialog
      title="Assign Badge"
      btnProps={{ label: "Assign Badge", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm width="40rem" btnProps={{ loading: isAssigning, label: "Assign" }} dialog onSubmit={(e) => { e.preventDefault(); handleAssign(); }}>
        <Stack spacing={3}>
           <CAutocomplete
              label="Select Badge"
              options={badgesData?.data || []}
              getOptionLabel={(option) => option.title}
              value={selectedBadge}
              onChange={(_, newValue) => setSelectedBadge(newValue)}
           />
           <CAutocomplete
              label="Select Student"
              options={studentsData?.data || []}
              getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.email})`}
              value={selectedStudent}
              onChange={(_, newValue) => setSelectedStudent(newValue)}
           />
        </Stack>
      </CForm>
    </CDialog>
  );
}

function AssignmentList({ action }) {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ?? 1;

  const [trigger, { data: { data, meta } = {}, isLoading }] = useLazyReadBadgeAssignmentsQuery();

  useEffect(() => {
    trigger({ page });
  }, [page, trigger]);

  if (isLoading) return <CPageLoader fullPage={false} />;

  const columns = [
    {
      field: "badge",
      headerName: "Badge",
      flex: 1,
      renderCell: (row) => renderCell(
          <Box display="flex" alignItems="center" gap={1}>
              <Avatar src={row.value?.image || ""} variant="rounded" sx={{ width: 24, height: 24 }} />
              <Typography variant="body2">{row.value?.title}</Typography>
          </Box>
      ),
    },
    {
      field: "member",
      headerName: "Student",
      flex: 1.5,
      renderCell: (row) => renderCell(
        <Box display="flex" flexDirection="column">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.value ? `${row.value.first_name} ${row.value.last_name}` : "Unknown"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.value?.email || ""}
          </Typography>
        </Box>
      ),
    },
    {
      field: "created_at",
      headerName: "Assigned On",
      flex: 1,
      renderCell: (row) => renderCell(dayjs(row.value).format("MMM DD, YYYY")),
    },
  ];

  return <CDataTable columns={columns} rows={data} meta={meta} loading={isLoading} action={action} bulkDelete={{ model: "BadgeAssignment", invalidateTag: "BADGES" }} />;
}

export default function BadgeAssignmentsPage() {
  return (
    <CModuleLayout helpTips={BADGE_TIPS.list}>
      <Suspense fallback={<CPageLoader fullPage={false} />}>
        <AssignmentList action={<AssignDialog />} />
      </Suspense>
    </CModuleLayout>
  );
}
