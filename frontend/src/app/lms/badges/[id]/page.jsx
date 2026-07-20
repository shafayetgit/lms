"use client";
import React from "react";
import { useFormik } from "formik";
import { Grid, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import { InfoOutlined } from "@mui/icons-material";

import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CCheckbox from "@/components/form/CCheckbox";
import CSelect from "@/components/form/CSelect";
import CPageLoader from "@/components/ui/CPageLoader";
import CModuleLayout from "@/components/ui/CModuleLayout";
import PermissionGuard from "@/components/ui/PermissionGuard";

import { useReadBadgeQuery, useUpdateBadgeMutation } from "@/features/badge/badgeApi";
import { badgeValidationSchema } from "@/schema/badge";
import { mapApiErrorsToFormik } from "@/utils/shared";
import { BADGE_TIPS } from "@/choices/helpTips/badge";
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb";
import usePermissions from "@/hooks/usePermissions";

export default function BadgeDetailPage() {
  const { id } = useParams();

  const { data: badgeData, isLoading } = useReadBadgeQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: !id,
  });

  useSetBreadcrumb(badgeData?.data?.title);

  const [update, { isLoading: isUpdating }] = useUpdateBadgeMutation();
  const { can, isSuperAdmin } = usePermissions();
  const canUpdate = isSuperAdmin || can("badge", "update");

  const formik = useFormik({
    initialValues: {
      title: badgeData?.data?.title ?? "",
      description: badgeData?.data?.description ?? "",
      image: badgeData?.data?.image ?? "",
      is_active: badgeData?.data?.is_active ?? true,
      reference_table: badgeData?.data?.reference_table ?? "",
      event: badgeData?.data?.event ?? "",
      user_field: badgeData?.data?.user_field ?? "",
      field_to_check: badgeData?.data?.field_to_check ?? "",
      condition: badgeData?.data?.condition ?? "",
      grant_only_once: badgeData?.data?.grant_only_once ?? true,
    },
    validationSchema: badgeValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        await update({ id, body: values }).unwrap();
        toast.success("Badge updated successfully");
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        toast.error(error?.data?.message || "Update failed");
      }
    },
  });

  if (isLoading) return <CPageLoader fullPage={false} />;

  const navigators = [
    { label: "Details", href: `/lms/badges/${id}`, icon: <InfoOutlined />, resource: "badge", action: "read" },
  ];

  return (
    <PermissionGuard resource="badge" action="read">
      <CModuleLayout navigators={navigators} helpTips={BADGE_TIPS.details}>
        <CForm
          onSubmit={canUpdate ? formik.handleSubmit : undefined}
          width="30rem"
          btnProps={{ loading: isUpdating }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CTextField
                label="Badge Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CTextField
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CTextField
                label="Image URL"
                name="image"
                value={formik.values.image}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CCheckbox
                label="Active"
                checked={formik.values.is_active}
                onChange={(e) => formik.setFieldValue("is_active", e.target.checked)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1, mb: 0.5 }}>
                Dynamic Allocation Rules (Optional)
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CSelect
                label="Reference Table"
                name="reference_table"
                value={formik.values.reference_table}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.reference_table && Boolean(formik.errors.reference_table)}
                helperText={formik.touched.reference_table && formik.errors.reference_table}
                options={[
                  { value: "", label: "None (Manual Assignment)" },
                  { value: "course_progress", label: "Course Progress" },
                  { value: "quiz_submissions", label: "Quiz Submissions" },
                  { value: "certificates", label: "Certificates" },
                ]}
              />
            </Grid>

            {formik.values.reference_table && (
              <>
                <Grid size={{ xs: 12 }}>
                  <CSelect
                    label="Trigger Event"
                    name="event"
                    value={formik.values.event}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.event && Boolean(formik.errors.event)}
                    helperText={formik.touched.event && formik.errors.event}
                    options={[
                      { value: "", label: "None" },
                      { value: "New", label: "New (Created)" },
                      { value: "Value Change", label: "Value Change (Updated)" },
                    ]}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <CTextField
                    label="User Recipient Field"
                    name="user_field"
                    value={formik.values.user_field}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.user_field && Boolean(formik.errors.user_field)}
                    helperText={formik.touched.user_field && formik.errors.user_field}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <CTextField
                    label="Field to Check"
                    name="field_to_check"
                    value={formik.values.field_to_check}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.field_to_check && Boolean(formik.errors.field_to_check)}
                    helperText={formik.touched.field_to_check && formik.errors.field_to_check}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <CTextField
                    label="Condition Expression"
                    name="condition"
                    multiline
                    rows={2}
                    value={formik.values.condition}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.condition && Boolean(formik.errors.condition)}
                    helperText={formik.touched.condition && formik.errors.condition}
                  />
                </Grid>
              </>
            )}

            <Grid size={{ xs: 12 }}>
              <CCheckbox
                label="Grant Only Once"
                checked={formik.values.grant_only_once}
                onChange={(e) => formik.setFieldValue("grant_only_once", e.target.checked)}
              />
            </Grid>
          </Grid>
        </CForm>
      </CModuleLayout>
    </PermissionGuard>
  );
}
