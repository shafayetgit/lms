"use client";
import React from "react";
import { useFormik } from "formik";
import { Grid } from "@mui/material";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import * as Yup from "yup";

import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CSelect from "@/components/form/CSelect";
import CAutocomplete from "@/components/form/CAutocomplete";
import CPageLoader from "@/components/ui/CPageLoader";
import CModuleLayout from "@/components/ui/CModuleLayout";
import { InfoOutlined } from "@mui/icons-material";
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb";

import { useReadCertificateRequestQuery, useUpdateCertificateRequestMutation } from "@/features/certificate/certificateApi";
import { useReadInstructorsQuery } from "@/features/instructor/instructorAPI";
import { mapApiErrorsToFormik } from "@/utils/shared";

const validationSchema = Yup.object().shape({
  status: Yup.string().required("Status is required"),
  evaluator_public_id: Yup.string().when("status", {
    is: "Approved",
    then: (schema) => schema.required("An evaluator is required when approving"),
    otherwise: (schema) => schema.nullable(),
  }),
});

export default function RequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: requestRes, isLoading: isRequestLoading } = useReadCertificateRequestQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: !id,
  });

  const { data: instructorsRes, isLoading: isInstructorsLoading } = useReadInstructorsQuery({
    size: 100,
  });

  const [updateRequest, { isLoading: isUpdating }] = useUpdateCertificateRequestMutation();

  const request = requestRes?.data;
  const instructors = instructorsRes?.data || [];

  useSetBreadcrumb(request?.member?.full_name || request?.member?.email);

  const instructorOptions = instructors.map((inst) => ({
    label: `${inst.first_name} ${inst.last_name} (${inst.email})`,
    value: inst.public_id,
  }));

  const formik = useFormik({
    initialValues: {
      status: request?.status ?? "Pending",
      evaluator_public_id: request?.evaluator?.public_id ?? "",
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        await updateRequest({ id, body: values }).unwrap();
        toast.success("Certificate request updated successfully");
        router.push("/lms/certificate-requests");
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        toast.error(error?.data?.message || "Failed to update request");
      }
    },
  });

  if (isRequestLoading || isInstructorsLoading) return <CPageLoader fullPage={false} />;

  const navigators = [
    { label: "Details", href: `/lms/certificate-requests/${id}`, icon: <InfoOutlined /> },
  ];

  const helpTips = {
    description: "When a student requests a certificate, they need to be evaluated by an instructor.",
    tips: [
      {
        title: "Assign Evaluator",
        description: "Choose an instructor to perform the evaluation session.",
      },
      {
        title: "Approval",
        description: "Approving the request automatically generates a pending Evaluation Session for the assigned instructor.",
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
              value={request?.member?.full_name || request?.member?.email || "N/A"}
              disabled
            />
          </Grid>

          {/* Course/Batch */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Course/Batch"
              value={request?.course?.title || request?.batch?.title || "N/A"}
              disabled
            />
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12 }}>
            <CSelect
              label="Status"
              name="status"
              value={formik.values.status}
              options={[
                { label: "Pending", value: "Pending" },
                { label: "Approved", value: "Approved" },
                { label: "Rejected", value: "Rejected" },
              ]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={formik.touched.status && formik.errors.status}
            />
          </Grid>

          {/* Assign Evaluator */}
          <Grid size={{ xs: 12 }}>
            <CAutocomplete
              label="Assign Evaluator"
              name="evaluator_public_id"
              options={instructorOptions}
              value={
                formik.values.evaluator_public_id
                  ? instructorOptions.find((opt) => opt.value === formik.values.evaluator_public_id) || null
                  : null
              }
              onChange={(e, val) => formik.setFieldValue("evaluator_public_id", val?.value || "")}
              isOptionEqualToValue={(option, val) => option?.value === val?.value}
              error={formik.touched.evaluator_public_id && Boolean(formik.errors.evaluator_public_id)}
              helperText={formik.touched.evaluator_public_id && formik.errors.evaluator_public_id}
            />
          </Grid>
        </Grid>
      </CForm>
    </CModuleLayout>
  );
}
