"use client";
import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { useReadLessonsByModuleQuery } from "@/features/lesson/lessonAPI";
import CPageLoader from "@/components/ui/CPageLoader";
import CError from "@/components/ui/CError";
import ModuleContainer from "@/components/ui/ModuleContainer";
import CreateDialog from "./_parts/CreateDialog";
import { Stack, Box, Typography } from "@mui/material";

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
import { useTheme } from "@mui/material";
import { toast } from "react-toastify";
import { useReorderLessonsMutation } from "@/features/lesson/lessonAPI";
import SortableLessonItem from "./_parts/SortableLessonItem";

function LessonList({ moduleId, courseId }) {
  const { data: { items = [] } = {}, isLoading, isError } = useReadLessonsByModuleQuery({ moduleId });
  const [reorderLessons] = useReorderLessonsMutation();
  const theme = useTheme();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sortedLessons = React.useMemo(
    () => [...items].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [items]
  );

  const lessonIds = React.useMemo(
    () => sortedLessons.map((l) => l.id),
    [sortedLessons]
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedLessons.findIndex((l) => l.id === active.id);
    const newIndex = sortedLessons.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(sortedLessons, oldIndex, newIndex);

    const orderPayload = reordered.map((l, i) => ({
      id: l.id,
      order_index: i,
    }));

    try {
      await reorderLessons({ moduleId, body: orderPayload }).unwrap();
      toast.success("Order updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reorder lessons");
    }
  };

  if (isLoading) return <CPageLoader fullPage={false} />;
  if (isError) return <CError fullPage={false} />;

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          No lessons yet.
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Click "Add Lesson" to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={lessonIds} strategy={verticalListSortingStrategy}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {sortedLessons.map((lesson, index) => (
            <SortableLessonItem
              key={lesson.id}
              lesson={lesson}
              index={index}
              courseId={courseId}
              moduleId={moduleId}
              theme={theme}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}

export default function Page() {
  const { id, moduleId } = useParams();

  const breadcrumbs = [
    { label: "Dashboard", path: "/" },
    { label: "Courses", path: "/admin/courses" },
    { label: "Course Details", path: `/admin/courses/${id}` },
    { label: "Modules", path: `/admin/courses/${id}/modules` },
    { label: "Module Details", path: `/admin/courses/${id}/modules/${moduleId}` },
    { label: "Lessons", path: `/admin/courses/${id}/modules/${moduleId}/lessons` },
  ];

  return (
    <ModuleContainer breadcrumbs={breadcrumbs} action={<CreateDialog />}>
      <Suspense fallback={<CPageLoader fullPage={false} />}>
        <LessonList moduleId={moduleId} courseId={id} />
      </Suspense>
    </ModuleContainer>
  );
}
