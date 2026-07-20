"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import { Grid, Typography } from "@mui/material";
import { toast } from "react-toastify";

import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CCheckbox from "@/components/form/CCheckbox";
import CSelect from "@/components/form/CSelect";

import { useCreateBadgeMutation } from "@/features/badge/badgeApi";
import { badgeValidationSchema } from "@/schema/badge";
import { mapApiErrorsToFormik } from "@/utils/shared";

export default function CreateDialog() {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const [create, { isLoading: isCreating }] = useCreateBadgeMutation();

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      is_active: true,
      reference_table: "",
      event: "",
      user_field: "",
      field_to_check: "",
      condition: "",
      grant_only_once: true,
    },
    validationSchema: badgeValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        await create(values).unwrap();
        toast.success("Badge created successfully");
        resetForm();
        handleClose();
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        toast.error(error?.data?.message || "Creation failed.");
      }
    },
  });

  return (
    <CDialog
      resource="badge"
      action="create"
      title="Create Badge"
      btnProps={{ label: "Create Badge", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm onSubmit={formik.handleSubmit} width="40rem" btnProps={{ loading: isCreating }} dialog>
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
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
             <CTextField
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
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
              <Typography variant="subtitle1" fontWeight="600" sx={{ mt: 1, mb: 1 }}>
                Dynamic Allocation Rules (Optional)
              </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
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
              <Grid size={{ xs: 6 }}>
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
              <Grid size={{ xs: 6 }}>
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
              <Grid size={{ xs: 6 }}>
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
    </CDialog>
  );
}
