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
import CButton from "@/components/ui/CButton";
import CDelete from "@/components/actions/CDelete";

export default function SortableLessonItem({ lesson, index, courseId, moduleId, theme }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

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
          borderRadius: 3,
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

          <Typography variant="body1" fontWeight={600} sx={{ flex: 1 }} noWrap>
            {lesson.title}
          </Typography>

          {lesson.is_preview && (
            <Chip
              label="Preview"
              size="small"
              color="primary"
            />
          )}

          <Chip
            label={lesson.is_active ? "Active" : "Inactive"}
            size="small"
            color={lesson.is_active ? "success" : "default"}
            sx={{ textTransform: "capitalize" }}
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <CDelete
              values={{
                model: "Lesson",
                filters: [{ field: "id", operator: "eq", value: lesson.id }],
              }}
              invalidateTag="LESSONS"
            />
            <CButton
              iconButton
              action="edit"
              component={Link}
              href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
            />
          </Stack>
        </Stack>
      </Paper>
    </div>
  );
}
