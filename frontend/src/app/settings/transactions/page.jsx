"use client"
import React, { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Box, Chip } from "@mui/material"
import Link from "next/link"
import dayjs from "dayjs"

import CPageLoader from "@/components/ui/CPageLoader"
import CDataTable from "@/components/table/CDatatable"
import CModuleLayout from "@/components/ui/CModuleLayout"
import PermissionGuard from "@/components/ui/PermissionGuard"
import { renderCell } from "@/utils/tableTools"

import { useLazyReadPaymentsQuery } from "@/features/payment/paymentApi"
import { PAYMENT_TIPS } from "@/choices/helpTips/payment"
import CreateTransactionDialog from "./_parts/CreateTransactionDialog"

function TransactionList() {
  const searchParams = useSearchParams()
  const page = searchParams.get("page") ?? 1

  const [trigger, { data: { data, meta } = {}, isLoading }] = useLazyReadPaymentsQuery()

  useEffect(() => {
    trigger({ page })
  }, [page, trigger])

  if (isLoading) return <CPageLoader fullPage={false} />

  const getStatusColor = status => {
    switch (status) {
      case "Completed":
        return "success"
      case "Pending":
        return "warning"
      case "Failed":
        return "error"
      case "Refunded":
        return "default"
      default:
        return "default"
    }
  }

  const columns = [
    {
      field: "payment_id",
      headerName: "Transaction ID",
      flex: 1,
      renderCell: ({ value, row }) => (
        <Link
          href={`/settings/transactions/${row.public_id}`}
          style={{ textDecoration: "none", color: "inherit", fontWeight: "600" }}
        >
          {value || row.public_id?.substring(0, 8)}
        </Link>
      ),
    },
    {
      field: "billing_name",
      headerName: "Member Name",
      flex: 1,
      renderCell: ({ row }) => renderCell(row.billing_name || row.member?.full_name || "-"),
    },
    {
      field: "member_email",
      headerName: "Email",
      flex: 1,
      renderCell: ({ row }) => renderCell(row.member?.email || row.member_email || "-"),
    },
    {
      field: "member_username",
      headerName: "Username",
      flex: 1,
      renderCell: ({ row }) => renderCell(row.member?.username || "-"),
    },
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      renderCell: ({ row }) =>
        renderCell(`${row.currency} ${row.amount?.toFixed?.(2) ?? row.amount}`),
    },
    {
      field: "payment_for_type",
      headerName: "Type",
      flex: 1,
      renderCell: ({ row }) =>
        renderCell(row.item_details?.title || `${row.payment_for_type} (${row.payment_for_id})`),
    },
    {
      field: "source",
      headerName: "Source",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: ({ value }) =>
        renderCell(<Chip label={value} color={getStatusColor(value)} size="small" />),
    },
    {
      field: "created_at",
      headerName: "Date",
      flex: 1,
      renderCell: ({ value }) => renderCell(dayjs(value).format("MMM DD, YYYY HH:mm")),
    },
  ]

  return (
    <CDataTable
      columns={columns}
      rows={data}
      meta={meta}
      loading={isLoading}
      action={
        <PermissionGuard resource="payment" action="create" silent>
          <CreateTransactionDialog onSuccess={() => trigger({ page })} />
        </PermissionGuard>
      }
      deleteData={{ model: "Payment", invalidateTag: "PAYMENTS" }}
    />
  )
}

export default function TransactionsPage() {
  return (
    <CModuleLayout helpTips={PAYMENT_TIPS.list}>
      <PermissionGuard resource="payment" action="read">
        <Box sx={{ width: "100%" }}>
          <Suspense fallback={<CPageLoader fullPage={false} />}>
            <TransactionList />
          </Suspense>
        </Box>
      </PermissionGuard>
    </CModuleLayout>
  )
}
