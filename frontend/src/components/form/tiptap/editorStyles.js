// Editor content area MUI sx styles (theme-dependent)
export function getEditorStyles(theme, alpha) {
  return {
    bgcolor: "background.paper",
    color: "text.primary",
    "& .tiptap": { outline: "none", overflowY: "auto" },
    // Placeholder
    "& .tiptap p.is-editor-empty:first-child::before": {
      content: "attr(data-placeholder)",
      color: "text.disabled",
      float: "left",
      height: 0,
      pointerEvents: "none",
    },
    // Headings
    "& .tiptap h1": { fontSize: "1.75rem", fontWeight: 700, mt: 1, mb: 0.5 },
    "& .tiptap h2": { fontSize: "1.5rem", fontWeight: 700, mt: 1, mb: 0.5 },
    "& .tiptap h3": { fontSize: "1.25rem", fontWeight: 600, mt: 1, mb: 0.5 },
    // Lists
    "& .tiptap ul, & .tiptap ol": { pl: 3 },
    "& .tiptap li": { mb: 0.25 },
    // Blockquote
    "& .tiptap blockquote": {
      borderLeft: `3px solid ${theme.palette.primary.main}`,
      pl: 2,
      ml: 0,
      color: "text.secondary",
      fontStyle: "italic",
    },
    // Inline code
    "& .tiptap code": {
      bgcolor: alpha(theme.palette.primary.main, 0.08),
      color: "primary.main",
      px: 0.75,
      py: 0.25,
      borderRadius: 0.5,
      fontFamily: "monospace",
      fontSize: "0.875em",
    },
    // Code block
    "& .tiptap pre": {
      bgcolor: alpha(theme.palette.text.primary, 0.05),
      borderRadius: 1,
      p: 2,
      overflow: "auto",
      "& code": { bgcolor: "transparent", color: "text.primary", px: 0, py: 0 },
    },
    // Horizontal rule
    "& .tiptap hr": {
      border: "none",
      borderTop: `1px solid ${theme.palette.divider}`,
      my: 2,
    },
    // Images
    "& .tiptap img": { maxWidth: "100%", height: "auto", borderRadius: 1, my: 1 },
    // Table
    "& .tiptap table": {
      borderCollapse: "collapse",
      width: "100%",
      my: 1,
      "& th, & td": {
        border: `1px solid ${theme.palette.divider}`,
        p: 1,
        minWidth: 80,
        verticalAlign: "top",
      },
      "& th": {
        bgcolor: alpha(theme.palette.primary.main, 0.06),
        fontWeight: 600,
      },
    },
    // Links
    "& .tiptap a": {
      color: "primary.main",
      textDecoration: "underline",
      cursor: "pointer",
    },
    // YouTube iframe
    "& .tiptap iframe": { maxWidth: "100%", borderRadius: 1, my: 1 },
  }
}
