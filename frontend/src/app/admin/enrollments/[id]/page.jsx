"use client";
import React from "react";
import { useFormik } from "formik";
import { Grid } from "@mui/material";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";

import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CCheckbox from "@/components/form/CCheckbox";
import CSelect from "@/components/form/CSelect";
import CDatePicker from "@/components/form/CDatePicker";
import dayjs from "dayjs";

import { useReadEnrollmentQuery, useUpdateEnrollmentMutation } from "@/features/enrollment/enrollmentAPI";
import { enrollmentUpdateSchema } from "@/schema/enrollment";
import { mapApiErrorsToFormik } from "@/utils/shared";
import CPageLoader from "@/components/ui/CPageLoader";
import ModuleContainer from "@/components/ui/ModuleContainer";

const STATUS_CHOICES = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Expired", value: "expired" },
  { label: "Suspended", value: "suspended" },
];

const breadcrumbs = [
  { label: "Dashboard", path: "/" },
  { label: "Enrollments", path: "/admin/enrollments" },
  { label: "Update", path: "" },
];

export default function Page() {
  const router = useRouter();
  const { id } = useParams();

  const { data = {}, isLoading } = useReadEnrollmentQuery(
    { id },
    { refetchOnMountOrArgChange: true, skip: !id }
  );

  const [update, { isLoading: isUpdating }] = useUpdateEnrollmentMutation();

  const formik = useFormik({
    initialValues: {
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
        router.push("/admin/enrollments");
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        toast.error(error?.data?.message || "Update failed. Please try again.");
      }
    },
  });

  if (isLoading) return <CPageLoader fullPage={false} />;

  return (
    <ModuleContainer breadcrumbs={breadcrumbs} transparentContent>
      <CForm
        onSubmit={formik.handleSubmit}
        width="30rem"
        btnProps={{ loading: isUpdating }}
        title="Update"
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
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
          <Grid size={{ xs: 12 }}>
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
          <Grid size={{ xs: 12 }}>
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
            <CCheckbox
              label="Is Active"
              checked={formik.values.is_active}
              onChange={(e) => formik.setFieldValue("is_active", e.target.checked)}
            />
          </Grid>
        </Grid>
      </CForm>
    </ModuleContainer>
  );
}
