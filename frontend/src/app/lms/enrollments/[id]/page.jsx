"use client";
import React from "react";
import { useFormik } from "formik";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { InfoOutlined } from "@mui/icons-material";

import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CNumberField from "@/components/form/CNumberField";
import CCheckbox from "@/components/form/CCheckbox";
import CSelect from "@/components/form/CSelect";
import CDatePicker from "@/components/form/CDatePicker";
import CPageLoader from "@/components/ui/CPageLoader";
import CModuleLayout from "@/components/ui/CModuleLayout";
import CSectionLabel from "@/components/ui/CSectionLabel";
import PermissionGuard from "@/components/ui/PermissionGuard";
import usePermissions from "@/hooks/usePermissions";

import { useReadEnrollmentQuery, useUpdateEnrollmentMutation } from "@/features/enrollment/enrollmentAPI";
import { enrollmentUpdateSchema } from "@/schema/enrollment";
import { mapApiErrorsToFormik } from "@/utils/shared";
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb";
import ENROLLMENT_TIPS from "@/choices/helpTips/enrollment";

const STATUS_CHOICES = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Expired", value: "expired" },
  { label: "Suspended", value: "suspended" },
];

export default function Page() {
  const router = useRouter();
  const { id } = useParams();

  const { data = {}, isLoading } = useReadEnrollmentQuery(
    { id },
    { refetchOnMountOrArgChange: true, skip: !id }
  );

  const studentName = data?.data?.user?.full_name || `${data?.data?.user?.first_name || ""} ${data?.data?.user?.last_name || ""}`.trim();
  const courseTitle = data?.data?.course?.title;
  const breadcrumbLabel = studentName && courseTitle ? `${studentName} (${courseTitle})` : studentName || courseTitle || "Enrollment Details";

  useSetBreadcrumb(breadcrumbLabel);

  const [update, { isLoading: isUpdating }] = useUpdateEnrollmentMutation();

  const formik = useFormik({
    initialValues: {
      progress: data?.data?.progress ?? 0,
      purchased_certificate: data?.data?.purchased_certificate ?? false,
      status: data?.data?.status ?? "active",
      is_active: data?.data?.is_active ?? true,
      expires_at: data?.data?.expires_at || null,
      completed_at: data?.data?.completed_at || null,
    },
    validationSchema: enrollmentUpdateSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        const updatePayload = { ...values };
        if (!updatePayload.expires_at) updatePayload.expires_at = null;
        if (!updatePayload.completed_at) updatePayload.completed_at = null;

        const response = await update({ id, body: updatePayload }).unwrap();
        toast.success(response?.message || "Enrollment updated successfully");
        router.push("/lms/enrollments");
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        toast.error(error?.data?.message || "Update failed. Please try again.");
      }
    },
  });

  const { can, isSuperAdmin } = usePermissions();
  const canUpdate = isSuperAdmin || can("enrollment", "update");

  if (isLoading) return <CPageLoader fullPage={false} />;

  const navigators = [
    { label: "Details", href: `/lms/enrollments/${id}`, icon: <InfoOutlined />, resource: "enrollment", action: "read" },
  ];

  return (
    <PermissionGuard resource="enrollment" action="read">
      <CModuleLayout navigators={navigators} helpTips={ENROLLMENT_TIPS.details}>
        <CForm
          onSubmit={canUpdate ? formik.handleSubmit : undefined}
          width="48rem"
          btnProps={{ loading: isUpdating }}
          sx={{ border: "none" }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CSectionLabel label="Enrollment Information" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CNumberField
                label="Progress (%)"
                name="progress"
                min={0}
                max={100}
                value={formik.values.progress}
                onChange={(e) => formik.setFieldValue("progress", e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.progress && Boolean(formik.errors.progress)}
                helperText={formik.touched.progress && formik.errors.progress}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CSelect
                label="Status"
                name="status"
                value={formik.values.status}
                options={STATUS_CHOICES}
                onChange={(e) => formik.setFieldValue("status", e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && formik.errors.status}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CDatePicker
                label="Expires At"
                name="expires_at"
                value={formik.values.expires_at ? dayjs(formik.values.expires_at) : null}
                onChange={(newValue) => {
                  formik.setFieldValue("expires_at", newValue ? newValue.toISOString() : null);
                }}
                error={formik.touched.expires_at && Boolean(formik.errors.expires_at)}
                helperText={formik.touched.expires_at && formik.errors.expires_at}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CDatePicker
                label="Completed At"
                name="completed_at"
                value={formik.values.completed_at ? dayjs(formik.values.completed_at) : null}
                onChange={(newValue) => {
                  formik.setFieldValue("completed_at", newValue ? newValue.toISOString() : null);
                }}
                error={formik.touched.completed_at && Boolean(formik.errors.completed_at)}
                helperText={formik.touched.completed_at && formik.errors.completed_at}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CSectionLabel label="Options & Settings" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CCheckbox
                label="Purchased Certificate"
                checked={formik.values.purchased_certificate}
                onChange={(e) => formik.setFieldValue("purchased_certificate", e.target.checked)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CCheckbox
                label="Is Active"
                checked={formik.values.is_active}
                onChange={(e) => formik.setFieldValue("is_active", e.target.checked)}
              />
            </Grid>
          </Grid>
        </CForm>
      </CModuleLayout>
    </PermissionGuard>
  );
}
