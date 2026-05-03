import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CropIcon from "@mui/icons-material/Crop";
import {
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
} from "@mui/material";
import Cropper from "react-easy-crop";

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
});

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

// SVG is not compressible via canvas — skip it
const COMPRESSIBLE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const DEFAULT_ASPECT_RATIOS = [
  { label: "Free", value: undefined },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

async function getCroppedBlob(imageSrc, pixelCrop, outputType = "image/jpeg") {
  const image = await createImageBitmap(await (await fetch(imageSrc)).blob());
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), outputType, 0.92),
  );
}

/**
 * Compress a single File using compressorjs.
 * Returns a new File (or the original if compression is skipped/fails).
 */
async function compressFile(file, options = {}) {
  if (!COMPRESSIBLE_TYPES.includes(file.type)) return file;

  const Compressor = (await import("compressorjs")).default;

  return new Promise((resolve) => {
    new Compressor(file, {
      quality: 0.6,  // default: ~67.99% compression ratio (recommended)
      ...options,    // caller overrides go here
      success(result) {
        // compressorjs may return a Blob; wrap it in a File to preserve name
        const compressed =
          result instanceof File
            ? result
            : new File([result], file.name, { type: result.type || file.type });
        resolve(compressed);
      },
      error() {
        // fallback to original on any error
        resolve(file);
      },
    });
  });
}

// ─── CropDialog ───────────────────────────────────────────────────────────────

function CropDialog({
  open,
  imageSrc,
  imageType,
  onClose,
  onApply,
  aspectRatios = DEFAULT_ASPECT_RATIOS,
}) {
  const [crop, setCrop]               = useState({ x: 0, y: 0 });
  const [zoom, setZoom]               = useState(1);
  const [aspectIndex, setAspectIndex] = useState(0);
  const [croppedArea, setCroppedArea] = useState(null);

  const aspect = aspectRatios[aspectIndex]?.value;

  React.useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setAspectIndex(0);
      setCroppedArea(null);
    }
  }, [open, imageSrc]);

  const handleApply = async () => {
    if (!croppedArea) return;
    const blob = await getCroppedBlob(imageSrc, croppedArea, imageType);
    onApply(blob);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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

      <Box
        sx={{
          px: 2, pt: 1.5, pb: 0.5,
          display: "flex", alignItems: "center", gap: 2,
          borderTop: "0.5px solid", borderColor: "divider",
        }}
      >
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
          value={aspectIndex}
          exclusive
          size="small"
          onChange={(_, v) => { if (v !== null) setAspectIndex(v); }}
          sx={{ ml: "auto" }}
        >
          {aspectRatios.map((r, i) => (
            <ToggleButton key={r.label} value={i} sx={{ fontSize: 11, px: 1, py: 0.25 }}>
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
  );
}

// ─── FilePreviewGrid ──────────────────────────────────────────────────────────

function FilePreviewGrid({ files, onRemove, onAdd, onReCrop }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, width: "100%", mt: 1 }}>
      {files.map((f, i) => (
        <Box
          key={i}
          sx={{
            position: "relative",
            width: 72, height: 72,
            borderRadius: 2, overflow: "hidden",
            border: "0.5px solid", borderColor: "divider",
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
                width: "100%", height: "100%",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 0.5, bgcolor: "background.default", px: 0.5,
              }}
            >
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: "hidden", textOverflow: "ellipsis",
                  whiteSpace: "nowrap", width: "100%",
                  textAlign: "center", fontSize: 10, px: 0.5,
                }}
              >
                {f.name}
              </Typography>
            </Box>
          )}

          {IMAGE_TYPES.includes(f.type) && onReCrop && (
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onReCrop(i); }}
              sx={{
                position: "absolute", bottom: 2, left: 2,
                width: 18, height: 18,
                bgcolor: "rgba(0,0,0,0.55)", color: "white",
                "&:hover": { bgcolor: "rgba(0,0,0,0.75)" }, p: 0,
              }}
            >
              <CropIcon sx={{ fontSize: 11 }} />
            </IconButton>
          )}

          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onRemove(i); }}
            sx={{
              position: "absolute", top: 2, right: 2,
              width: 18, height: 18,
              bgcolor: "rgba(0,0,0,0.55)", color: "white",
              "&:hover": { bgcolor: "rgba(0,0,0,0.75)" }, p: 0,
            }}
          >
            <CloseIcon sx={{ fontSize: 11 }} />
          </IconButton>
        </Box>
      ))}

      {onAdd && (
        <Box
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          sx={{
            width: 72, height: 72, borderRadius: 2,
            border: "1.5px dashed", borderColor: "divider",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "text.disabled",
            "&:hover": { borderColor: "primary.main", color: "primary.main" },
          }}
        >
          <AddIcon sx={{ fontSize: 20 }} />
        </Box>
      )}
    </Box>
  );
}

// ─── CFileField ───────────────────────────────────────────────────────────────

export default function CFileField({
  label,
  name,
  onChange = () => {},
  multiple = false,
  disabled = false,
  error = false,
  size = "small",
  required = false,
  helperText,
  dragNdrop = false,
  showPreview = true,
  cropOnSingle = true,
  aspectRatios,
  compress = true,          // NEW: enable/disable compressorjs
  compressOptions = {},     // NEW: compressorjs option overrides (quality, maxWidth, etc.)
  ...other
}) {
  const [fileEntries, setFileEntries]   = useState([]);
  const [isDragging, setIsDragging]     = useState(false);
  const [cropState, setCropState]       = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const inputRef = useRef(null);

  /**
   * Compress a file if compress=true and the file type is supported.
   * Returns the (possibly compressed) File.
   */
  const maybeCompress = useCallback(
    async (file) => {
      if (!compress || !COMPRESSIBLE_TYPES.includes(file.type)) return file;
      return compressFile(file, compressOptions);
    },
    [compress, compressOptions],
  );

  const buildEntries = useCallback(
    async (fileList) => {
      const files = Array.from(fileList);
      const entries = await Promise.all(
        files.map(async (file) => {
          const processed = await maybeCompress(file);
          return {
            file: processed,
            name: processed.name,
            type: processed.type,
            preview: IMAGE_TYPES.includes(processed.type)
              ? URL.createObjectURL(processed)
              : null,
          };
        }),
      );
      return entries;
    },
    [maybeCompress],
  );

  const commitEntries = useCallback(
    (entries) => {
      setFileEntries(entries);
      const dt = new DataTransfer();
      entries.forEach((e) => dt.items.add(e.file));
      if (inputRef.current) inputRef.current.files = dt.files;
      onChange({ target: { files: dt.files, name } });
    },
    [name, onChange],
  );

  const handleIncomingFiles = useCallback(
    async (fileList) => {
      setIsCompressing(true);
      try {
        const incoming = await buildEntries(fileList);
        const merged = multiple ? [...fileEntries, ...incoming] : incoming;
        commitEntries(merged);

        if (cropOnSingle && !multiple && incoming.length === 1 && IMAGE_TYPES.includes(incoming[0].type)) {
          setCropState({ index: 0, src: incoming[0].preview, type: incoming[0].type });
        }
      } finally {
        setIsCompressing(false);
      }
    },
    [buildEntries, multiple, fileEntries, commitEntries, cropOnSingle],
  );

  const handleFileChange = (e) => handleIncomingFiles(e.target.files);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      handleIncomingFiles(e.dataTransfer.files);
    },
    [disabled, handleIncomingFiles],
  );

  const handleRemove = useCallback(
    (index) => {
      const next = fileEntries.filter((_, i) => i !== index);
      if (fileEntries[index].preview) URL.revokeObjectURL(fileEntries[index].preview);
      commitEntries(next);
    },
    [fileEntries, commitEntries],
  );

  const handleReCrop = useCallback(
    (index) => {
      const entry = fileEntries[index];
      setCropState({ index, src: entry.preview, type: entry.type });
    },
    [fileEntries],
  );

  const handleCropApply = useCallback(
    async (blob) => {
      const { index, type } = cropState;
      const oldEntry = fileEntries[index];
      const ext = type.split("/")[1] || "jpg";

      // Close dialog immediately so the loading state is visible beneath
      setCropState(null);
      setIsCompressing(true);

      try {
        const croppedFile = new File(
          [blob],
          oldEntry.name.replace(/\.[^.]+$/, `.${ext}`),
          { type },
        );

        // Run compression on the cropped result if enabled
        const processedFile = await maybeCompress(croppedFile);

        const newPreview = URL.createObjectURL(processedFile);
        if (oldEntry.preview) URL.revokeObjectURL(oldEntry.preview);

        const next = fileEntries.map((e, i) =>
          i === index
            ? { file: processedFile, name: processedFile.name, type, preview: newPreview }
            : e,
        );
        commitEntries(next);
      } finally {
        setIsCompressing(false);
      }
    },
    [cropState, fileEntries, commitEntries, maybeCompress],
  );

  const handleDragOver  = (e) => { e.preventDefault(); if (!disabled) setIsDragging(true); };
  const handleDragLeave = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); };

  const hasFiles       = fileEntries.length > 0;
  const fileCountLabel = `${fileEntries.length} file${fileEntries.length > 1 ? "s" : ""} selected`;
  const reCropHandler  = cropOnSingle && !multiple ? handleReCrop : undefined;
  const isDisabled     = disabled || isCompressing;

  const hiddenInput = (
    <VisuallyHiddenInput
      ref={inputRef}
      type="file"
      multiple={multiple}
      onChange={handleFileChange}
      disabled={isDisabled}
      name={name}
      {...other}
    />
  );

  const preview = showPreview && hasFiles && (
    <FilePreviewGrid
      files={fileEntries}
      onRemove={handleRemove}
      onAdd={multiple ? () => inputRef.current?.click() : undefined}
      onReCrop={reCropHandler}
    />
  );

  return (
    <>
      {dragNdrop ? (
        <Box
          onClick={() => !isDisabled && !hasFiles && inputRef.current?.click()}
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
            cursor: isDisabled ? "not-allowed" : hasFiles ? "default" : "pointer",
            transition: "border-color 0.15s, background-color 0.15s",
            opacity: isDisabled ? 0.5 : 1,
          }}
        >
          {isCompressing ? (
            <>
              <CircularProgress size={22} thickness={4} />
              <Typography variant="body2" fontWeight={500} color="text.secondary">
                Compressing…
              </Typography>
            </>
          ) : !hasFiles ? (
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
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                >
                  browse files
                </Box>
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {label}
                {required && (
                  <Typography component="span" color="error" ml={0.5}>*</Typography>
                )}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary">
                <CheckCircleOutlineIcon
                  sx={{ fontSize: 13, mr: 0.5, verticalAlign: "middle", color: "success.main" }}
                />
                {fileCountLabel} · drop more or{" "}
                <Box
                  component="span"
                  color="primary.main"
                  sx={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                >
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
            fullWidth
            size="large"
            startIcon={isCompressing ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
            sx={{ justifyContent: "flex-start", height: size === "small" ? 40 : 57 }}
            disabled={isDisabled}
          >
            {isCompressing ? (
              "Compressing…"
            ) : !hasFiles ? (
              <span>
                {label}
                {required && (
                  <Typography component="span" color="error" ml={0.5}>*</Typography>
                )}
              </span>
            ) : (
              fileCountLabel
            )}
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

      {cropState && (
        <CropDialog
          open
          imageSrc={cropState.src}
          imageType={cropState.type}
          onClose={() => setCropState(null)}
          onApply={handleCropApply}
          aspectRatios={aspectRatios}
        />
      )}
    </>
  );
}


// Here are all the usage patterns:

// ```jsx
// import CFileField, { DEFAULT_ASPECT_RATIOS } from "@/components/ui/CFileField"
// ```

// ---

// **Minimal — just a button:**
// ```jsx
// <CFileField
//   label="Upload file"
//   name="file"
// />
// ```

// **With React Hook Form:**
// ```jsx
// const { setValue, formState: { errors } } = useForm()

// <CFileField
//   label="Profile photo"
//   name="photo"
//   onChange={e => setValue("photo", e.target.files[0])}
//   error={!!errors.photo}
//   helperText={errors.photo?.message}
// />
// ```

// ---

// **Drag & drop — single image with auto crop:**
// ```jsx
// <CFileField
//   label="Profile photo"
//   name="photo"
//   onChange={e => setValue("photo", e.target.files[0])}
//   dragNdrop
// />
// ```

// **Drag & drop — disable crop:**
// ```jsx
// <CFileField
//   label="Document"
//   name="doc"
//   onChange={e => setValue("doc", e.target.files[0])}
//   dragNdrop
//   cropOnSingle={false}
// />
// ```

// **Drag & drop — multiple files:**
// ```jsx
// <CFileField
//   label="Gallery"
//   name="images"
//   onChange={e => setValue("images", Array.from(e.target.files))}
//   dragNdrop
//   multiple
// />
// ```

// ---

// **Custom aspect ratios only:**
// ```jsx
// <CFileField
//   label="Story image"
//   name="story"
//   onChange={e => setValue("story", e.target.files[0])}
//   dragNdrop
//   aspectRatios={[
//     { label: "9:16", value: 9 / 16 },
//     { label: "1:1",  value: 1 },
//   ]}
// />
// ```

// **Extend defaults with extra ratios:**
// ```jsx
// <CFileField
//   label="Banner"
//   name="banner"
//   onChange={e => setValue("banner", e.target.files[0])}
//   dragNdrop
//   aspectRatios={[
//     ...DEFAULT_ASPECT_RATIOS,
//     { label: "9:16", value: 9 / 16 },
//     { label: "2:1",  value: 2 },
//   ]}
// />
// ```

// ---

// **Button mode — no drag, with preview:**
// ```jsx
// <CFileField
//   label="Attachment"
//   name="attachment"
//   onChange={e => setValue("attachment", e.target.files[0])}
//   showPreview
//   cropOnSingle={false}
// />
// ```

// **Restrict file types:**
// ```jsx
// <CFileField
//   label="Profile photo"
//   name="photo"
//   onChange={e => setValue("photo", e.target.files[0])}
//   dragNdrop
//   accept="image/jpeg,image/png,image/webp"
// />
// ```

// **All options together:**
// ```jsx
// <CFileField
//   label="Cover image"
//   name="cover"
//   onChange={e => setValue("cover", e.target.files[0])}
//   dragNdrop
//   showPreview
//   cropOnSingle
//   required
//   disabled={isSubmitting}
//   error={!!errors.cover}
//   helperText={errors.cover?.message}
//   accept="image/*"
//   aspectRatios={[
//     { label: "Free", value: undefined },
//     { label: "16:9", value: 16 / 9 },
//     { label: "1:1",  value: 1 },
//   ]}
// />
// ```

// ---

// **With `Controller` (React Hook Form):**
// ```jsx
// <Controller
//   name="avatar"
//   control={control}
//   rules={{ required: "Photo is required" }}
//   render={({ field, fieldState }) => (
//     <CFileField
//       label="Avatar"
//       name="avatar"
//       onChange={e => field.onChange(e.target.files[0])}
//       error={!!fieldState.error}
//       helperText={fieldState.error?.message}
//       dragNdrop
//       required
//     />
//   )}
// />
// ```


// Default (compress on, quality 0.6 ~68% reduction):
// <CFileField label="Photo" name="photo" onChange={...} dragNdrop />

// Compress off:
// <CFileField label="Doc" name="doc" onChange={...} compress={false} />

// Custom quality:
// <CFileField label="Photo" name="photo" onChange={...} compressOptions={{ quality: 0.8 }} />

// Custom quality + resize cap:
// <CFileField
//   label="Photo"
//   name="photo"
//   onChange={...}
//   compressOptions={{ quality: 0.6, maxWidth: 1920, maxHeight: 1080 }}
// />

