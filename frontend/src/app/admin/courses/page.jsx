"use client";
import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLazyReadCoursesQuery } from "@/features/course/courseAPI";
import CDataTable from "@/components/table/CDatatable";
import Image from "next/image";
import { COURSE_DEFAULT_IMAGE } from "@/lib/constants";
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

const breadcrumbs = [
  { label: "Dashboard", path: "/" },
  { label: "Courses", path: "/admin/courses" },
];

function CourseList() {
  const searchParams = useSearchParams();
  const term = searchParams.get("term") ?? "";
  const page = searchParams.get("page") ?? 1;

  const [trigger, { data: { data, meta } = {}, isLoading, isError }] =
    useLazyReadCoursesQuery();

  useEffect(() => {
    trigger({ page, term });
  }, [page, term, trigger]);

  if (isLoading) return <CPageLoader fullPage={false} />;
  if (isError) return <CError fullPage={false} />;

  const columns = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
    },
    {
      field: "level",
      headerName: "Level",
      flex: 1,
      renderCell: ({ value }) => (
        <Chip label={value} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
      )
    },
    {
      field: "badge",
      headerName: "Badge",
      flex: 1,
      renderCell: ({ value }) => (
        <Chip 
          label={value || "None"} 
          size="small" 
          color={value === "featured" ? "primary" : "default"}
          sx={{ textTransform: 'capitalize' }} 
        />
      )
    },
    {
      field: "price",
      headerName: "Price",
      flex: 1,
      renderCell: (row) => row.row.is_free ? "Free" : `$${row.value || 0}`,
    },
    {
      field: "thumbnail",
      headerName: "Thumbnail",
      flex: 1,
      renderCell: ({ value }) => (
        <Image
          src={value || COURSE_DEFAULT_IMAGE}
          alt="image"
          width={50}
          height={50}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
        />
      ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      renderCell: ({ value }) => value && formatDate(value),
    },
    {
      field: "Actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (row) =>
        renderCell(
          <Stack direction="row" spacing={1}>
            <CDelete
              values={{
                model: "Course",
                filters: [
                  {
                    field: "id",
                    operator: "eq",
                    value: row.id,
                  },
                ],
              }}
              invalidateTag="COURSES"
            />
            <CButton
              iconButton
              action="edit"
              component={Link}
              href={`/admin/courses/${row.id}`}
            />
          </Stack>,
        ),
    },
  ];

  return <CDataTable columns={columns} rows={data} meta={meta} loading={isLoading} />;
}

export default function Page() {
  return (
    <ModuleContainer breadcrumbs={breadcrumbs} action={<CreateDialog />}>
      <Suspense fallback={<CPageLoader fullPage={false} />}>
        <CourseList />
      </Suspense>
    </ModuleContainer>
  );
}
