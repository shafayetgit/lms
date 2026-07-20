"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import CDialog from "@/components/ui/CDialog";
import CForm from "@/components/ui/CForm";
import CTextField from "@/components/form/CTextField";
import CSelect from "@/components/form/CSelect";
import CCheckbox from "@/components/form/CCheckbox";
import CSectionLabel from "@/components/ui/CSectionLabel";
import CTiptap from "@/components/form/CTiptap";
import { useUpdateEmailTemplateMutation } from "@/features/shared/emailTemplateAPI";

const CONTENT_TYPES = [
  { label: "Rich Text", value: "rich_text" },
  { label: "HTML Layout", value: "html" },
  { label: "Plain Text / Markdown", value: "plain_text" },
];

export default function EmailTemplateEditDialog({ open, handleCDialogClose, template }) {
  const [values, setValues] = useState({
    name: template.name || "",
    subject: template.subject || "",
    content_type: template.content_type || "rich_text",
    content: template.content || "",
    enabled: template.enabled !== undefined ? template.enabled : true,
  });
  const [errors, setErrors] = useState({});
  const [updateTemplate, { isLoading }] = useUpdateEmailTemplateMutation();

  useEffect(() => {
    if (template) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues({
        name: template.name || "",
        subject: template.subject || "",
        content_type: template.content_type || "rich_text",
        content: template.content || "",
        enabled: template.enabled !== undefined ? template.enabled : true,
      });
      setErrors({});
    }
  }, [template, open]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errs = {};
    if (!values.name?.trim()) errs.name = "Template Name/ID is required";
    if (!values.subject?.trim()) errs.subject = "Subject is required";
    if (!values.content?.trim()) {
      errs.content = "Template Content is required";
    }

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      await updateTemplate({ id: template.public_id, body: values }).unwrap();
      toast.success("Email template updated successfully");
      handleCDialogClose();
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.detail || "Failed to update email template");
    }
  }

  return (
    <CDialog
      title="Edit Email Template"
      open={open}
      handleCDialogClose={handleCDialogClose}
      maxWidth="md"
    >
      <Box sx={{ mt: 1 }}>
        <CForm onSubmit={handleSubmit} btnProps={{ loading: isLoading, label: "Save" }} width="100%">
          <Stack spacing={3}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CTextField
                  label="Template Name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CTextField
                  label="Subject"
                  name="subject"
                  value={values.subject}
                  onChange={handleChange}
                  error={!!errors.subject}
                  helperText={errors.subject}
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CSelect
                  label="Content Type"
                  name="content_type"
                  value={values.content_type}
                  onChange={handleChange}
                  options={CONTENT_TYPES}
                  error={!!errors.content_type}
                  helperText={errors.content_type}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
                <CCheckbox
                  label="Enabled"
                  name="enabled"
                  checked={values.enabled}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            {values.content_type === "rich_text" && (
              <CTiptap
                value={values.content}
                onChange={(val) => {
                  setValues((v) => ({ ...v, content: val }));
                  if (errors.content) setErrors((e) => ({ ...e, content: undefined }));
                }}
                error={!!errors.content}
                helperText={errors.content || "Write standard rich text for your email body"}
                placeholder="Write your email body here..."
              />
            )}

            {values.content_type === "html" && (
              <CTextField
                label="Raw HTML Code"
                name="content"
                value={values.content}
                onChange={handleChange}
                error={!!errors.content}
                helperText={errors.content || "Write or paste raw HTML code (including optional head, style tags)"}
                multiline
                rows={12}
                required
              />
            )}

            {values.content_type === "plain_text" && (
              <CTextField
                label="Plain Text / Markdown"
                name="content"
                value={values.content}
                onChange={handleChange}
                error={!!errors.content}
                helperText={errors.content || "Write plain text/markdown email body"}
                multiline
                rows={10}
                required
              />
            )}
          </Stack>
        </CForm>
      </Box>
    </CDialog>
  );
}
