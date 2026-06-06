"use client";
import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLazyReadCategoriesQuery } from "@/features/category/categoryAPI";
import CDataTable from "@/components/table/CDatatable";
import Image from "next/image";
import { CATEGORY_DEFAULT_IMAGE } from "@/lib/constants";
import { formatDate } from "@/utils/cdayjs";
import { renderCell } from "@/utils/tableTools";
import CDelete from "@/components/actions/CDelete";
import CPageLoader from "@/components/ui/CPageLoader";
import CError from "@/components/ui/CError";
import ModuleContainer from "@/components/ui/ModuleContainer";
import CreateDialog from "./_parts/CreateDialog";

const breadcrumbs = [
  { label: "Dashboard", path: "/" },
  { label: "Categories", path: "/admin/categories" },
];

import { Stack } from "@mui/material";
import CButton from "@/components/ui/CButton";
import Link from "next/link";

function CategoryList() {
  const searchParams = useSearchParams()
  const term = searchParams.get("term") ?? ""
  const page = searchParams.get("page") ?? 1

  const [trigger, { data: { data, meta } = {}, isLoading, isError }] = useLazyReadCategoriesQuery()

  useEffect(() => {
    trigger({ page, term })
  }, [page, term, trigger])

  if (isLoading) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "slug",
      headerName: "Slug",
      flex: 1,
    },

    {
      field: "thumbnail",
      headerName: "Thumbnail",
      flex: 1,
      renderCell: ({ value }) => (
        <Image
          src={value || CATEGORY_DEFAULT_IMAGE}
          alt="image"
          width={50}
          height={50}
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
                model: "Category",
                filters: [
                  {
                    field: "id",
                    operator: "eq",
                    value: row.id,
                  },
                ],
              }}
              invalidateTag="CATEGORIES"
            />

            <CButton
              iconButton
              action="edit"
              component={Link}
              href={`/admin/categories/${row.id}`}
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
        <CategoryList />
      </Suspense>
    </ModuleContainer>
  );
}
