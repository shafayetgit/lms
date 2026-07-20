"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import { Grid } from "@mui/material";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import * as Yup from "yup";

import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CDatePicker from "@/components/form/CDatePicker";
import CAutocomplete from "@/components/form/CAutocomplete";

import { useCreateEvaluationMutation } from "@/features/certificate/certificateApi";
import { useReadCoursesQuery } from "@/features/course/courseAPI";
import { useReadBatchesQuery } from "@/features/batch/batchAPI";
import { useGetUsersQuery } from "@/features/user/userAPI";
import { useReadInstructorsQuery } from "@/features/instructor/instructorAPI";
import { mapApiErrorsToFormik } from "@/utils/shared";

const validationSchema = Yup.object().shape({
  member_public_id: Yup.string().required("Student is required"),
  course_public_id: Yup.string().nullable(),
  batch_public_id: Yup.string().nullable(),
  evaluator_public_id: Yup.string().nullable(),
  date: Yup.date().nullable(),
  start_time: Yup.string().nullable(),
  end_time: Yup.string().nullable(),
}).test(
  "at-least-one",
  "Must provide either a course or a batch",
  (value) => !!value.course_public_id || !!value.batch_public_id
);

export default function CreateDialog() {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const [create, { isLoading: isCreating }] = useCreateEvaluationMutation();
  const { data: coursesData } = useReadCoursesQuery();
  const courses = coursesData?.data || [];
  
  const { data: batchesData } = useReadBatchesQuery();
  const batches = batchesData?.data || [];
  
  const { data: usersData } = useGetUsersQuery();
  const users = usersData?.data || [];

  const { data: instructorsData } = useReadInstructorsQuery({ size: 100 });
  const instructors = instructorsData?.data || [];

  const formik = useFormik({
    initialValues: {
      member_public_id: "",
      course_public_id: null,
      batch_public_id: null,
      evaluator_public_id: null,
      date: null,
      start_time: "",
      end_time: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const payload = {
            ...values,
            date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : null,
            start_time: values.start_time || null,
            end_time: values.end_time || null,
        }
        await create(payload).unwrap();
        toast.success("Evaluation session scheduled successfully");
        resetForm();
        handleClose();
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        toast.error(error?.data?.message || "Failed to schedule evaluation.");
      }
    },
  });

  return (
    <CDialog
      resource="evaluation"
      action="create"
      title="Schedule Evaluation"
      btnProps={{ label: "Schedule Evaluation", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm onSubmit={formik.handleSubmit} width="40rem" btnProps={{ action:"", label: "Create", loading: isCreating }} dialog>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CAutocomplete
              label="Student"
              name="member_public_id"
              options={users.map((u) => ({ label: `${u.first_name} ${u.last_name} (${u.email})`, value: u.public_id }))}
              value={
                formik.values.member_public_id
                  ? { label: users.find((u) => u.public_id === formik.values.member_public_id)?.email, value: formik.values.member_public_id }
                  : null
              }
              onChange={(e, val) => formik.setFieldValue("member_public_id", val?.value || "")}
              error={formik.touched.member_public_id && Boolean(formik.errors.member_public_id)}
              helperText={formik.touched.member_public_id && formik.errors.member_public_id}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <CAutocomplete
              label="Course"
              name="course_public_id"
              options={courses.map((c) => ({ label: c.title, value: c.public_id }))}
              value={
                formik.values.course_public_id
                  ? { label: courses.find((c) => c.public_id === formik.values.course_public_id)?.title, value: formik.values.course_public_id }
                  : null
              }
              onChange={(e, val) => formik.setFieldValue("course_public_id", val?.value || null)}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <CAutocomplete
              label="Batch"
              name="batch_public_id"
              options={batches.map((b) => ({ label: b.title, value: b.public_id }))}
              value={
                formik.values.batch_public_id
                  ? { label: batches.find((b) => b.public_id === formik.values.batch_public_id)?.title, value: formik.values.batch_public_id }
                  : null
              }
              onChange={(e, val) => formik.setFieldValue("batch_public_id", val?.value || null)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CAutocomplete
              label="Evaluator / Instructor"
              name="evaluator_public_id"
              options={instructors.map((inst) => ({ label: `${inst.first_name} ${inst.last_name} (${inst.email})`, value: inst.public_id }))}
              value={
                formik.values.evaluator_public_id
                  ? { label: instructors.find((inst) => inst.public_id === formik.values.evaluator_public_id)?.email, value: formik.values.evaluator_public_id }
                  : null
              }
              onChange={(e, val) => formik.setFieldValue("evaluator_public_id", val?.value || null)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <CDatePicker
              label="Date"
              name="date"
              value={formik.values.date}
              onChange={(val) => formik.setFieldValue("date", val)}
              error={formik.touched.date && Boolean(formik.errors.date)}
              helperText={formik.touched.date && formik.errors.date}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <CTextField
              label="Start Time"
              name="start_time"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={formik.values.start_time}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.start_time && Boolean(formik.errors.start_time)}
              helperText={formik.touched.start_time && formik.errors.start_time}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <CTextField
              label="End Time"
              name="end_time"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={formik.values.end_time}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.end_time && Boolean(formik.errors.end_time)}
              helperText={formik.touched.end_time && formik.errors.end_time}
            />
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
  );
}
