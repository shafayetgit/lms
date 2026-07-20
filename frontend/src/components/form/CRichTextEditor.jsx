import React, { useRef, useEffect } from "react"
import { Box, IconButton, Divider } from "@mui/material"
import FormatBoldIcon from "@mui/icons-material/FormatBold"
import FormatItalicIcon from "@mui/icons-material/FormatItalic"
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined"
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted"

export default function CRichTextEditor({
  value = "",
  onChange,
  placeholder = "Type here...",
  minHeight = "200px",
  sx = {},
}) {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value])

  const handleFormat = command => {
    document.execCommand(command, false, null)
    if (editorRef.current) {
      editorRef.current.focus()
      onChange && onChange(editorRef.current.innerHTML)
    }
  }

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML)
    }
  }

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        ...sx,
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          p: 1,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          flexWrap: "wrap",
        }}
      >
        <IconButton type="button" size="small" onClick={() => handleFormat("bold")} title="Bold">
          <FormatBoldIcon fontSize="small" />
        </IconButton>
        <IconButton
          type="button"
          size="small"
          onClick={() => handleFormat("italic")}
          title="Italic"
        >
          <FormatItalicIcon fontSize="small" />
        </IconButton>
        <IconButton
          type="button"
          size="small"
          onClick={() => handleFormat("underline")}
          title="Underline"
        >
          <FormatUnderlinedIcon fontSize="small" />
        </IconButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <IconButton
          type="button"
          size="small"
          onClick={() => handleFormat("insertUnorderedList")}
          title="Bulleted List"
        >
          <FormatListBulletedIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Editable Area */}
      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        sx={{
          minHeight,
          p: 2,
          outline: "none",
          overflowY: "auto",
          fontFamily: "var(--font-sans, Inter, Roboto, sans-serif)",
          fontSize: "14px",
          color: "text.primary",
          bgcolor: "background.paper",
          "&[contenteditable=true]:empty:before": {
            content: "attr(placeholder)",
            color: "text.disabled",
            pointerEvents: "none",
            display: "block",
          },
        }}
        placeholder={placeholder}
      />
    </Box>
  )
}
