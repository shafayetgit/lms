"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import { Grid, LinearProgress, Box, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";

import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CCheckbox from "@/components/form/CCheckbox";
import CFileField from "@/components/form/CFileField";

import { useReadStudentQuery, useUpdateStudentMutation } from "@/features/student/studentAPI";
import { useAttachMutation } from "@/features/media/mediaApi";
import { studentUpdateSchema } from "@/schema/student";
import { mapApiErrorsToFormik } from "@/utils/shared";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";

import CPageLoader from "@/components/ui/CPageLoader";
import ModuleContainer from "@/components/ui/ModuleContainer";

const breadcrumbs = [
  { label: "Dashboard", path: "/" },
  { label: "Students", path: "/admin/students" },
  { label: "Update", path: "" },
];

export default function Page() {
  const router = useRouter();
  const { id } = useParams();
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data = {}, isLoading } = useReadStudentQuery(
    { id },
    { refetchOnMountOrArgChange: true, skip: !id }
  );

  const [update, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const [attach, { isLoading: isAttaching }] = useAttachMutation();

  const formik = useFormik({
    initialValues: {
      first_name: data?.data?.first_name ?? "",
      last_name: data?.data?.last_name ?? "",
      phone_number: data?.data?.phone_number ?? "",
      department: data?.data?.department ?? "",
      is_active: data?.data?.is_active ?? true,
      avatar: null,
    },
    validationSchema: studentUpdateSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setErrors }) => {
      setUploadProgress(0);
      try {
        const { avatar, ...updatePayload } = values;

        // Step 1: Update student
        const studentResponse = await update({ id, body: updatePayload }).unwrap();
        const studentId = studentResponse?.data?.id ?? id;

        // Step 2: Upload to Cloudinary and attach media (if avatar provided)
        if (avatar) {
          toast.info("File is being uploaded");
          try {
            const uploadedFiles = await uploadMultipleToCloudinary({
              files: [
                {
                  file: avatar,
                  field: "avatar",
                  model: "User",
                  model_id: studentId,
                  onProgress: (progress) => setUploadProgress(progress),
                },
              ],
            });
            toast.info("File is being saved");

            // Step 3: Attach media to student
            if (uploadedFiles && uploadedFiles.length > 0) {
              await attach(uploadedFiles).unwrap();
              toast.info("File has been uploaded and saved");
            }
          } catch (mediaError) {
            console.error("Error uploading/attaching media:", mediaError);
            toast.warning(
              "Student updated successfully, but avatar attachment failed. You can retry uploading the avatar."
            );
          } finally {
            setUploadProgress(0);
          }
        }
        toast.success(studentResponse?.message || "Student updated successfully");
        router.push("/admin/students");
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        toast.error(error?.data?.message || "Update failed. Please try again.");
      }
    },
  });

  if (isLoading) return <CPageLoader fullPage={false} />;

  return (
    <ModuleContainer breadcrumbs={breadcrumbs} transparentContent>
      <CForm
        onSubmit={formik.handleSubmit}
        width="40rem"
        btnProps={{ loading: isUpdating || isAttaching }}
        title="Update"
      >
        <Grid container spacing={2}>
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
            <CCheckbox
              label="Is Active"
              checked={formik.values.is_active}
              onChange={(e) => formik.setFieldValue("is_active", e.target.checked)}
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
    </ModuleContainer>
  );
}
