"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import { Grid, LinearProgress, Box, Typography } from "@mui/material";

import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CCheckbox from "@/components/form/CCheckbox";
import CSelect from "@/components/form/CSelect";

import { toast } from "react-toastify";

import { CATEGORY_CHOICES } from "@/choices/category";
import { useCreateCategoryMutation } from "@/features/category/categoryAPI";
import { useAttachMutation } from "@/features/media/mediaApi";
import { categoryValidationSchema } from "@/schema/category";
import { mapApiErrorsToFormik } from "@/utils/shared";
import CFileField from "@/components/form/CFileField";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";

export default function CreateDialog() {
  const [open, setOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleClose = () => {
    setOpen(false);
    setUploadProgress(0);
  };
  const handleOpen = () => setOpen(true);

  const [create, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [attach, { isLoading: isAttachingMedia }] = useAttachMutation();

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      badge: CATEGORY_CHOICES[0]?.value || "none",
      is_active: false,
      thumbnail: null,
    },
    validationSchema: categoryValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      setUploadProgress(0);
      try {
        const { thumbnail, ...createPayload } = values;

        // Step 1: Create category
        const categoryResponse = await create(createPayload).unwrap();
        const categoryId = categoryResponse.data.id;

        // Step 2: Upload to Cloudinary and attach media (if thumbnail provided)
        if (thumbnail) {
          try {
            const uploadedFiles = await uploadMultipleToCloudinary({
              files: [
                {
                  file: thumbnail,
                  field: "thumbnail",
                  model: "Category",
                  model_id: categoryId,
                  onProgress: (progress) => setUploadProgress(progress),
                },
              ],
            });

            // Step 3: Attach media to category
            if (uploadedFiles && uploadedFiles.length > 0) {
              await attach(uploadedFiles).unwrap();
              console.log("Media attached successfully");
            }
          } catch (mediaError) {
            console.error("Error uploading/attaching media:", mediaError);
            toast.warning(
              "Category created successfully, but media attachment failed. You can retry uploading the thumbnail."
            );
          } finally {
            setUploadProgress(0);
          }
        }

        toast.success(categoryResponse?.message || "Category created successfully");
        resetForm();
        handleClose();
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        console.error("Create error:", error);
        toast.error(error?.data?.message || "Create failed. Please try again.");
      }
    },
  });

  const isLoading = isCreatingCategory || isAttachingMedia;

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
          {/* Name */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              required
            />
          </Grid>

          {/* Description */}
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              helperText={
                formik.touched.description && formik.errors.description
              }
              multiline
              rows={4}
            />
          </Grid>

          {/* Badge */}
          <Grid size={{ xs: 12 }}>
            <CSelect
              label="Category Badge"
              name="badge"
              value={formik.values.badge}
              options={CATEGORY_CHOICES}
              onChange={(e) => formik.setFieldValue("badge", e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched.badge && Boolean(formik.errors.badge)}
              helperText={formik.touched.badge && formik.errors.badge}
            />
          </Grid>

          {/* Active */}
          <Grid size={{ xs: 12 }}>
            <CCheckbox
              label="Is Active"
              checked={formik.values.is_active}
              onChange={(e) =>
                formik.setFieldValue("is_active", e.target.checked)
              }
            />
          </Grid>

          {/* Thumbnail */}
          <Grid size={{ xs: 12 }}>
            <CFileField
              label="Thumbnail"
              dragNdrop
              onChange={(e) => {
                formik.setFieldValue("thumbnail", e.target.files[0]);
              }}
              aspectRatios={[{ label: "1:1", value: 1 }]}
            />
            {uploadProgress > 0 && uploadProgress <= 100 && (
              <Box sx={{ width: "100%", mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  mt={1}
                >
                  {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : "Processing..."}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
  );
}
