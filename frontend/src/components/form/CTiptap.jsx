"use client"
import React, { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { Box, Typography, alpha, useTheme } from "@mui/material"

import { getExtensions } from "./tiptap/extensions"
import { getEditorStyles } from "./tiptap/editorStyles"
import CTiptapToolbar from "./tiptap/CTiptapToolbar"

/**
 * CTiptap – Reusable Tiptap rich-text editor component.
 *
 * Props:
 *  - value        : HTML string (controlled)
 *  - onChange      : (html: string) => void
 *  - placeholder   : placeholder text
 *  - minHeight     : CSS min-height for editor area
 *  - label         : optional label above editor
 *  - error         : boolean – show error state
 *  - helperText    : helper/error text below editor
 *  - sx            : outer Box sx overrides
 */
export default function CTiptap({
  value = "",
  onChange,
  placeholder = "Type here...",
  minHeight = "200px",
  maxHeight = "400px",
  label,
  error,
  helperText,
  sx = {},
}) {
  const theme = useTheme()

  const editor = useEditor({
    extensions: getExtensions(placeholder),
    content: value || "",
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      const isEmpty = html === "<p></p>" || html === ""
      onChange?.(isEmpty ? "" : html)
    },
    editorProps: {
      attributes: {
        style: [
          `min-height:${minHeight}`,
          `max-height:${maxHeight}`,
          "overflow-y:auto",
          "outline:none",
          "padding:16px",
          "font-family:var(--font-sans,Inter,Roboto,sans-serif)",
          "font-size:14px",
          "line-height:1.7",
        ].join(";"),
      },
    },
  })

  // Sync when parent value changes externally
  useEffect(() => {
    if (!editor) return
    const cur = editor.getHTML()
    const normCur = cur === "<p></p>" ? "" : cur
    const normVal = value || ""
    if (normCur !== normVal) {
      editor.commands.setContent(normVal, false)
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <Box sx={{ ...sx }}>
      {/* Optional label */}
      {label && (
        <Typography
          component="label"
          variant="body2"
          sx={{
            display: "block",
            mb: 0.5,
            fontWeight: 500,
            color: error ? "error.main" : "text.secondary",
          }}
        >
          {label}
        </Typography>
      )}

      <Box
        sx={{
          border: "1px solid",
          borderColor: error ? "error.main" : "divider",
          borderRadius: 1,
          overflow: "hidden",
          transition: "border-color 0.2s",
          "&:focus-within": {
            borderColor: error ? "error.main" : "primary.main",
            boxShadow: `0 0 0 2px ${alpha(
              error ? theme.palette.error.main : theme.palette.primary.main,
              0.15
            )}`,
          },
        }}
      >
        {/* Toolbar */}
        <CTiptapToolbar editor={editor} />

        {/* Editor content */}
        <Box sx={getEditorStyles(theme, alpha)}>
          <EditorContent editor={editor} />
        </Box>
      </Box>

      {/* Helper / error text */}
      {helperText && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            color: error ? "error.main" : "text.secondary",
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  )
}
