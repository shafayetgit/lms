"use client";
import React from "react";
import { useFormik } from "formik";
import { Box, Stack, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid";
import { DeleteOutline, InfoOutlined, SchoolOutlined, AssignmentTurnedInOutlined } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";

import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CSelect from "@/components/form/CSelect";
import CButton from "@/components/ui/CButton";
import CPageLoader from "@/components/ui/CPageLoader";
import CModuleLayout from "@/components/ui/CModuleLayout";
import { PROGRAM_TIPS } from "@/choices/helpTips/program";
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb";

import {
  useReadProgramQuery,
  useUpdateProgramMutation,
} from "@/features/program/programApi";
import { useReadCoursesQuery } from "@/features/course/courseAPI";
import { programValidationSchema } from "@/schema/program";
import { mapApiErrorsToFormik } from "@/utils/shared";
import PermissionGuard from "@/components/ui/PermissionGuard";
import usePermissions from "@/hooks/usePermissions";

export default function ProgramCoursesPage() {
  const router = useRouter();
  const { id } = useParams();

  const { data: { data: programDataObj } = {}, isLoading } = useReadProgramQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: !id,
  });

  useSetBreadcrumb(programDataObj?.title, `/lms/programs/${id}`);

  const [update, { isLoading: isUpdating }] = useUpdateProgramMutation();

  const { data: { data: coursesList } = {} } = useReadCoursesQuery({ size: 100 });
  const courseOptions = coursesList?.map(c => ({
    label: c.title,
    value: c.id,
  })) || [];

  const formik = useFormik({
    initialValues: {
      title: programDataObj?.title ?? "",
      description: programDataObj?.description ?? "",
      published: programDataObj?.published ?? false,
      enforce_course_order: programDataObj?.enforce_course_order ?? false,
      courses: programDataObj?.courses?.map(pc => ({
        course_id: pc.course_id,
        order_index: pc.order_index,
      })) ?? [],
    },
    validationSchema: programValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        await update({ id, body: values }).unwrap();
        toast.success("Program courses updated successfully");
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        toast.error(error?.data?.message || "Update failed");
      }
    },
  });

  const { can, isSuperAdmin } = usePermissions();
  const canUpdate = isSuperAdmin || can("program", "update");

  if (isLoading) return <CPageLoader fullPage={false} />;

  const navigators = [
    { label: "Details", href: `/lms/programs/${id}`, icon: <InfoOutlined />, resource: "program", action: "read" },
    { label: "Courses", href: `/lms/programs/${id}/courses`, icon: <SchoolOutlined />, resource: "program", action: "read" },
    { label: "Members", href: `/lms/programs/${id}/members`, icon: <AssignmentTurnedInOutlined />, resource: "program", action: "read" },
  ];

  return (
    <PermissionGuard resource="program" action="read">
      <CModuleLayout navigators={navigators} helpTips={PROGRAM_TIPS.details}>
        <CForm onSubmit={canUpdate ? formik.handleSubmit : undefined} width="100%" btnProps={{ loading: isUpdating }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formik.values.courses?.map((courseItem, index) => (
              <Grid container spacing={2} key={index} alignItems="center">
                <Grid size={{ xs: 12, md: 7 }}>
                  <CSelect
                    label={`Course ${index + 1}`}
                    name={`courses[${index}].course_id`}
                    value={courseItem.course_id}
                    options={courseOptions}
                    onChange={(e) => {
                      formik.setFieldValue(`courses[${index}].course_id`, Number(e.target.value));
                    }}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <CTextField
                    label="Order Index"
                    name={`courses[${index}].order_index`}
                    type="number"
                    value={courseItem.order_index}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }} sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton
                    color="error"
                    onClick={() => {
                      const updated = formik.values.courses.filter((_, i) => i !== index);
                      const reordered = updated.map((item, idx) => ({
                        ...item,
                        order_index: idx,
                      }));
                      formik.setFieldValue("courses", reordered);
                    }}
                  >
                    <DeleteOutline />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <CButton
                label="Add Course"
                variant="outlined"
                onClick={() => {
                  formik.setFieldValue("courses", [
                    ...formik.values.courses,
                    { course_id: "", order_index: formik.values.courses.length },
                  ]);
                }}
              />
            </Box>
          </Stack>
        </CForm>
      </CModuleLayout>
    </PermissionGuard>
  );
}
