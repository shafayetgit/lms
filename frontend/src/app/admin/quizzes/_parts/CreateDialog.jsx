"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import { Grid } from "@mui/material";

import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CCheckbox from "@/components/form/CCheckbox";
import CSelect from "@/components/form/CSelect";

import { toast } from "react-toastify";

import { useCreateQuizMutation } from "@/features/quiz/quizAPI";
import { useReadCoursesQuery } from "@/features/course/courseAPI";
import { quizValidationSchema } from "@/schema/quiz";
import { mapApiErrorsToFormik } from "@/utils/shared";

export default function CreateDialog() {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => setOpen(true);

  const [create, { isLoading: isCreatingQuiz }] = useCreateQuizMutation();
  const { data: coursesData, isLoading: isLoadingCourses } = useReadCoursesQuery({ size: 100 }, { skip: !open });

  const courseOptions = React.useMemo(() => {
    if (!coursesData?.data) return [];
    return coursesData.data.map(course => ({
      label: course.title,
      value: course.id,
    }));
  }, [coursesData]);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      course_id: "",
      time_limit: "",
      passing_score: 70,
      is_active: true,
    },
    validationSchema: quizValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const payload = {
          ...values,
          time_limit: values.time_limit ? Number(values.time_limit) : null,
          passing_score: Number(values.passing_score),
        };

        const response = await create(payload).unwrap();

        toast.success(response?.message || "Quiz created successfully");
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

  const isLoading = isCreatingQuiz || isLoadingCourses;

  return (
    <CDialog
      title="Create Quiz"
      btnProps={{ label: "Create Quiz", action: "add" }}
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
          {/* Title */}
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

          {/* Course */}
          <Grid size={{ xs: 12 }}>
            <CSelect
              label="Course"
              name="course_id"
              value={formik.values.course_id}
              options={courseOptions}
              onChange={(e) => formik.setFieldValue("course_id", e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched.course_id && Boolean(formik.errors.course_id)}
              helperText={formik.touched.course_id && formik.errors.course_id}
              required
            />
          </Grid>

          {/* Time Limit */}
          <Grid size={{ xs: 6 }}>
            <CTextField
              label="Time Limit (min)"
              name="time_limit"
              type="number"
              value={formik.values.time_limit}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.time_limit && Boolean(formik.errors.time_limit)}
              helperText={formik.touched.time_limit && formik.errors.time_limit}
            />
          </Grid>

          {/* Passing Score */}
          <Grid size={{ xs: 6 }}>
            <CTextField
              label="Passing Score (%)"
              name="passing_score"
              type="number"
              value={formik.values.passing_score}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.passing_score && Boolean(formik.errors.passing_score)}
              helperText={formik.touched.passing_score && formik.errors.passing_score}
              required
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
        </Grid>
      </CForm>
    </CDialog>
  );
}
