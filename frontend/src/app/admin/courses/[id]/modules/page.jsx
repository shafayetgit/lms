"use client";
import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { useReadModulesByCourseQuery } from "@/features/module/moduleAPI";
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
import { useReorderModulesMutation } from "@/features/module/moduleAPI";
import SortableModuleItem from "./_parts/SortableModuleItem";

function ModuleList({ courseId }) {
  const { data: { items = [] } = {}, isLoading, isError } = useReadModulesByCourseQuery({ courseId });
  const [reorderModules] = useReorderModulesMutation();
  const theme = useTheme();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sortedModules = React.useMemo(
    () => [...items].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [items]
  );

  const moduleIds = React.useMemo(
    () => sortedModules.map((m) => m.id),
    [sortedModules]
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedModules.findIndex((m) => m.id === active.id);
    const newIndex = sortedModules.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(sortedModules, oldIndex, newIndex);

    const orderPayload = reordered.map((m, i) => ({
      id: m.id,
      order_index: i,
    }));

    try {
      await reorderModules({ courseId, body: orderPayload }).unwrap();
      toast.success("Order updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reorder modules");
    }
  };

  if (isLoading) return <CPageLoader fullPage={false} />;
  if (isError) return <CError fullPage={false} />;

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          No modules yet.
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Click "Add Module" to get started.
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
      <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {sortedModules.map((module, index) => (
            <SortableModuleItem
              key={module.id}
              module={module}
              index={index}
              courseId={courseId}
              theme={theme}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}

export default function Page() {
  const { id } = useParams();

  const breadcrumbs = [
    { label: "Dashboard", path: "/" },
    { label: "Courses", path: "/admin/courses" },
    { label: "Course Details", path: `/admin/courses/${id}` },
    { label: "Modules", path: `/admin/courses/${id}/modules` },
  ];

  return (
    <ModuleContainer breadcrumbs={breadcrumbs} action={<CreateDialog />}>
      <Suspense fallback={<CPageLoader fullPage={false} />}>
        <ModuleList courseId={id} />
      </Suspense>
    </ModuleContainer>
  );
}
