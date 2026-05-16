"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import { Grid } from "@mui/material";

import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/ui/CTextField";
import CCheckbox from "@/components/ui/CCheckbox";
import CSelect from "@/components/ui/CSelect";

import { toast } from "react-toastify";

import { CATEGORY_CHOICES } from "@/choices/category";
import { useCreateMutation } from "@/features/category/categoryAPI";
import { useAttachMutation } from "@/features/media/mediaApi";
import { categoryValidationSchema } from "@/schema/category";
import { mapApiErrorsToFormik } from "@/utils/shared";
import CFileField from "@/components/ui/CFileField";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";

export default function CreateDialog() {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const [create, { isLoading: isCreatingCategory }] = useCreateMutation();
  const [attach, { isLoading: isAttachingMedia }] = useAttachMutation();

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      type: CATEGORY_CHOICES[0]?.value || "",
      isActive: false,
      thumbnail: null,
    },
    validationSchema: categoryValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const { thumbnail, ...createPayload } = values;

        // Step 1: Create category
        const categoryResponse = await create(createPayload).unwrap();
        const categoryId = categoryResponse.id;

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
      btnProps={{ label: "Create Category", action: "add" }}
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

          {/* Type */}
          <Grid size={{ xs: 12 }}>
            <CSelect
              label="Category Type"
              name="type"
              value={formik.values.type}
              options={CATEGORY_CHOICES}
              onChange={(e) => formik.setFieldValue("type", e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched.type && Boolean(formik.errors.type)}
              helperText={formik.touched.type && formik.errors.type}
            />
          </Grid>

          {/* Active */}
          <Grid size={{ xs: 12 }}>
            <CCheckbox
              label="Is Active"
              checked={formik.values.isActive}
              onChange={(e) =>
                formik.setFieldValue("isActive", e.target.checked)
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
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
  );
}
