"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useReadLessonsByChapterQuery, useReorderLessonsMutation } from "@/features/lesson/lessonAPI";
import CPageLoader from "@/components/ui/CPageLoader";
import CError from "@/components/ui/CError";
import CModuleLayout from "@/components/ui/CModuleLayout";
import CreateDialog from "./_parts/CreateDialog";
import { Stack, Box, Typography, useTheme, alpha } from "@mui/material";
import Link from "next/link";
import { LESSON_TIPS } from "@/choices/helpTips/lesson";
import CButton from "@/components/ui/CButton";
import { InfoOutlined, AutoStoriesOutlined } from "@mui/icons-material";
import CCheckbox from "@/components/form/CCheckbox";
import CDelete from "@/components/actions/CDelete";

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
import { toast } from "react-toastify";
import SortableLessonItem from "./_parts/SortableLessonItem";

function LessonList({ chapterId, courseId, sortedLessons, selectedIds, setSelectedIds }) {
  const [reorderLessons] = useReorderLessonsMutation();
  const theme = useTheme();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
      await reorderLessons({ chapterId, body: orderPayload }).unwrap();
      toast.success("Order updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reorder lessons");
    }
  };

  const handleSelectOne = (publicId) => {
    setSelectedIds(prev =>
      prev.includes(publicId) ? prev.filter(item => item !== publicId) : [...prev, publicId]
    )
  };

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
              chapterId={chapterId}
              theme={theme}
              checked={selectedIds.includes(lesson.public_id)}
              onToggle={() => handleSelectOne(lesson.public_id)}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}

import PermissionGuard from "@/components/ui/PermissionGuard";

export default function Page() {
  const { id: courseId, chapterId } = useParams();
  const { data: { data = [] } = {}, isLoading, isError } = useReadLessonsByChapterQuery({ chapterId });
  const theme = useTheme();
  const [selectedIds, setSelectedIds] = React.useState([]);

  const sortedLessons = React.useMemo(
    () => [...data].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [data]
  );

  React.useEffect(() => {
    const existingIds = sortedLessons.map(l => l.public_id);
    setSelectedIds(prev => prev.filter(id => existingIds.includes(id)));
  }, [sortedLessons]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(sortedLessons.map(l => l.public_id));
    } else {
      setSelectedIds([]);
    }
  };

  const navigators = [
    { label: "Details", href: `/lms/courses/${courseId}/chapters/${chapterId}`, icon: <InfoOutlined />, resource: "chapter", action: "read" },
    { label: "Lessons", href: `/lms/courses/${courseId}/chapters/${chapterId}/lessons`, icon: <AutoStoriesOutlined />, resource: "lesson", action: "read" },
  ];

  if (isLoading) return <CPageLoader fullPage={false} />;
  if (isError) return <CError fullPage={false} />;

  return (
    <PermissionGuard resource="lesson" action="read">
      <CModuleLayout 
        navigators={navigators}
        helpTips={LESSON_TIPS.list}
      >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        {sortedLessons.length > 0 ? (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 2,
              py: 0.5,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <CCheckbox
              label={selectedIds.length > 0 ? `${selectedIds.length} Selected` : "Select All"}
              checked={sortedLessons.length > 0 && selectedIds.length === sortedLessons.length}
              indeterminate={selectedIds.length > 0 && selectedIds.length < sortedLessons.length}
              onChange={handleSelectAll}
            />
          </Stack>
        ) : (
          <Box />
        )}

        <Stack direction="row" spacing={1.5} alignItems="center">
          {selectedIds.length > 0 ? (
            <PermissionGuard resource="lesson" action="delete" silent>
              <CDelete
                values={{
                  model: "Lesson",
                  filters: [
                    {
                      field: "public_id",
                      operator: "in",
                      value: selectedIds,
                    },
                  ],
                }}
                invalidateTag="LESSONS"
                label={`Delete (${selectedIds.length})`}
                onSuccess={() => setSelectedIds([])}
              />
            </PermissionGuard>
          ) : (
            <PermissionGuard resource="lesson" action="create" silent>
              <CreateDialog />
            </PermissionGuard>
          )}
        </Stack>
      </Box>

      {sortedLessons.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8, px: 4, borderRadius: 1 }}>
          <AutoStoriesOutlined sx={{ fontSize: 44, color: "text.disabled", mb: 1.5, opacity: 0.5 }} />
          <Typography variant="body1" color="text.secondary" fontWeight={600} mb={0.5}>
            No lessons yet.
          </Typography>
          <Typography variant="body2" color="text.disabled" mb={1.5}>
            Click &quot;Add Lesson&quot; to get started.
          </Typography>
        </Box>
      ) : (
        <LessonList
          chapterId={chapterId}
          courseId={courseId}
          sortedLessons={sortedLessons}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />
      )}
    </CModuleLayout>
    </PermissionGuard>
  );
}
