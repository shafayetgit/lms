"use client"
import React from "react"
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  Avatar,
} from "@mui/material"
import Grid from "@mui/material/Grid"
import {
  EditOutlined,
  CodeOutlined,
  TextFieldsOutlined,
  DescriptionOutlined as DescriptionOutlinedIcon,
  CheckCircleOutline,
  RadioButtonUnchecked,
} from "@mui/icons-material"
import CButton from "@/components/ui/CButton"
import CPageLoader from "@/components/ui/CPageLoader"
import { useListEmailTemplatesQuery } from "@/features/shared/emailTemplateAPI"
import CDelete from "@/components/actions/CDelete"

export default function EmailTemplateList({ onAddOpen, onEditOpen }) {
  const theme = useTheme()
  const { data, isLoading } = useListEmailTemplatesQuery({})

  const templates = data?.data || []

  return (
    <Box>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={600} mb={0.5}>
            Email Templates
          </Typography>
        </Box>
        <CButton label="New Template" onClick={onAddOpen} action="create" variant="contained" />
      </Box>

      {isLoading && (
        <Box sx={{ mt: 4 }}>
          <CPageLoader fullPage={false} />
        </Box>
      )}

      {/* Empty state */}
      {!isLoading && templates.length === 0 && (
        <Box
          sx={{
            py: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <DescriptionOutlinedIcon
            sx={{ fontSize: 28, mb: 1.5, color: "text.secondary", opacity: 0.6 }}
          />
          <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "text.primary", mb: 0.5 }}>
            No Templates Found
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "text.secondary", opacity: 0.8 }}>
            No email templates have been created yet. Click &quot;New Template&quot; to add one.
          </Typography>
        </Box>
      )}

      {/* Templates list */}
      {!isLoading && templates.length > 0 && (
        <Grid container spacing={2.5}>
          {templates.map(template => {
            return (
              <Grid key={template.public_id} size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    overflow: "hidden",
                    transition: "box-shadow 0.2s, border-color 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: theme.shadows[1],
                    },
                  }}
                >
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      cursor: "pointer",
                    }}
                    onClick={() => onEditOpen(template)}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "secondary.main",
                        color: "secondary.contrastText",
                        fontSize: "1rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {template.content_type === "html" ? (
                        <CodeOutlined fontSize="small" sx={{ color: "inherit" }} />
                      ) : (
                        <TextFieldsOutlined fontSize="small" sx={{ color: "inherit" }} />
                      )}
                    </Avatar>

                    {/* Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body1" fontWeight={600} noWrap>
                          {template.name}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={e => {
                            e.stopPropagation()
                            onEditOpen(template)
                          }}
                          sx={{ color: "text.secondary" }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Box onClick={e => e.stopPropagation()}>
                        <CDelete
                          size="small"
                          sx={{ color: "error.light" }}
                          values={{
                            model: "EmailTemplate",
                            filters: [
                              { field: "public_id", operator: "eq", value: template.public_id },
                            ],
                          }}
                          invalidateTag="EMAIL_TEMPLATES"
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Template Content Preview */}
                  <Divider />
                  <Box
                    sx={{
                      px: 2.5,
                      py: 2.5,
                      cursor: "pointer",
                    }}
                    onClick={() => onEditOpen(template)}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        mb: 1.5,
                        fontFamily: "inherit",
                      }}
                    >
                      Subject: {template.subject}
                    </Typography>
                    <Box
                      sx={{
                        position: "relative",
                        maxHeight: "90px",
                        overflow: "hidden",
                        fontSize: "0.875rem",
                        lineHeight: 1.6,
                        color: "text.secondary",
                        fontFamily: "inherit",
                        whiteSpace:
                          template.content_type === "html" || template.content_type === "rich_text"
                            ? "normal"
                            : "pre-line",
                        "& *:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6)": {
                          color: "inherit !important",
                          backgroundColor: "transparent !important",
                        },
                        "& p, & ul, & ol": {
                          margin: "0 0 8px 0",
                          padding: 0,
                        },
                        "& h1, & h2, & h3, & h4, & h5, & h6": {
                          margin: "0 0 8px 0",
                          padding: 0,
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: "text.primary !important",
                          backgroundColor: "transparent !important",
                        },
                        "& ul, & ol": {
                          paddingLeft: "20px",
                        },
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          width: "100%",
                          height: "30px",
                          background: theme =>
                            `linear-gradient(to bottom, transparent, ${theme.palette.background.paper})`,
                          pointerEvents: "none",
                        },
                      }}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: getCleanPreviewHTML(template.content, template.content_type),
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Status bar */}
                  <Divider />
                  <Box sx={{ px: 2.5, py: 1.5, display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <FeatureFlag
                      label={
                        template.content_type === "html"
                          ? "HTML Layout Format"
                          : template.content_type === "rich_text"
                            ? "Rich Text Format"
                            : "Plain Text / Markdown Format"
                      }
                      active={true}
                    />
                    <FeatureFlag
                      label={template.enabled ? "Enabled" : "Disabled"}
                      active={template.enabled}
                    />
                  </Box>
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}

function FeatureFlag({ label, active }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {active ? (
        <CheckCircleOutline sx={{ fontSize: 15, color: "success.main" }} />
      ) : (
        <RadioButtonUnchecked sx={{ fontSize: 15, color: "text.disabled" }} />
      )}
      <Typography
        variant="caption"
        color={active ? "text.primary" : "text.disabled"}
        fontWeight={active ? 600 : 400}
      >
        {label}
      </Typography>
    </Box>
  )
}

// Clean HTML template content to only show core body text without headers, footers, or style blocks
function getCleanPreviewHTML(content, contentType) {
  if (!content) return ""

  if (contentType === "html" || contentType === "rich_text") {
    // 1. Try to extract content inside the 'content' class div
    const contentMatch = content.match(
      /<div\s+class=['"]content['"]>([\s\S]*?)<\/div>\s*<div\s+class=['"]footer['"]/i
    )
    if (contentMatch && contentMatch[1]) {
      return contentMatch[1].trim()
    }

    // Fallback: extract body
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    let html = bodyMatch ? bodyMatch[1] : content

    // Remove style/head/script blocks
    html = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")

    return html.trim()
  }

  if (contentType === "plain_text" || contentType === "markdown") {
    return parseMarkdownToHTML(content)
  }

  return content
}

// Convert basic markdown formatting into HTML safely for the preview display
function parseMarkdownToHTML(text) {
  if (!text) return ""

  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  const lines = escaped.split("\n")
  const processedLines = lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed) return ""

    if (trimmed.startsWith("### ")) {
      return `<h3>${trimmed.slice(4)}</h3>`
    }
    if (trimmed.startsWith("## ")) {
      return `<h2>${trimmed.slice(3)}</h2>`
    }
    if (trimmed.startsWith("# ")) {
      return `<h1>${trimmed.slice(2)}</h1>`
    }

    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      return `<li>${trimmed.slice(2)}</li>`
    }

    return trimmed
  })

  let html = processedLines.join("\n")

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>")
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  )

  html = html
    .replace(/<\/h1>\n/g, "</h1>")
    .replace(/<\/h2>\n/g, "</h2>")
    .replace(/<\/h3>\n/g, "</h3>")
    .replace(/<\/li>\n/g, "</li>")
    .replace(/\n+/g, "<br />")

  return html
}
