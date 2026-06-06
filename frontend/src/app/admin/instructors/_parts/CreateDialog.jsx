"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import { Grid, LinearProgress, Box, Typography } from "@mui/material";

import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CCheckbox from "@/components/form/CCheckbox";

import { toast } from "react-toastify";

import { useCreateInstructorMutation } from "@/features/instructor/instructorAPI";
import { useAttachMutation } from "@/features/media/mediaApi";
import { instructorCreateSchema } from "@/schema/instructor";
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

  const [create, { isLoading: isCreatingInstructor }] = useCreateInstructorMutation();
  const [attach, { isLoading: isAttachingMedia }] = useAttachMutation();

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      qualification: "",
      specialization: "",
      bio: "",
      phone_number: "",
      department: "",
      is_active: false,
      avatar: null,
    },
    validationSchema: instructorCreateSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      setUploadProgress(0);
      try {
        const { avatar, ...createPayload } = values;

        // Step 1: Create instructor
        const instructorResponse = await create(createPayload).unwrap();
        const instructorId = instructorResponse?.id; // Assuming API returns created user info

        // Step 2: Upload to Cloudinary and attach media (if avatar provided)
        if (avatar && instructorId) {
          try {
            const uploadedFiles = await uploadMultipleToCloudinary({
              files: [
                {
                  file: avatar,
                  field: "avatar",
                  model: "User", // Assuming media attaches to User or Instructor model
                  model_id: instructorId,
                  onProgress: (progress) => setUploadProgress(progress),
                },
              ],
            });

            // Step 3: Attach media
            if (uploadedFiles && uploadedFiles.length > 0) {
              await attach(uploadedFiles).unwrap();
              console.log("Media attached successfully");
            }
          } catch (mediaError) {
            console.error("Error uploading/attaching media:", mediaError);
            toast.warning(
              "Instructor created successfully, but media attachment failed. You can retry uploading the avatar."
            );
          } finally {
            setUploadProgress(0);
          }
        }

        toast.success("Instructor created successfully");
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

  const isLoading = isCreatingInstructor || isAttachingMedia;

  return (
    <CDialog
      title="Create Instructor"
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
          <Grid size={{ xs: 12, md: 6 }}>
            <CTextField
              label="Username"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CTextField
              label="Email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CTextField
              label="First Name"
              name="first_name"
              value={formik.values.first_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.first_name && Boolean(formik.errors.first_name)}
              helperText={formik.touched.first_name && formik.errors.first_name}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CTextField
              label="Last Name"
              name="last_name"
              value={formik.values.last_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.last_name && Boolean(formik.errors.last_name)}
              helperText={formik.touched.last_name && formik.errors.last_name}
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Password"
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CTextField
              label="Qualification"
              name="qualification"
              value={formik.values.qualification}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.qualification && Boolean(formik.errors.qualification)}
              helperText={formik.touched.qualification && formik.errors.qualification}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CTextField
              label="Specialization"
              name="specialization"
              value={formik.values.specialization}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.specialization && Boolean(formik.errors.specialization)}
              helperText={formik.touched.specialization && formik.errors.specialization}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CTextField
              label="Department"
              name="department"
              value={formik.values.department}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.department && Boolean(formik.errors.department)}
              helperText={formik.touched.department && formik.errors.department}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CTextField
              label="Phone Number"
              name="phone_number"
              value={formik.values.phone_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
              helperText={formik.touched.phone_number && formik.errors.phone_number}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Bio"
              name="bio"
              value={formik.values.bio}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.bio && Boolean(formik.errors.bio)}
              helperText={formik.touched.bio && formik.errors.bio}
              multiline
              rows={3}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CCheckbox
              label="Is Active"
              checked={formik.values.is_active}
              onChange={(e) =>
                formik.setFieldValue("is_active", e.target.checked)
              }
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CFileField
              label="Avatar"
              dragNdrop
              onChange={(e) => {
                formik.setFieldValue("avatar", e.target.files[0]);
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
