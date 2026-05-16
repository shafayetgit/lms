"use client";
import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLazyListQuery } from "@/features/category/categoryAPI";
import CDataTable from "@/components/ui/table/CDatatable";
import Image from "next/image";
import { CATEGORY_DEFAULT_IMAGE } from "@/lib/constants";
import { formatDate } from "@/utils/cdayjs";
import { renderCell } from "@/utils/tableTools";
import CDelete from "@/components/actions/CDelete";

function CategoriesContent() {
  const searchParams = useSearchParams();
  const term = searchParams.get("term") ?? "";
  const page = searchParams.get("page") ?? 1;

  const [trigger, { data: { items, meta } = {}, isLoading, isError }] =
    useLazyListQuery();

  useEffect(() => {
    trigger({ page, term });
  }, [page, term, trigger]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Something went wrong.</div>;

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
      field: "createdAt",
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
          />,
        ),
    },
  ];

  return (
    <CDataTable
      columns={columns}
      rows={items}
      meta={meta}
      loading={isLoading}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading categories...</div>}>
      <CategoriesContent />
    </Suspense>
  );
}
