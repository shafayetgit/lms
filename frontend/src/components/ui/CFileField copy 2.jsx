import * as React from "react"
import { useState, useRef, useCallback } from "react"
import { styled } from "@mui/material/styles"
import Button from "@mui/material/Button"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined"
import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"
import CropIcon from "@mui/icons-material/Crop"
import {
  Typography, Box, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Slider, ToggleButtonGroup,
  ToggleButton,
} from "@mui/material"
import Cropper from "react-easy-crop"

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

const ASPECT_RATIOS = [
  { label: "Free", value: undefined },
  { label: "1:1",  value: 1 },
  { label: "4:3",  value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
]

// ─── helpers ────────────────────────────────────────────────────────────────

async function getCroppedBlob(imageSrc, pixelCrop, outputType = "image/jpeg") {
  const image = await createImageBitmap(await (await fetch(imageSrc)).blob())
  const canvas = document.createElement("canvas")
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext("2d")
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height
  )
  return new Promise(resolve =>
    canvas.toBlob(blob => resolve(blob), outputType, 0.92)
  )
}

// ─── CropDialog ─────────────────────────────────────────────────────────────

function CropDialog({ open, imageSrc, imageType, onClose, onApply }) {
  const [crop, setCrop]             = useState({ x: 0, y: 0 })
  const [zoom, setZoom]             = useState(1)
  const [aspect, setAspect]         = useState(undefined)
  const [croppedArea, setCroppedArea] = useState(null)

  const handleApply = async () => {
    if (!croppedArea) return
    const blob = await getCroppedBlob(imageSrc, croppedArea, imageType)
    onApply(blob)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="subtitle1" fontWeight={500}>Crop image</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: "#111", position: "relative", height: 320 }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setCroppedArea(pixels)}
          showGrid
        />
      </DialogContent>

      {/* Controls */}
      <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: "flex", alignItems: "center", gap: 2, borderTop: "0.5px solid", borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
          Zoom
        </Typography>
        <Slider
          value={zoom}
          min={1} max={3} step={0.05}
          onChange={(_, v) => setZoom(v)}
          sx={{ flex: 1, maxWidth: 140 }}
          size="small"
        />

        <ToggleButtonGroup
          value={aspect ?? "free"}
          exclusive
          size="small"
          onChange={(_, v) => setAspect(v === "free" ? undefined : v)}
          sx={{ ml: "auto" }}
        >
          {ASPECT_RATIOS.map(r => (
            <ToggleButton key={r.label} value={r.value ?? "free"} sx={{ fontSize: 11, px: 1, py: 0.25 }}>
              {r.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <DialogActions sx={{ px: 2, pb: 1.5 }}>
        <Button size="small" onClick={onClose}>Cancel</Button>
        <Button size="small" variant="contained" onClick={handleApply}>Apply crop</Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── FilePreviewGrid ─────────────────────────────────────────────────────────

function FilePreviewGrid({ files, onRemove, onAdd, onReCrop }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, width: "100%", mt: 1 }}>
      {files.map((f, i) => (
        <Box
          key={i}
          sx={{
            position: "relative", width: 72, height: 72,
            borderRadius: 2, overflow: "hidden",
            border: "0.5px solid", borderColor: "divider", flexShrink: 0,
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
            <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5, bgcolor: "background.default", px: 0.5 }}>
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", textAlign: "center", fontSize: 10, px: 0.5 }}>
                {f.name}
              </Typography>
            </Box>
          )}

          {/* Re-crop button — only for images when crop is enabled */}
          {IMAGE_TYPES.includes(f.type) && onReCrop && (
            <IconButton
              size="small"
              onClick={e => { e.stopPropagation(); onReCrop(i) }}
              sx={{ position: "absolute", bottom: 2, left: 2, width: 18, height: 18, bgcolor: "rgba(0,0,0,0.55)", color: "white", "&:hover": { bgcolor: "rgba(0,0,0,0.75)" }, p: 0 }}
            >
              <CropIcon sx={{ fontSize: 11 }} />
            </IconButton>
          )}

          <IconButton
            size="small"
            onClick={e => { e.stopPropagation(); onRemove(i) }}
            sx={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, bgcolor: "rgba(0,0,0,0.55)", color: "white", "&:hover": { bgcolor: "rgba(0,0,0,0.75)" }, p: 0 }}
          >
            <CloseIcon sx={{ fontSize: 11 }} />
          </IconButton>
        </Box>
      ))}

      {onAdd && (
        <Box
          onClick={e => { e.stopPropagation(); onAdd() }}
          sx={{ width: 72, height: 72, borderRadius: 2, border: "1.5px dashed", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "text.disabled", "&:hover": { borderColor: "primary.main", color: "primary.main" } }}
        >
          <AddIcon sx={{ fontSize: 20 }} />
        </Box>
      )}
    </Box>
  )
}

// ─── CFileField ──────────────────────────────────────────────────────────────

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
  dragNdrop = false,
  showPreview = true,
  cropOnSingle = true, 
  ...other
}) {
  const [fileEntries, setFileEntries]       = useState([])
  const [isDragging, setIsDragging]         = useState(false)
  const [cropState, setCropState]           = useState(null) // { index, src, type }
  const inputRef = useRef(null)

  // Build preview entries from a FileList
  const buildEntries = useCallback(fileList =>
    Array.from(fileList).map(file => ({
      file,
      name: file.name,
      type: file.type,
      preview: IMAGE_TYPES.includes(file.type) ? URL.createObjectURL(file) : null,
    })), [])

  // Sync entries → hidden input, fire onChange
  const commitEntries = useCallback(entries => {
    setFileEntries(entries)
    const dt = new DataTransfer()
    entries.forEach(e => dt.items.add(e.file))
    if (inputRef.current) inputRef.current.files = dt.files
    onChange({ target: { files: dt.files, name } })
  }, [name, onChange])

  // After picking files — optionally trigger crop for single images
  const handleIncomingFiles = useCallback(fileList => {
    const incoming = buildEntries(fileList)
    const merged = multiple ? [...fileEntries, ...incoming] : incoming
    commitEntries(merged)

    // Open crop dialog if: cropOnSingle=true, not multiple, single image file
    if (cropOnSingle && !multiple && incoming.length === 1 && IMAGE_TYPES.includes(incoming[0].type)) {
      setCropState({ index: 0, src: incoming[0].preview, type: incoming[0].type })
    }
  }, [buildEntries, multiple, fileEntries, commitEntries, cropOnSingle])

  const handleFileChange = e => handleIncomingFiles(e.target.files)

  const handleDrop = useCallback(e => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    handleIncomingFiles(e.dataTransfer.files)
  }, [disabled, handleIncomingFiles])

  const handleRemove = useCallback(index => {
    const next = fileEntries.filter((_, i) => i !== index)
    if (fileEntries[index].preview) URL.revokeObjectURL(fileEntries[index].preview)
    commitEntries(next)
  }, [fileEntries, commitEntries])

  // Re-crop: open dialog for existing entry
  const handleReCrop = useCallback(index => {
    const entry = fileEntries[index]
    setCropState({ index, src: entry.preview, type: entry.type })
  }, [fileEntries])

  // Apply cropped blob → replace entry
  const handleCropApply = useCallback(async blob => {
    const { index, type } = cropState
    const oldEntry = fileEntries[index]
    const ext = type.split("/")[1] || "jpg"
    const newFile = new File([blob], oldEntry.name.replace(/\.[^.]+$/, `.${ext}`), { type })
    const newPreview = URL.createObjectURL(blob)
    if (oldEntry.preview) URL.revokeObjectURL(oldEntry.preview)

    const next = fileEntries.map((e, i) =>
      i === index ? { file: newFile, name: newFile.name, type, preview: newPreview } : e
    )
    commitEntries(next)
    setCropState(null)
  }, [cropState, fileEntries, commitEntries])

  const handleDragOver = e => { e.preventDefault(); if (!disabled) setIsDragging(true) }
  const handleDragLeave = e => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false) }

  const hasFiles = fileEntries.length > 0
  const fileCountLabel = `${fileEntries.length} file${fileEntries.length > 1 ? "s" : ""} selected`

  // Only show re-crop button when cropOnSingle is on and not multiple
  const reCropHandler = cropOnSingle && !multiple ? handleReCrop : undefined

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
      onReCrop={reCropHandler}
    />
  )

  return (
    <>
      {dragNdrop ? (
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
            borderColor: hasFiles ? "success.main" : isDragging ? "primary.main" : error ? "error.main" : "divider",
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
              <Typography variant="body2" fontWeight={500}>Drag & drop files here</Typography>
              <Typography variant="caption" color="text.secondary">
                or{" "}
                <Box component="span" color="primary.main" sx={{ textDecoration: "underline", cursor: "pointer" }} onClick={e => { e.stopPropagation(); inputRef.current?.click() }}>
                  browse files
                </Box>
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {label}{required && <Typography component="span" color="error" ml={0.5}>*</Typography>}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary">
                <CheckCircleOutlineIcon sx={{ fontSize: 13, mr: 0.5, verticalAlign: "middle", color: "success.main" }} />
                {fileCountLabel} · drop more or{" "}
                <Box component="span" color="primary.main" sx={{ textDecoration: "underline", cursor: "pointer" }} onClick={e => { e.stopPropagation(); inputRef.current?.click() }}>
                  browse
                </Box>
              </Typography>
              {preview}
            </>
          )}
          {hiddenInput}
        </Box>
      ) : (
        <>
          <Button
            component="label"
            variant="outlined"
            color={error ? "error" : "primary"}
            fullWidth size="large"
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
          {preview}
        </>
      )}

      {helperText && (
        <Typography variant="body2" sx={{ mt: 0.5 }} color={error ? "error" : "text.secondary"}>
          {helperText}
        </Typography>
      )}

      {/* Crop dialog */}
      {cropState && (
        <CropDialog
          open
          imageSrc={cropState.src}
          imageType={cropState.type}
          onClose={() => setCropState(null)}
          onApply={handleCropApply}
        />
      )}
    </>
  )
}