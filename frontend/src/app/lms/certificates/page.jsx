"use client";
import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Stack, Box, Grid, Typography } from "@mui/material";
import Link from "next/link";
import dayjs from "dayjs";

import CPageLoader from "@/components/ui/CPageLoader";
import CDataTable from "@/components/table/CDatatable";
import CButton from "@/components/ui/CButton";
import { renderCell } from "@/utils/tableTools";
import CModuleLayout from "@/components/ui/CModuleLayout";

import { useLazyReadCertificatesQuery } from "@/features/certificate/certificateApi";
import CreateDialog from "./_parts/CreateDialog";


function CertificateList({ action }) {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ?? 1;

  const [trigger, { data: { data, meta } = {}, isLoading }] = useLazyReadCertificatesQuery();

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
          href={`/lms/certificates/${row.public_id}`}
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
      field: "issue_date",
      headerName: "Issued On",
      flex: 1,
      renderCell: ({ value }) => renderCell(value ? dayjs(value).format("MMM DD, YYYY") : "N/A"),
    },
    {
      field: "published",
      headerName: "Status",
      flex: 1,
      renderCell: ({ value }) => renderCell(value ? "Published" : "Draft"),
    },
  ];

  return <CDataTable columns={columns} rows={data} meta={meta} loading={isLoading}  action={action}  bulkDelete={{ model: "Certificate", invalidateTag: "CERTIFICATES" }} />;
}

export default function CertificatesPage() {
  const helpTips = {
    description: "Review and manage all issued academic certificates.",
    tips: [
      {
        title: "Published Status",
        description: "The certificate is publicly verifiable by anyone with the link.",
      },
      {
        title: "Draft Status",
        description: "The certificate is only visible to instructors and system administrators.",
      },
      {
        title: "Template Reference",
        description: "Certs use predefined HTML/PDF templates configured globally for customization.",
      },
    ],
  };

  return (
    <CModuleLayout helpTips={helpTips}>
      <Suspense fallback={<CPageLoader fullPage={false} />}>
        <CertificateList action={<CreateDialog />} />
      </Suspense>
    </CModuleLayout>
  );
}
