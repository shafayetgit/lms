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
import { categoryValidationSchema } from "@/schema/category";
import { mapApiErrorsToFormik, objectToMediaFormData } from "@/utils/shared";
import CFileField from "@/components/ui/CFileField";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function Create() {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const [create, { isLoading }] = useCreateMutation();

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      type: CATEGORY_CHOICES[0]?.value || "",
      isActive: false,
      thumbnail: "",
      // media: {
      //   model: "Category",
      //   id: null,
      //   secure_url: null,
      // },
    },
    validationSchema: categoryValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        // console.log();

        const { thumbnail, ...createPayload } = values;
        // console.log(uploaded);
        // const response = await create(createPayload).unwrap();

        // if (response?.id) {
          const files = {
            ...(values.thumbnail && { thumbnail: values.thumbnail }),
          };


          if(Object.keys(files).length > 0) {
            const metadata = await uploadToCloudinary({
              files,
            });
          }

          // if (!file) return;
          // const metadata = await uploadToCloudinary({
          //   file,
          // });
          // const payload = {
          //   model: "Category",
          //   id: response.id,
          //   secure_url: metadata.secure_url,
          //   field: "thumbnail",
          //   metadata: metadata,
          // };
          // console.log(payload);
        // }

        // toast.success(response?.message || "Category created successfully");
        // resetForm();
        // handleClose();

        // media.id = response.id;
        // const mediaFormData = objectToMediaFormData(media);
        // console.log(mediaFormData);
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        console.log(error);
        toast.error(error?.data?.message || "Create failed. Please try again.");
      }
    },
  });

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
