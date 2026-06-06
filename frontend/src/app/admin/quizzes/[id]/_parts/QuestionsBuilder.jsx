"use client";
import React, { useState, useMemo } from "react";
import {
  Box,
  Stack,
  Typography,
  useTheme,
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

export default function QuestionsBuilder({ quizId, questions = [] }) {
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState(null);
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
        <Typography variant="h6" fontWeight={700}>
          Questions ({questions.length})
        </Typography>
        <CreateQuestionDialog quizId={quizId} />
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
            Click "Add Question" to get started.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
