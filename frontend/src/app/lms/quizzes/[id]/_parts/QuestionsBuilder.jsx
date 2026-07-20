"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  useDeleteQuestionMutation,
  useReorderQuestionsMutation,
} from "@/features/quiz/quizAPI";
import CreateQuestionDialog from "./CreateQuestionDialog";
import SortableQuestionItem from "./SortableQuestionItem";
import CCheckbox from "@/components/form/CCheckbox";
import CDelete from "@/components/actions/CDelete";

import PermissionGuard from "@/components/ui/PermissionGuard";

export default function QuestionsBuilder({ quizId, questions = [] }) {
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [reorderQuestions] = useReorderQuestionsMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sortedQuestions = useMemo(
    () => [...questions].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [questions]
  );

  const questionIds = useMemo(
    () => sortedQuestions.map((q) => q.id),
    [sortedQuestions]
  );

  const [prevQuestions, setPrevQuestions] = useState(questions);
  if (questions !== prevQuestions) {
    setPrevQuestions(questions);
    const existingIds = sortedQuestions.map((q) => q.id);
    setSelectedIds((prev) => prev.filter((id) => existingIds.includes(id)));
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(sortedQuestions.map((q) => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedQuestions.findIndex((q) => q.id === active.id);
    const newIndex = sortedQuestions.findIndex((q) => q.id === over.id);
    const reordered = arrayMove(sortedQuestions, oldIndex, newIndex);

    const orderPayload = reordered.map((q, i) => ({
      id: q.id,
      order_index: i,
    }));

    try {
      await reorderQuestions({ quizId, body: orderPayload }).unwrap();
      toast.success("Order updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reorder");
    }
  };

  const handleDelete = async (questionId) => {
    try {
      await deleteQuestion({ quizId, questionId }).unwrap();
      toast.success("Question deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete question");
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        {sortedQuestions.length > 0 ? (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 2,
              py: 0.5,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <CCheckbox
              label={selectedIds.length > 0 ? `${selectedIds.length} Selected` : "Select All"}
              checked={sortedQuestions.length > 0 && selectedIds.length === sortedQuestions.length}
              indeterminate={selectedIds.length > 0 && selectedIds.length < sortedQuestions.length}
              onChange={handleSelectAll}
            />
          </Stack>
        ) : (
          <Box />
        )}

        <Stack direction="row" spacing={1.5} alignItems="center">
          {selectedIds.length > 0 ? (
            <PermissionGuard resource="question" action="delete" silent>
              <CDelete
                values={{
                  model: "Question",
                  filters: [
                    {
                      field: "id",
                      operator: "in",
                      value: selectedIds,
                    },
                  ],
                }}
                invalidateTag="QUIZZES"
                label={`Delete (${selectedIds.length})`}
                onSuccess={() => setSelectedIds([])}
              />
            </PermissionGuard>
          ) : (
            <PermissionGuard resource="question" action="create" silent>
              <CreateQuestionDialog quizId={quizId} />
            </PermissionGuard>
          )}
        </Stack>
      </Stack>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
          <Stack spacing={2}>
            {sortedQuestions.map((q, index) => (
              <SortableQuestionItem
                key={q.id}
                q={q}
                index={index}
                quizId={quizId}
                expandedId={expandedId}
                onToggleExpand={toggleExpand}
                onDelete={handleDelete}
                theme={theme}
                checked={selectedIds.includes(q.id)}
                onToggle={() => handleSelectOne(q.id)}
              />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>

      {questions.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            No questions yet.
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Click &quot;Add Question&quot; to get started.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
