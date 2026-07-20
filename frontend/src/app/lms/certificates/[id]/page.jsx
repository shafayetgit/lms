"use client";
import React from "react";
import { useFormik } from "formik";
import { Grid } from "@mui/material";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import dayjs from "dayjs";

import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CDatePicker from "@/components/form/CDatePicker";
import CCheckbox from "@/components/form/CCheckbox";
import CPageLoader from "@/components/ui/CPageLoader";
import CModuleLayout from "@/components/ui/CModuleLayout";
import { InfoOutlined } from "@mui/icons-material";
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb";

import { useReadCertificateQuery, useUpdateCertificateMutation } from "@/features/certificate/certificateApi";
import { certificateValidationSchema } from "@/schema/certificate";
import { mapApiErrorsToFormik } from "@/utils/shared";


export default function CertificateDetailPage() {
  const { id } = useParams();

  const { data: certRes, isLoading } = useReadCertificateQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: !id,
  });

  const cert = certRes?.data;

  const [update, { isLoading: isUpdating }] = useUpdateCertificateMutation();

  useSetBreadcrumb(cert?.member?.full_name || cert?.member?.email);

  const formik = useFormik({
    initialValues: {
      member_public_id: cert?.member?.public_id ?? "",
      course_public_id: cert?.course?.public_id ?? null,
      batch_public_id: cert?.batch?.public_id ?? null,
      issue_date: cert?.issue_date ? dayjs(cert.issue_date) : dayjs(),
      expiry_date: cert?.expiry_date ? dayjs(cert.expiry_date) : null,
      template: cert?.template ?? "",
      published: cert?.published ?? false,
    },
    validationSchema: certificateValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        const payload = {
            issue_date: values.issue_date ? dayjs(values.issue_date).format('YYYY-MM-DD') : null,
            expiry_date: values.expiry_date ? dayjs(values.expiry_date).format('YYYY-MM-DD') : null,
            template: values.template,
            published: values.published
        }
        await update({ id, body: payload }).unwrap();
        toast.success("Certificate updated successfully");
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        toast.error(error?.data?.message || "Update failed");
      }
    },
  });

  if (isLoading) return <CPageLoader fullPage={false} />;

  const navigators = [
    { label: "Details", href: `/lms/certificates/${id}`, icon: <InfoOutlined /> },
  ];

  const helpTips = {
    description: "Review metadata and validity ranges for the issued academic credentials.",
    tips: [
      {
        title: "Expiry Date",
        description: "Set an expiration date for renewal policies. Leave blank for lifetime credentials.",
      },
      {
        title: "Verification link",
        description: "Once published, students and third parties can verify credentials online using the public verification ID.",
      },
    ],
  };

  return (
    <CModuleLayout navigators={navigators} helpTips={helpTips}>
      <CForm onSubmit={formik.handleSubmit} width="30rem" btnProps={{ loading: isUpdating }}>
        <Grid container spacing={2}>
          {/* Student */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Student"
              value={cert?.member?.full_name || cert?.member?.email || "N/A"}
              disabled
            />
          </Grid>

          {/* Course/Batch */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Course/Batch"
              value={cert?.course?.title || cert?.batch?.title || "N/A"}
              disabled
            />
          </Grid>

          {/* Verification ID */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Verification ID"
              value={cert?.public_id || "N/A"}
              disabled
            />
          </Grid>

          {/* Issue Date */}
          <Grid size={{ xs: 12 }}>
            <CDatePicker
              label="Issue Date"
              name="issue_date"
              value={formik.values.issue_date}
              onChange={(val) => formik.setFieldValue("issue_date", val)}
              error={formik.touched.issue_date && Boolean(formik.errors.issue_date)}
              helperText={formik.touched.issue_date && formik.errors.issue_date}
            />
          </Grid>

          {/* Expiry Date */}
          <Grid size={{ xs: 12 }}>
             <CDatePicker
              label="Expiry Date"
              name="expiry_date"
              value={formik.values.expiry_date}
              onChange={(val) => formik.setFieldValue("expiry_date", val)}
              error={formik.touched.expiry_date && Boolean(formik.errors.expiry_date)}
              helperText={formik.touched.expiry_date && formik.errors.expiry_date}
            />
          </Grid>

          {/* Template Reference */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Template Reference"
              name="template"
              value={formik.values.template}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.template && Boolean(formik.errors.template)}
              helperText={formik.touched.template && formik.errors.template}
            />
          </Grid>

          {/* Published */}
          <Grid size={{ xs: 12 }}>
            <CCheckbox
              label="Published"
              checked={formik.values.published}
              onChange={(e) => formik.setFieldValue("published", e.target.checked)}
            />
          </Grid>
        </Grid>
      </CForm>
    </CModuleLayout>
  );
}
