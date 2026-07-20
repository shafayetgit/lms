"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import { IconButton, Button, Stack, Box, Typography } from "@mui/material";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";

import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CNumberField from "@/components/form/CNumberField";
import CSelect from "@/components/form/CSelect";
import CDatePicker from "@/components/form/CDatePicker";
import CCheckbox from "@/components/form/CCheckbox";

import { useCreateCouponMutation } from "@/features/payment/paymentApi";
import { useReadCoursesQuery } from "@/features/course/courseAPI";
import { useReadBatchesQuery } from "@/features/batch/batchAPI";
import { useReadProgramsQuery } from "@/features/program/programApi";
import { couponValidationSchema } from "@/schema/payment";
import { mapApiErrorsToFormik } from "@/utils/shared";

// Create coupon dialog component
export default function CreateDialog() {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const [create, { isLoading: isCreating }] = useCreateCouponMutation();
  const { data: coursesData } = useReadCoursesQuery({ size: 100 });
  const { data: batchesData } = useReadBatchesQuery({ size: 100 });
  const { data: programsData } = useReadProgramsQuery({ size: 100 });

  const courseOptions = (coursesData?.data ?? []).map((c) => ({
    label: c.title,
    value: String(c.id),
  }));

  const batchOptions = (batchesData?.data ?? []).map((b) => ({
    label: b.title,
    value: String(b.id),
  }));

  const programOptions = (programsData?.data ?? []).map((p) => ({
    label: p.title,
    value: String(p.id),
  }));

  const formik = useFormik({
    initialValues: {
      code: "",
      type: "Percent",
      discount: "",
      validity: null,
      max_uses: "",
      is_active: true,
      applicable_items: [],
    },
    validationSchema: couponValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const applicable_items = (values.applicable_items || [])
          .filter((item) => item.reference_id)
          .map((item) => ({
            reference_type: item.reference_type,
            reference_id: Number(item.reference_id),
          }));

        const payload = {
          code: values.code,
          type: values.type,
          discount: Number(values.discount),
          validity: values.validity ? dayjs(values.validity).format("YYYY-MM-DD") : null,
          max_uses: values.max_uses === "" ? null : Number(values.max_uses),
          is_active: values.is_active,
          applicable_items: applicable_items.length > 0 ? applicable_items : null,
        };

        await create(payload).unwrap();
        toast.success("Coupon created successfully");
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
      title="Create Coupon"
      btnProps={{ label: "Create Coupon", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm onSubmit={formik.handleSubmit} width="40rem" btnProps={{ loading: isCreating }} dialog>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          <Grid size={{ xs: 4, sm: 8, md: 12 }}>
            <CTextField
              label="Coupon Code"
              name="code"
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.code && Boolean(formik.errors.code)}
              helperText={formik.touched.code && formik.errors.code}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 6 }}>
            <CSelect
              label="Type"
              name="type"
              value={formik.values.type}
              options={[
                { label: "Percent", value: "Percent" },
                { label: "Amount", value: "Amount" },
              ]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.type && Boolean(formik.errors.type)}
              helperText={formik.touched.type && formik.errors.type}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 6 }}>
            <CNumberField
              label="Discount"
              name="discount"
              value={formik.values.discount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.discount && Boolean(formik.errors.discount)}
              helperText={formik.touched.discount && formik.errors.discount}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 6 }}>
            <CDatePicker
              label="Valid Until"
              name="validity"
              value={formik.values.validity}
              onChange={(val) => formik.setFieldValue("validity", val)}
              error={formik.touched.validity && Boolean(formik.errors.validity)}
              helperText={formik.touched.validity && formik.errors.validity}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 4, md: 6 }}>
            <CNumberField
              label="Max Uses (Optional)"
              name="max_uses"
              value={formik.values.max_uses}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.max_uses && Boolean(formik.errors.max_uses)}
              helperText={formik.touched.max_uses && formik.errors.max_uses}
            />
          </Grid>

          <Grid size={{ xs: 4, sm: 8, md: 12 }}>
            <Box sx={{ mt: 2, mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Applicable Items (Optional - Blank for Global)
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddCircleOutline />}
                onClick={() => {
                  const current = formik.values.applicable_items || [];
                  formik.setFieldValue("applicable_items", [
                    ...current,
                    { reference_type: "Course", reference_id: "" }
                  ]);
                }}
              >
                Add Restriction
              </Button>
            </Box>

            <Stack spacing={2}>
              {(formik.values.applicable_items || []).map((item, index) => {
                const options =
                  item.reference_type === "Course"
                    ? courseOptions
                    : item.reference_type === "Batch"
                    ? batchOptions
                    : programOptions;

                return (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      backgroundColor: "action.hover",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <CSelect
                        label="Type"
                        name={`applicable_items[${index}].reference_type`}
                        value={item.reference_type}
                        options={[
                          { label: "Course", value: "Course" },
                          { label: "Batch", value: "Batch" },
                          { label: "Program", value: "Program" },
                        ]}
                        onChange={(e) => {
                          formik.setFieldValue(`applicable_items[${index}].reference_type`, e.target.value);
                          formik.setFieldValue(`applicable_items[${index}].reference_id`, "");
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 2 }}>
                      <CSelect
                        label="Select Item"
                        name={`applicable_items[${index}].reference_id`}
                        value={String(item.reference_id)}
                        options={options}
                        onChange={formik.handleChange}
                      />
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => {
                        const current = [...(formik.values.applicable_items || [])];
                        current.splice(index, 1);
                        formik.setFieldValue("applicable_items", current);
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Box>
                );
              })}
            </Stack>
          </Grid>

          <Grid size={{ xs: 4, sm: 8, md: 12 }}>
            <CCheckbox
              label="Active"
              checked={formik.values.is_active}
              onChange={(e) => formik.setFieldValue("is_active", e.target.checked)}
            />
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
  );
}
