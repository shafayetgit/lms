import * as React from "react"
import { useState, useRef, useCallback } from "react"
import { styled } from "@mui/material/styles"
import Button from "@mui/material/Button"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined"
import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"
import { Typography, Box, IconButton } from "@mui/material"

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
})

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]

function FilePreviewGrid({ files, onRemove, onAdd }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, width: "100%", mt: 1 }}>
      {files.map((f, i) => (
        <Box
          key={i}
          sx={{
            position: "relative",
            width: 72,
            height: 72,
            borderRadius: 2,
            overflow: "hidden",
            border: "0.5px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          {IMAGE_TYPES.includes(f.type) ? (
            <Box
              component="img"
              src={f.preview}
              alt={f.name}
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                bgcolor: "background.default",
                px: 0.5,
              }}
            >
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "100%",
                  textAlign: "center",
                  fontSize: 10,
                  px: 0.5,
                }}
              >
                {f.name}
              </Typography>
            </Box>
          )}

          <IconButton
            size="small"
            onClick={e => { e.stopPropagation(); onRemove(i) }}
            sx={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 18,
              height: 18,
              bgcolor: "rgba(0,0,0,0.55)",
              color: "white",
              "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
              p: 0,
            }}
          >
            <CloseIcon sx={{ fontSize: 11 }} />
          </IconButton>
        </Box>
      ))}

      {/* Add more tile */}
      {onAdd && (
        <Box
          onClick={e => { e.stopPropagation(); onAdd() }}
          sx={{
            width: 72,
            height: 72,
            borderRadius: 2,
            border: "1.5px dashed",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "text.disabled",
            "&:hover": { borderColor: "primary.main", color: "primary.main" },
          }}
        >
          <AddIcon sx={{ fontSize: 20 }} />
        </Box>
      )}
    </Box>
  )
}

export default function CFileField({
  label,
  name,
  onChange,
  multiple = false,
  disabled = false,
  error = false,
  size = "small",
  required = false,
  helperText,
  dragNdrop = true,
  showPreview = true,
  ...other
}) {
  const [fileEntries, setFileEntries] = useState([]) // [{ file, name, type, preview }]
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  // Build preview entries from a FileList
  const buildEntries = useCallback(fileList => {
    return Array.from(fileList).map(file => ({
      file,
      name: file.name,
      type: file.type,
      preview: IMAGE_TYPES.includes(file.type) ? URL.createObjectURL(file) : null,
    }))
  }, [])

  // Sync entries → hidden input via DataTransfer, fire onChange
  const commitEntries = useCallback(
    entries => {
      setFileEntries(entries)
      const dt = new DataTransfer()
      entries.forEach(e => dt.items.add(e.file))
      if (inputRef.current) inputRef.current.files = dt.files
      onChange({ target: { files: dt.files, name } })
    },
    [name, onChange]
  )

  const handleFileChange = e => {
    const incoming = buildEntries(e.target.files)
    const merged = multiple ? [...fileEntries, ...incoming] : incoming
    commitEntries(merged)
  }

  const handleDrop = useCallback(
    e => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return
      const incoming = buildEntries(e.dataTransfer.files)
      const merged = multiple ? [...fileEntries, ...incoming] : incoming
      commitEntries(merged)
    },
    [disabled, multiple, fileEntries, buildEntries, commitEntries]
  )

  const handleRemove = useCallback(
    index => {
      const next = fileEntries.filter((_, i) => i !== index)
      URL.revokeObjectURL(fileEntries[index].preview)
      commitEntries(next)
    },
    [fileEntries, commitEntries]
  )

  const handleDragOver = e => { e.preventDefault(); if (!disabled) setIsDragging(true) }
  const handleDragLeave = e => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false) }

  const hasFiles = fileEntries.length > 0
  const fileCountLabel = `${fileEntries.length} file${fileEntries.length > 1 ? "s" : ""} selected`

  const hiddenInput = (
    <VisuallyHiddenInput
      ref={inputRef}
      type="file"
      multiple={multiple}
      onChange={handleFileChange}
      disabled={disabled}
      name={name}
      {...other}
    />
  )

  const preview = showPreview && hasFiles && (
    <FilePreviewGrid
      files={fileEntries}
      onRemove={handleRemove}
      onAdd={multiple ? () => inputRef.current?.click() : undefined}
    />
  )

  if (dragNdrop) {
    return (
      <>
        <Box
          onClick={() => !disabled && !hasFiles && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: hasFiles && showPreview ? "flex-start" : "center",
            justifyContent: "center",
            gap: 0.75,
            width: "100%",
            py: hasFiles && showPreview ? 1.5 : 3,
            px: 2,
            border: "1.5px dashed",
            borderColor: hasFiles
              ? "success.main"
              : isDragging
              ? "primary.main"
              : error
              ? "error.main"
              : "divider",
            borderRadius: 2,
            bgcolor: isDragging ? "action.hover" : "background.default",
            cursor: disabled ? "not-allowed" : hasFiles ? "default" : "pointer",
            transition: "border-color 0.15s, background-color 0.15s",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {!hasFiles ? (
            <>
              <CloudUploadIcon color={isDragging ? "primary" : "action"} />
              <Typography variant="body2" fontWeight={500}>
                Drag & drop files here
              </Typography>
              <Typography variant="caption" color="text.secondary">
                or{" "}
                <Box
                  component="span"
                  color="primary.main"
                  sx={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                >
                  browse files
                </Box>
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {label}
                {required && <Typography component="span" color="error" ml={0.5}>*</Typography>}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary">
                <CheckCircleOutlineIcon sx={{ fontSize: 13, mr: 0.5, verticalAlign: "middle", color: "success.main" }} />
                {fileCountLabel} · drop more or{" "}
                <Box
                  component="span"
                  color="primary.main"
                  sx={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                >
                  browse
                </Box>
              </Typography>
              {preview}
            </>
          )}
          {hiddenInput}
        </Box>

        {helperText && (
          <Typography variant="body2" sx={{ mt: 0.5 }} color={error ? "error" : "text.secondary"}>
            {helperText}
          </Typography>
        )}
      </>
    )
  }

  // Button mode
  return (
    <>
      <Button
        component="label"
        variant="outlined"
        color={error ? "error" : "primary"}
        fullWidth
        size="large"
        startIcon={<CloudUploadIcon />}
        sx={{ justifyContent: "flex-start", height: size === "small" ? 40 : 57 }}
        disabled={disabled}
      >
        {!hasFiles ? (
          <span>
            {label}
            {required && <Typography component="span" color="error" ml={0.5}>*</Typography>}
          </span>
        ) : fileCountLabel}
        {hiddenInput}
      </Button>

      {showPreview && preview}

      {helperText && (
        <Typography variant="body2" sx={{ mt: 0.5 }} color={error ? "error" : "text.secondary"}>
          {helperText}
        </Typography>
      )}
    </>
  )
}