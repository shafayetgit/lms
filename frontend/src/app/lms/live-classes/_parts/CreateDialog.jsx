"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import { Grid, InputAdornment, Typography } from "@mui/material";
import { toast } from "react-toastify";

import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CNumberField from "@/components/form/CNumberField";
import CCheckbox from "@/components/form/CCheckbox";
import CSelect from "@/components/form/CSelect";
import CDatePicker from "@/components/form/CDatePicker";
import CTimePicker from "@/components/form/CTimePicker";

import { useCreateLiveClassMutation } from "@/features/liveClass/liveClassApi";
import { liveClassValidationSchema } from "@/schema/liveClass";
import { mapApiErrorsToFormik } from "@/utils/shared";
import dayjs from "dayjs";

export default function CreateDialog() {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const [create, { isLoading: isCreating }] = useCreateLiveClassMutation();

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      batch_id: null,
      course_id: null,
      host_id: 1, // Assume Admin or self for now
      date: dayjs().format("YYYY-MM-DD"),
      time: "10:00",
      duration: 60,
      timezone: "UTC",
      meeting_link: "",
      password: "",
      auto_recording: false,
      status: "Scheduled",
    },
    validationSchema: liveClassValidationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        await create(values).unwrap();
        toast.success("Live class scheduled successfully");
        resetForm();
        handleClose();
      } catch (error) {
        const errors = mapApiErrorsToFormik(error);
        setErrors(errors);
        toast.error(error?.data?.message || "Scheduling failed.");
      }
    },
  });

  return (
    <CDialog
      resource="live_class"
      action="create"
      title="Schedule Live Class"
      btnProps={{ label: "Schedule Class", action: "add" }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm onSubmit={formik.handleSubmit} width="40rem" btnProps={{ loading: isCreating }} dialog>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
             {formik.errors.course_id && typeof formik.errors.course_id === 'string' && (
                 <Typography color="error" variant="caption">{formik.errors.course_id}</Typography>
             )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Class Title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CNumberField
              label="Course ID"
              name="course_id"
              value={formik.values.course_id || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.course_id && Boolean(formik.errors.course_id)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
             <CNumberField
              label="Batch ID"
              name="batch_id"
              value={formik.values.batch_id || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.batch_id && Boolean(formik.errors.batch_id)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CDatePicker
              label="Date"
              name="date"
              value={dayjs(formik.values.date)}
              onChange={(val) => formik.setFieldValue("date", dayjs(val).format("YYYY-MM-DD"))}
              error={formik.touched.date && Boolean(formik.errors.date)}
              helperText={formik.touched.date && formik.errors.date}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CTimePicker
              label="Time"
              name="time"
              value={dayjs(`2000-01-01T${formik.values.time}`)}
              onChange={(val) => formik.setFieldValue("time", dayjs(val).format("HH:mm"))}
              error={formik.touched.time && Boolean(formik.errors.time)}
              helperText={formik.touched.time && formik.errors.time}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
             <CNumberField
              label="Duration"
              name="duration"
              value={formik.values.duration}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              InputProps={{
                 endAdornment: <InputAdornment position="end">min</InputAdornment>,
              }}
              error={formik.touched.duration && Boolean(formik.errors.duration)}
              helperText={formik.touched.duration && formik.errors.duration}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
             <CSelect
              label="Timezone"
              name="timezone"
              value={formik.values.timezone}
              onChange={formik.handleChange}
              options={[{label: "UTC", value: "UTC"}, {label: "Asia/Dhaka", value: "Asia/Dhaka"}, {label: "America/New_York", value: "America/New_York"}]}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
             <CTextField
              label="Meeting Link"
              name="meeting_link"
              value={formik.values.meeting_link}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.meeting_link && Boolean(formik.errors.meeting_link)}
              helperText={formik.touched.meeting_link && formik.errors.meeting_link}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
             <CTextField
              label="Meeting Password (Optional)"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
             <CCheckbox
              label="Auto Record Meeting"
              checked={formik.values.auto_recording}
              onChange={(e) => formik.setFieldValue("auto_recording", e.target.checked)}
            />
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
  );
}
