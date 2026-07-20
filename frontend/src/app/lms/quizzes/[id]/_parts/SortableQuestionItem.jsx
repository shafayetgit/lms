"use client";
import React from "react";
import {
  Box,
  Stack,
  Typography,
  Paper,
  IconButton,
  Chip,
  Collapse,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  DragIndicator,
} from "@mui/icons-material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import CButton from "@/components/ui/CButton";
import CCheckbox from "@/components/form/CCheckbox";
import { QUESTION_TYPE_LABELS, QUESTION_TYPE_COLORS } from "@/choices/question";
import UpdateQuestionDialog from "./UpdateQuestionDialog";
import PermissionGuard from "@/components/ui/PermissionGuard";

export default function SortableQuestionItem({ q, index, quizId, expandedId, onToggleExpand, onDelete, checked, onToggle }) {
  const theme = useTheme();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: q.id });

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
            : expandedId === q.id
              ? alpha(theme.palette.primary.main, 0.3)
              : "divider",
          borderRadius: 1,
          overflow: "hidden",
          transition: "border-color 0.2s",
        }}
      >
        {/* Question Header */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            px: 2,
            py: 1.5,
            cursor: "pointer",
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
            onClick={(e) => e.stopPropagation()}
          >
            <DragIndicator sx={{ color: "text.disabled", fontSize: 20 }} />
          </IconButton>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ flex: 1, cursor: "pointer" }}
            onClick={() => onToggleExpand(q.id)}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: "text.disabled", minWidth: 28 }}
            >
              {index + 1}.
            </Typography>

            <Typography variant="body1" fontWeight={600} sx={{ flex: 1 }} noWrap>
              {q.text}
            </Typography>

            <Chip
              label={QUESTION_TYPE_LABELS[q.question_type] || q.question_type}
              color={QUESTION_TYPE_COLORS[q.question_type] || "default"}
              size="small"
              variant="outlined"
            />

            <Chip
              label={`${q.marks} pt${q.marks !== 1 ? "s" : ""}`}
              size="small"
              variant="filled"
              sx={{ fontWeight: 700 }}
            />

            {q.choices?.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {q.choices.length} choices
              </Typography>
            )}

            <IconButton size="small">
              {expandedId === q.id ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Stack>
        </Stack>

        {/* Expanded Content */}
        <Collapse in={expandedId === q.id}>
          <Divider />
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              {q.explanation && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Explanation:</strong> {q.explanation}
                </Typography>
              )}

              {q.choices?.length > 0 && (
                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Choices
                  </Typography>
                  {q.choices.map((choice, ci) => (
                    <Stack
                      key={choice.id}
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: choice.is_correct
                          ? alpha(theme.palette.success.main, 0.4)
                          : "divider",
                        bgcolor: choice.is_correct
                          ? alpha(theme.palette.success.main, 0.05)
                          : "transparent",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="text.secondary"
                        sx={{ minWidth: 24 }}
                      >
                        {String.fromCharCode(65 + ci)}.
                      </Typography>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {choice.text}
                      </Typography>
                      {choice.is_correct && (
                        <Chip
                          label="Correct"
                          color="success"
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      )}
                    </Stack>
                  ))}
                </Stack>
              )}

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <UpdateQuestionDialog quizId={quizId} question={q} />
                <PermissionGuard resource="question" action="delete" silent>
                  <CButton
                    label="Delete"
                    action="delete"
                    color="error"
                    variant="outlined"
                    size="small"
                    yesNo
                    yesNoText="Are you sure you want to delete this question?"
                    onClick={() => onDelete(q.id)}
                  />
                </PermissionGuard>
              </Stack>
            </Stack>
          </Box>
        </Collapse>
      </Paper>
    </div>
  );
}
