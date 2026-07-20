"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import { Grid } from "@mui/material";
import { toast } from "react-toastify";

import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CSelect from "@/components/form/CSelect";
import CCheckbox from "@/components/form/CCheckbox";
import CAutocomplete from "@/components/form/CAutocomplete";

import { useCreateAssignmentMutation } from "@/features/assignment/assignmentApi";
import { useReadCoursesQuery } from "@/features/course/courseAPI";
import { assignmentValidationSchema } from "@/schema/assignment";
import { mapApiErrorsToFormik } from "@/utils/shared";

export default function CreateDialog() {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const [create, { isLoading: isCreating }] = useCreateAssignmentMutation();
  const { data: coursesData } = useReadCoursesQuery();
  const courses = coursesData?.data || [];

  const formik = useFormik({
    initialValues: {
      title: "",
      type: "Text",
      question: "",
      course_id: null,
      grade_assignment: false,
      show_answer: false,
    },
    validationSchema: assignmentValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        await create(values).unwrap();
        toast.success("Assignment created successfully");
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
      resource="assignment"
      action="create"
      title="New Assignment"
      btnProps={{ label: "New Assignment", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm onSubmit={formik.handleSubmit} width="40rem" btnProps={{ action:"", label: "Create", loading: isCreating }} dialog>
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
    </CDialog>
  );
}
