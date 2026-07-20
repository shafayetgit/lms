"use client";
import React from "react";
import {
  Box,
  Stack,
  Typography,
  Paper,
  IconButton,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import { DragIndicator } from "@mui/icons-material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import CCheckbox from "@/components/form/CCheckbox";

export default function SortableChapterItem({ chapter, index, courseId, theme, checked, onToggle }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: isDragging
            ? alpha(theme.palette.primary.main, 0.5)
            : "divider",
          borderRadius: 1,
          overflow: "hidden",
          transition: "border-color 0.2s",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.02) : "transparent",
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) },
          }}
        >
          <CCheckbox
            label=""
            checked={checked}
            onChange={onToggle}
            sx={{ mr: -1 }}
          />

          <IconButton
            size="small"
            {...attributes}
            {...listeners}
            sx={{
              cursor: isDragging ? "grabbing" : "grab",
              touchAction: "none",
              p: 0.5,
            }}
          >
            <DragIndicator sx={{ color: "text.disabled", fontSize: 20 }} />
          </IconButton>

          <Typography
            variant="body2"
            sx={{ fontWeight: 800, color: "text.disabled", minWidth: 28 }}
          >
            {index + 1}.
          </Typography>

          <Typography
            variant="body1"
            fontWeight={600}
            component={Link}
            href={`/lms/courses/${courseId}/chapters/${chapter.public_id || chapter.id}`}
            sx={{
              flex: 1,
              textDecoration: "none",
              color: "text.primary",
              "&:hover": {
                color: "primary.main",
                textDecoration: "underline",
              },
            }}
            noWrap
          >
            {chapter.title}
          </Typography>

          <Chip
            label={chapter.is_active ? "Active" : "Inactive"}
            size="small"
            color={chapter.is_active ? "success" : "default"}
            sx={{ textTransform: "capitalize" }}
          />
        </Stack>
      </Paper>
    </div>
  );
}
