"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import Grid from "@mui/material/Grid";
import { Box, Tabs, Tab } from "@mui/material";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";

import { InfoOutlined, Assignment as AssignmentIcon } from "@mui/icons-material";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CSelect from "@/components/form/CSelect";
import CCheckbox from "@/components/form/CCheckbox";
import CPageLoader from "@/components/ui/CPageLoader";
import CAutocomplete from "@/components/form/CAutocomplete";
import CModuleLayout from "@/components/ui/CModuleLayout";
import PermissionGuard from "@/components/ui/PermissionGuard";
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb";
import { ASSIGNMENT_TIPS } from "@/choices/helpTips/assignment";

import { useReadAssignmentQuery, useUpdateAssignmentMutation } from "@/features/assignment/assignmentApi";
import { useReadCoursesQuery } from "@/features/course/courseAPI";
import { assignmentValidationSchema } from "@/schema/assignment";
import { mapApiErrorsToFormik } from "@/utils/shared";


export default function AssignmentDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const { data: assignmentRes, isLoading } = useReadAssignmentQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: !id,
  });

  const assignmentData = assignmentRes?.data || assignmentRes;
  useSetBreadcrumb(assignmentData?.title, `/lms/assignments/${id}`);

  const { data: coursesData } = useReadCoursesQuery();
  const courses = coursesData?.data || [];

  const [update, { isLoading: isUpdating }] = useUpdateAssignmentMutation();

  const formik = useFormik({
    initialValues: {
      title: assignmentData?.title ?? "",
      type: assignmentData?.type ?? "Text",
      question: assignmentData?.question ?? "",
      course_id: assignmentData?.course_id ?? null,
      answer: assignmentData?.answer ?? "",
      show_answer: assignmentData?.show_answer ?? false,
      grade_assignment: assignmentData?.grade_assignment ?? false,
    },
    validationSchema: assignmentValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        await update({ id, body: values }).unwrap();
        toast.success("Assignment updated successfully");
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        toast.error(error?.data?.message || "Update failed");
      }
    },
  });

  if (isLoading) return <CPageLoader fullPage={false} />;

  const navigators = [
    { label: "Details", href: `/lms/assignments/${id}`, icon: <InfoOutlined />, resource: "assignment", action: "read" },
    { label: "Submissions", href: `/lms/assignments/${id}/submissions`, icon: <AssignmentIcon />, resource: "assignment", action: "read" },
  ];

  return (
    <PermissionGuard resource="assignment" action="read">
      <CModuleLayout navigators={navigators} helpTips={ASSIGNMENT_TIPS.details}>
        <CForm onSubmit={formik.handleSubmit} width="50rem" btnProps={{ loading: isUpdating }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
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
            <Grid size={{ xs: 12, md: 4 }}>
              <CSelect
                label="Type"
                name="type"
                value={formik.values.type}
                options={[
                  { label: "Document", value: "Document" },
                  { label: "PDF", value: "PDF" },
                  { label: "URL", value: "URL" },
                  { label: "Image", value: "Image" },
                  { label: "Text", value: "Text" },
                ]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.type && Boolean(formik.errors.type)}
                helperText={formik.touched.type && formik.errors.type}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CTextField
                label="Question"
                name="question"
                multiline
                rows={4}
                value={formik.values.question}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.question && Boolean(formik.errors.question)}
                helperText={formik.touched.question && formik.errors.question}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CAutocomplete
                label="Course"
                name="course_id"
                options={courses.map((c) => ({ label: c.title, value: c.id }))}
                value={
                  formik.values.course_id
                    ? courses.map((c) => ({ label: c.title, value: c.id })).find((c) => c.value === formik.values.course_id) || null
                    : null
                }
                onChange={(e, val) => formik.setFieldValue("course_id", val?.value || null)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CTextField
                label="Answer (Optional)"
                name="answer"
                multiline
                rows={4}
                value={formik.values.answer}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.answer && Boolean(formik.errors.answer)}
                helperText={formik.touched.answer && formik.errors.answer}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CCheckbox
                label="Grade Assignment"
                checked={formik.values.grade_assignment}
                onChange={(e) => formik.setFieldValue("grade_assignment", e.target.checked)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CCheckbox
                label="Show Answer"
                checked={formik.values.show_answer}
                onChange={(e) => formik.setFieldValue("show_answer", e.target.checked)}
              />
            </Grid>
          </Grid>
        </CForm>
      </CModuleLayout>
    </PermissionGuard>
  );
}
