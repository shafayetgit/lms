"use client"
import React from "react"
import { useParams } from "next/navigation"
import { useReadChaptersByCourseQuery, useReorderChaptersMutation } from "@/features/chapter/chapterAPI"
import { useReadCourseQuery } from "@/features/course/courseAPI"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import CreateDialog from "./_parts/CreateDialog"
import { Stack, Box, Typography, useTheme, alpha } from "@mui/material"
import { CHAPTER_TIPS } from "@/choices/helpTips/chapter"
import { School, Star, InfoOutlined, AssignmentTurnedInOutlined, MenuBookOutlined, DashboardOutlined, VisibilityOutlined } from "@mui/icons-material"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { toast } from "react-toastify"
import CButton from "@/components/ui/CButton"
import PermissionGuard from "@/components/ui/PermissionGuard"
import { SortableChapterItem } from "./_parts/ChapterTreeItem"

function ChapterList({ courseId, sortedChapters, expandAllToggle, collapseAllToggle }) {
  const [reorderChapters] = useReorderChaptersMutation()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const chapterIds = React.useMemo(() => sortedChapters.map(c => c.id), [sortedChapters])

  const handleDragEnd = async event => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortedChapters.findIndex(c => c.id === active.id)
    const newIndex = sortedChapters.findIndex(c => c.id === over.id)
    const reordered = arrayMove(sortedChapters, oldIndex, newIndex)

    const orderPayload = reordered.map((c, i) => ({ id: c.id, order_index: i }))

    try {
      await reorderChapters({ courseId, body: orderPayload }).unwrap()
      toast.success("Order updated")
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reorder chapters")
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={chapterIds} strategy={verticalListSortingStrategy}>
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {sortedChapters.map((chapter, index) => (
            <SortableChapterItem
              key={chapter.id}
              chapter={chapter}
              index={index}
              courseId={courseId}
              expandAllToggle={expandAllToggle}
              collapseAllToggle={collapseAllToggle}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  )
}

export default function Page() {
  const { id: courseId } = useParams()
  const {
    data: { data = [] } = {},
    isLoading,
    isError,
  } = useReadChaptersByCourseQuery({ courseId })
  const { data: { data: courseData } = {} } = useReadCourseQuery({ id: courseId }, { skip: !courseId })
  const theme = useTheme()
  const [allExpanded, setAllExpanded] = React.useState(true)
  const [expandAllToggle, setExpandAllToggle] = React.useState(0)
  const [collapseAllToggle, setCollapseAllToggle] = React.useState(0)

  const handleToggleAll = () => {
    if (allExpanded) {
      setCollapseAllToggle(p => p + 1)
    } else {
      setExpandAllToggle(p => p + 1)
    }
    setAllExpanded(p => !p)
  }

  const sortedChapters = React.useMemo(
    () => [...data].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [data]
  )

  const navigators = [
    { label: "Details", href: `/lms/courses/${courseId}`, icon: <InfoOutlined />, resource: "course", action: "read" },
    { label: "Chapters", href: `/lms/courses/${courseId}/chapters`, icon: <MenuBookOutlined />, resource: "chapter", action: "read" },
    { label: "Reviews", href: `/lms/courses/${courseId}/reviews`, icon: <Star />, resource: "review", action: "read" },
    { label: "Enrollments", href: `/lms/courses/${courseId}/enrollments`, icon: <AssignmentTurnedInOutlined />, resource: "enrollment", action: "read" },
    { label: "Dashboard", href: `/lms/courses/${courseId}/dashboard`, icon: <DashboardOutlined />, resource: "course", action: "read" },
    { label: "Preview", href: `/courses/${courseData?.slug || ""}`, target: "_blank", icon: <VisibilityOutlined />, resource: "course", action: "read" },
  ]


  if (isLoading) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  return (
    <PermissionGuard resource="chapter" action="read">
      <CModuleLayout navigators={navigators} helpTips={CHAPTER_TIPS.list}>
        {/* Toolbar */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          {sortedChapters.length > 0 ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CButton
                label={allExpanded ? "Collapse All" : "Expand All"}
                onClick={handleToggleAll}
                variant="outlined"
                size="small"
              />
            </Stack>
          ) : (
            <Box />
          )}

          <Stack direction="row" spacing={1.5} alignItems="center">
            <PermissionGuard resource="chapter" action="create" silent>
              <CreateDialog />
            </PermissionGuard>
          </Stack>
        </Box>

        {sortedChapters.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 4,
              borderRadius: 1,
            }}
          >
            <MenuBookOutlined sx={{ fontSize: 44, color: "text.disabled", mb: 1.5, opacity: 0.5 }} />
            <Typography variant="body1" color="text.secondary" fontWeight={600} mb={0.5}>
              No chapters yet
            </Typography>
            <Typography variant="body2" color="text.disabled" mb={1.5}>
              Chapters group your lessons into structured modules. Add your first chapter to get started.
            </Typography>
          </Box>
        ) : (
          <ChapterList
            courseId={courseId}
            sortedChapters={sortedChapters}
            expandAllToggle={expandAllToggle}
            collapseAllToggle={collapseAllToggle}
          />
        )}
      </CModuleLayout>
    </PermissionGuard>
  )
}
