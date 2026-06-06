"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import { Grid } from "@mui/material";
import { toast } from "react-toastify";

import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CCheckbox from "@/components/form/CCheckbox";
import CSelect from "@/components/form/CSelect";
import CDatePicker from "@/components/form/CDatePicker";
import dayjs from "dayjs";

import { useCreateEnrollmentMutation } from "@/features/enrollment/enrollmentAPI";
import { enrollmentCreateSchema } from "@/schema/enrollment";
import { mapApiErrorsToFormik } from "@/utils/shared";

const STATUS_CHOICES = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Expired", value: "expired" },
  { label: "Suspended", value: "suspended" },
];

export default function CreateDialog() {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const [create, { isLoading }] = useCreateEnrollmentMutation();

  const formik = useFormik({
    initialValues: {
      user_id: "",
      course_id: "",
      status: "active",
      is_active: true,
      expires_at: "",
    },
    validationSchema: enrollmentCreateSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const createPayload = { ...values };
        if (!createPayload.expires_at) delete createPayload.expires_at;

        const response = await create(createPayload).unwrap();
        toast.success(response?.message || "Enrollment created successfully");
        resetForm();
        handleClose();
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        toast.error(error?.data?.message || "Create failed. Please try again.");
      }
    },
  });

  return (
    <CDialog
      title="Create"
      btnProps={{ label: "Create", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm
        onSubmit={formik.handleSubmit}
        width="30rem"
        btnProps={{ loading: isLoading }}
        dialog
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="User ID"
              name="user_id"
              type="number"
              value={formik.values.user_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.user_id && Boolean(formik.errors.user_id)}
              helperText={formik.touched.user_id && formik.errors.user_id}
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Course ID"
              name="course_id"
              type="number"
              value={formik.values.course_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.course_id && Boolean(formik.errors.course_id)}
              helperText={formik.touched.course_id && formik.errors.course_id}
              required
            />
          </Grid>
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
                formik.setFieldValue("expires_at", newValue ? newValue.toISOString() : "");
              }}
              error={formik.touched.expires_at && Boolean(formik.errors.expires_at)}
              helperText={formik.touched.expires_at && formik.errors.expires_at}
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
    </CDialog>
  );
}
