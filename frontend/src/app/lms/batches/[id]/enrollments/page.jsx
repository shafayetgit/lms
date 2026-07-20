"use client"
import React, { useEffect, Suspense } from "react"
import { Box, Typography, Chip, IconButton } from "@mui/material"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Dashboard, InfoOutlined, CalendarMonth, Group, ContentCopy } from "@mui/icons-material"
import { toast } from "react-toastify"

import CPageLoader from "@/components/ui/CPageLoader"
import CModuleLayout from "@/components/ui/CModuleLayout"
import PermissionGuard from "@/components/ui/PermissionGuard"
import CDataTable from "@/components/table/CDatatable"
import CButton from "@/components/ui/CButton"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"
import { BATCH_TIPS } from "@/choices/helpTips/batch"
import { formatDate } from "@/utils/cdayjs"

import {
  useReadBatchQuery,
  useLazyReadBatchEnrollmentsQuery,
  useDeleteBatchEnrollmentMutation,
} from "@/features/batch/batchAPI"

import EnrollStudentDialog from "./_parts/EnrollStudentDialog"

function EnrollmentList({ batchPublicId }) {
  const searchParams = useSearchParams()
  const page = Number(searchParams.get("page") ?? 1)

  const [trigger, { data: { data: enrollments, meta } = {}, isLoading }] = useLazyReadBatchEnrollmentsQuery()
  const [deleteEnrollment] = useDeleteBatchEnrollmentMutation()

  useEffect(() => {
    if (batchPublicId) {
      trigger({ id: batchPublicId, page })
    }
  }, [batchPublicId, page, trigger])

  const handleDelete = async (enrollmentPublicId) => {
    try {
      await deleteEnrollment({ batchId: batchPublicId, enrollmentId: enrollmentPublicId }).unwrap()
      toast.success("Student unenrolled successfully")
    } catch (error) {
      toast.error(error?.data?.message || "Failed to unenroll student")
    }
  }

  if (isLoading) return <CPageLoader fullPage={false} />

  const columns = [
    {
      field: "student",
      headerName: "Student",
      flex: 1.5,
      renderCell: ({ row }) => {
        const member = row.member
        return member ? `${member.first_name || ""} ${member.last_name || ""}`.trim() || member.email : `User #${row.member_id}`
      },
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      renderCell: ({ row }) => row.member?.email || "-",
    },
    {
      field: "is_paid",
      headerName: "Tuition Status",
      flex: 1.2,
      renderCell: ({ row, value }) => {
        const payment = row.payment
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={value ? "Paid" : "Unpaid"}
              color={value ? "success" : "warning"}
              size="small"
            />
            {payment?.public_id && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  component={Link}
                  href={`/settings/transactions/${payment.public_id}`}
                  variant="caption"
                  color="primary.main"
                  sx={{
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  View Txn
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    const link = `${window.location.origin}/payments/checkout?payment_public_id=${payment.public_id}`
                    navigator.clipboard.writeText(link)
                    toast.success("Checkout link copied!")
                  }}
                  title="Copy Checkout Link"
                  sx={{ p: 0.25 }}
                >
                  <ContentCopy sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            )}
          </Box>
        )
      },
    },
    {
      field: "created_at",
      headerName: "Enrolled At",
      flex: 1.2,
      renderCell: ({ value }) => value && formatDate(value),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      sortable: false,
      renderCell: ({ row }) => (
        <PermissionGuard resource="batch" action="update" silent>
          <CButton
            action="delete"
            yesNo
            yesNoText="Are you sure you want to unenroll this student from the batch?"
            onClick={() => handleDelete(row.public_id || row.id)}
          />
        </PermissionGuard>
      ),
    },
  ]

  return (
    <Box>
      <CDataTable
        columns={columns}
        rows={enrollments || []}
        meta={meta}
        loading={isLoading}
        action={<EnrollStudentDialog batchPublicId={batchPublicId} />}
        bulkDelete={{ model: "BatchEnrollment", invalidateTag: "BATCH_ENROLLMENTS" }}
      />
    </Box>
  )
}

export default function BatchEnrollmentsPage() {
  const { id } = useParams()

  const { data: { data: batch } = {}, isLoading } = useReadBatchQuery(
    { id },
    { refetchOnMountOrArgChange: true, skip: !id }
  )
  useSetBreadcrumb(batch?.title, `/lms/batches/${id}`)

  if (isLoading) return <CPageLoader fullPage={false} />

  const navigators = [
    { label: "Dashboard", href: `/lms/batches/${id}/dashboard`, icon: <Dashboard />, resource: "batch", action: "read" },
    { label: "Details", href: `/lms/batches/${id}`, icon: <InfoOutlined />, resource: "batch", action: "read" },
    { label: "Timetable", href: `/lms/batches/${id}/timetable`, icon: <CalendarMonth />, resource: "batch", action: "read" },
    { label: "Enrollments", href: `/lms/batches/${id}/enrollments`, icon: <Group />, resource: "batch", action: "read" },
  ]

  return (
    <PermissionGuard resource="batch" action="read">
      <CModuleLayout navigators={navigators} helpTips={BATCH_TIPS.enrollments}>
        <Box sx={{ width: "100%" }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Cohort Members
          </Typography>
          <Suspense fallback={<CPageLoader fullPage={false} />}>
            <EnrollmentList batchPublicId={batch?.public_id || id} />
          </Suspense>
        </Box>
      </CModuleLayout>
    </PermissionGuard>
  )
}
