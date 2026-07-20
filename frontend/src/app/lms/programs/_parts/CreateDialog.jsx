"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import { Grid } from "@mui/material";
import { toast } from "react-toastify";

import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CCheckbox from "@/components/form/CCheckbox";

import { useCreateProgramMutation } from "@/features/program/programApi";
import { programValidationSchema } from "@/schema/program";
import { mapApiErrorsToFormik } from "@/utils/shared";

export default function CreateDialog() {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const [create, { isLoading: isCreating }] = useCreateProgramMutation();

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      published: false,
      enforce_course_order: false,
    },
    validationSchema: programValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        await create(values).unwrap();
        toast.success("Program created successfully");
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
      resource="program"
      action="create"
      title="Create Program"
      btnProps={{ label: "Create Program", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm onSubmit={formik.handleSubmit} width="30rem" btnProps={{ loading: isCreating }} dialog>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Title"
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
            <CCheckbox
              label="Enforce Course Order"
              checked={formik.values.enforce_course_order}
              onChange={(e) => formik.setFieldValue("enforce_course_order", e.target.checked)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CCheckbox
              label="Published"
              checked={formik.values.published}
              onChange={(e) => formik.setFieldValue("published", e.target.checked)}
            />
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
  );
}
