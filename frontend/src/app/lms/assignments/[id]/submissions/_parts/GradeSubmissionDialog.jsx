"use client";
import React, { useEffect } from "react";
import { useFormik } from "formik";
import Grid from "@mui/material/Grid";
import { Box, Typography, Stack, Divider, Paper } from "@mui/material";
import { toast } from "react-toastify";
import * as Yup from "yup";

import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CSelect from "@/components/form/CSelect";
import CSectionLabel from "@/components/ui/CSectionLabel";
import { useGradeSubmissionMutation } from "@/features/assignment/assignmentApi";

const validationSchema = Yup.object().shape({
  status: Yup.string().required("Status is required"),
  grade: Yup.number()
    .min(0, "Grade must be at least 0")
    .max(100, "Grade cannot exceed 100")
    .nullable(),
  comments: Yup.string().nullable(),
});

export default function GradeSubmissionDialog({ open, handleClose, submission, assignment }) {
  const [gradeSubmission, { isLoading }] = useGradeSubmissionMutation();

  const formik = useFormik({
    initialValues: {
      status: "Pending",
      grade: "",
      comments: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          status: values.status,
          comments: values.comments || null,
        };

        if (assignment?.grade_assignment) {
          payload.grade = values.grade !== "" ? Number(values.grade) : null;
        }

        await gradeSubmission({
          id: assignment?.public_id || assignment?.id,
          sub_id: submission.public_id,
          body: payload,
        }).unwrap();

        toast.success("Submission graded successfully");
        handleClose();
      } catch (error) {
        toast.error(error?.data?.message || "Failed to grade submission.");
      }
    },
  });

  const { setValues } = formik;

  useEffect(() => {
    if (submission) {
      setValues({
        status: submission.status || "Pending",
        grade: submission.grade !== null && submission.grade !== undefined ? submission.grade : "",
        comments: submission.comments || "",
      });
    }
  }, [submission, setValues]);

  if (!submission) return null;

  const isAttachment = ["Document", "PDF", "Image"].includes(assignment?.type);

  return (
    <CDialog
      title="Review & Grade Submission"
      open={open}
      handleCDialogClose={handleClose}
      maxWidth="md"
    >
      <CForm onSubmit={formik.handleSubmit} width="45rem" btnProps={{ loading: isLoading }} dialog>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.neutral", borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Student Information
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {submission.member?.full_name || "Unknown Student"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {submission.member?.email || "No email provided"}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box>
              <CSectionLabel label="Student's Answer / Submission" />
              <Paper variant="outlined" sx={{ p: 2, mt: 1, minHeight: "80px", borderRadius: 1 }}>
                {isAttachment ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Submitted File Attachment:
                    </Typography>
                    {submission.answer ? (
                      <Typography
                        component="a"
                        href={submission.answer}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: "primary.main",
                          textDecoration: "underline",
                          fontWeight: 500,
                          display: "inline-block",
                          mt: 0.5,
                        }}
                      >
                        View Attachment (New Tab)
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No attachment file uploaded.
                      </Typography>
                    )}
                  </Box>
                ) : assignment?.type === "URL" ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Submitted URL:
                    </Typography>
                    {submission.answer ? (
                      <Typography
                        component="a"
                        href={submission.answer}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: "primary.main",
                          textDecoration: "underline",
                          fontWeight: 500,
                          wordBreak: "break-all",
                        }}
                      >
                        {submission.answer}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No URL provided.
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Written Response:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        fontFamily: "monospace",
                        bgcolor: "background.neutral",
                        p: 1.5,
                        borderRadius: 0.5,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      {submission.answer || "No written response provided."}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CSectionLabel label="Grading & Feedback" />
          </Grid>

          <Grid size={{ xs: 12, md: assignment?.grade_assignment ? 6 : 12 }}>
            <CSelect
              label="Evaluation Status"
              name="status"
              value={formik.values.status}
              options={[
                { label: "Pending Review", value: "Pending" },
                { label: "Accepted", value: "Accepted" },
                { label: "Rejected", value: "Rejected" },
              ]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={formik.touched.status && formik.errors.status}
              required
            />
          </Grid>

          {assignment?.grade_assignment && (
            <Grid size={{ xs: 12, md: 6 }}>
              <CTextField
                label="Score / Grade (0 - 100)"
                name="grade"
                type="number"
                inputProps={{ min: 0, max: 100 }}
                value={formik.values.grade}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.grade && Boolean(formik.errors.grade)}
                helperText={formik.touched.grade && formik.errors.grade}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <CTextField
              label="Evaluator Comments / Feedback"
              name="comments"
              multiline
              rows={4}
              value={formik.values.comments}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.comments && Boolean(formik.errors.comments)}
              helperText={formik.touched.comments && formik.errors.comments}
            />
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
  );
}
