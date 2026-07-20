"use client"
import React, { useState } from "react"
import EmailTemplateList from "./_parts/EmailTemplateList"
import EmailTemplateCreateDialog from "./_parts/EmailTemplateCreateDialog"
import EmailTemplateEditDialog from "./_parts/EmailTemplateEditDialog"
import { Box, Stack, Divider, Typography, Chip } from "@mui/material"
import CModuleLayout from "@/components/ui/CModuleLayout"
import CHelpSidebar from "@/components/ui/CHelpSidebar"
import { toast } from "react-toastify"

const EMAIL_TEMPLATE_TIPS = {
  list: {
    description:
      "Configure standard email templates that can be dynamically customized with details from your users, courses, and batches. Use placeholders to personalize subject lines and email content.",
    tips: [
      {
        label: "Template Name",
        text: "A unique identifier (e.g. batch_enrollment_confirmation)",
      },
      {
        label: "Subject",
        text: "Supports template fields: {{ user_name }}, {{ title }}",
      },
      {
        label: "Placeholders",
        text: "You can reference fields from the context by using double curly braces, e.g., {{ user_name }} or {{ title }}. These will be resolved dynamically when sending an email.",
      },
      {
        label: "Content Type",
        text: "Plain text/markdown uses clean standard formatting, while HTML allows you to input raw email layouts.",
      },
    ],
  },
}

export default function EmailTemplatesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editTemplate, setEditTemplate] = useState(null)

  function handleAddOpen() {
    setIsAddOpen(true)
  }

  function handleEditOpen(template) {
    setEditTemplate(template)
    setIsEditOpen(true)
  }

  const handleCopyPlaceholder = placeholder => {
    navigator.clipboard.writeText(placeholder)
    toast.info(`Copied ${placeholder} to clipboard!`)
  }

  const userPlaceholders = [
    { key: "{{ user_name }}", label: "User Name" },
    { key: "{{ email }}", label: "Email Address" },
    { key: "{{ otp }}", label: "OTP Code" },
  ]

  const coursePlaceholders = [
    { key: "{{ title }}", label: "Course Title" },
    { key: "{{ instructor_name }}", label: "Instructor Name" },
  ]

  const batchPlaceholders = [
    { key: "{{ batch_name }}", label: "Batch Name" },
    { key: "{{ start_date }}", label: "Batch Start Date" },
  ]

  const helpSidebar = (
    <CHelpSidebar
      description={EMAIL_TEMPLATE_TIPS.list.description}
      tips={EMAIL_TEMPLATE_TIPS.list.tips}
    >
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        Available Placeholders:
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 1.5, lineHeight: 1.4 }}
      >
        Click any tag below to copy it to your clipboard.
      </Typography>

      <Stack spacing={2}>
        <Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, mb: 1, display: "block", color: "primary.main" }}
          >
            User Context Fields
          </Typography>
          <Stack spacing={1}>
            {userPlaceholders.map(ph => (
              <Box
                key={ph.key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  p: 0.75,
                  borderRadius: "8px",
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "text.primary", fontSize: "11px" }}
                >
                  {ph.label}
                </Typography>
                <Chip
                  label={ph.key}
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => handleCopyPlaceholder(ph.key)}
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "10px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, mb: 1, display: "block", color: "primary.main" }}
          >
            Course Context Fields
          </Typography>
          <Stack spacing={1}>
            {coursePlaceholders.map(ph => (
              <Box
                key={ph.key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  p: 0.75,
                  borderRadius: "8px",
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "text.primary", fontSize: "11px" }}
                >
                  {ph.label}
                </Typography>
                <Chip
                  label={ph.key}
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => handleCopyPlaceholder(ph.key)}
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "10px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, mb: 1, display: "block", color: "primary.main" }}
          >
            Batch Context Fields
          </Typography>
          <Stack spacing={1}>
            {batchPlaceholders.map(ph => (
              <Box
                key={ph.key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  p: 0.75,
                  borderRadius: "8px",
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "text.primary", fontSize: "11px" }}
                >
                  {ph.label}
                </Typography>
                <Chip
                  label={ph.key}
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => handleCopyPlaceholder(ph.key)}
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "10px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </CHelpSidebar>
  )

  return (
    <CModuleLayout HelpSidebar={helpSidebar}>
      <Box sx={{ width: "100%" }}>
        <EmailTemplateList onAddOpen={handleAddOpen} onEditOpen={handleEditOpen} />

        {isAddOpen && (
          <EmailTemplateCreateDialog
            open={isAddOpen}
            handleCDialogClose={() => setIsAddOpen(false)}
          />
        )}

        {isEditOpen && editTemplate && (
          <EmailTemplateEditDialog
            open={isEditOpen}
            handleCDialogClose={() => setIsEditOpen(false)}
            template={editTemplate}
          />
        )}
      </Box>
    </CModuleLayout>
  )
}
