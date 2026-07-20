"use client";
import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Chip } from "@mui/material";
import Link from "next/link";
import dayjs from "dayjs";
import { toast } from "react-toastify";

import CPageLoader from "@/components/ui/CPageLoader";
import CDataTable from "@/components/table/CDatatable";
import CDelete from "@/components/actions/CDelete";
import CModuleLayout from "@/components/ui/CModuleLayout";
import { renderCell } from "@/utils/tableTools";

import { useLazyReadCouponsQuery } from "@/features/payment/paymentApi";
import { COUPON_TIPS } from "@/choices/helpTips/coupon";
import CreateDialog from "./_parts/CreateDialog";

// Display list of coupons with pagination and actions
function CouponList() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ?? 1;

  const [trigger, { data: { data, meta } = {}, isLoading }] = useLazyReadCouponsQuery();

  useEffect(() => {
    trigger({ page });
  }, [page, trigger]);

  const columns = [
    {
      field: "code",
      headerName: "Code",
      flex: 1,
      renderCell: ({ value, row }) => (
        <Link
          href={`/lms/payments/coupons/${row.id}`}
          style={{ textDecoration: "none", color: "inherit", fontWeight: "600" }}
        >
          {value}
        </Link>
      ),
    },
    {
      field: "discount",
      headerName: "Discount",
      flex: 1,
      renderCell: (row) => renderCell(`${row.discount}${row.type === "Percent" ? "%" : ""}`),
    },
    {
      field: "validity",
      headerName: "Valid Until",
      flex: 1,
      renderCell: (row) => renderCell(row.value ? dayjs(row.value).format("MMM DD, YYYY") : "Never"),
    },
    {
      field: "uses",
      headerName: "Uses",
      flex: 1,
      renderCell: (row) => renderCell(`${row.used_count} / ${row.max_uses ?? "∞"}`),
    },
    {
      field: "is_active",
      headerName: "Status",
      flex: 1,
      renderCell: (row) => renderCell(<Chip label={row.value ? "Active" : "Inactive"} color={row.value ? "success" : "default"} size="small" />),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: ({ row }) => (
        <CDelete
          values={{
            model: "Coupon",
            filters: [{ field: "public_id", operator: "in", value: [row.public_id] }],
          }}
          invalidateTag="COUPONS"
          label="Delete"
          onSuccess={() => trigger({ page })}
        />
      ),
    },
  ];

  if (isLoading) return <CPageLoader fullPage={false} />;

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <CreateDialog />
      </Box>
      <CDataTable
        columns={columns}
        rows={data}
        meta={meta}
        loading={isLoading}
        deleteData={{ model: "Coupon", invalidateTag: "COUPONS" }}
      />
    </Box>
  );
}

export default function CouponsPage() {
  return (
    <CModuleLayout helpTips={COUPON_TIPS.list}>
      <Suspense fallback={<CPageLoader fullPage={false} />}>
        <CouponList />
      </Suspense>
    </CModuleLayout>
  );
}
