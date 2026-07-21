"use client"
import React, { useState, useEffect, useRef } from "react"
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  alpha,
  useTheme,
  Tooltip,
  CircularProgress,
} from "@mui/material"
import {
  ExpandMore,
  ExpandLess,
  DragIndicator,
  VideoLibrary,
  Article,
  Quiz,
  Assignment,
  EditOutlined,
  SchoolOutlined,
  MoreVert,
  AutoStoriesOutlined,
} from "@mui/icons-material"
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Link from "next/link"
import { toast } from "react-toastify"

import {
  useReadLessonsByChapterQuery,
  useReorderLessonsMutation,
} from "@/features/lesson/lessonAPI"
import InlineLessonCreate from "./InlineLessonCreate"
import EditChapterDialog from "./EditChapterDialog"
import EditLessonDialog from "./EditLessonDialog"
import CDelete from "@/components/actions/CDelete"
import PermissionGuard from "@/components/ui/PermissionGuard"

const LESSON_TYPE_CONFIG = {
  video: { icon: VideoLibrary, color: "#6366f1", label: "Video", initial: "V" },
  content: { icon: Article, color: "#0ea5e9", label: "Content", initial: "C" },
  quiz: { icon: Quiz, color: "#f59e0b", label: "Quiz", initial: "Q" },
  assignment: { icon: Assignment, color: "#10b981", label: "Assignment", initial: "A" },
}

// Sortable lesson row with tree connector lines
function LessonTreeItem({ lesson, index, isLast, courseId, chapterId, chapterIndex }) {
  const theme = useTheme()
  const [editOpen, setEditOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  }
  const cfg = LESSON_TYPE_CONFIG[lesson.lesson_type] || LESSON_TYPE_CONFIG.content

  return (
    <>
      <Box ref={setNodeRef} style={style} sx={{ display: "flex", pl: "36px" }}>
        {/* Tree connector */}
        <Box
          sx={{
            width: 28,
            flexShrink: 0,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              left: 10,
              top: 0,
              bottom: isLast ? "50%" : 0,
              borderLeft: `1.5px solid ${alpha(theme.palette.divider, 0.8)}`,
            },
            "&::after": {
              content: '""',
              position: "absolute",
              left: 10,
              top: "50%",
              width: 14,
              borderBottom: `1.5px solid ${alpha(theme.palette.divider, 0.8)}`,
            },
          }}
        />

        {/* Lesson row content */}
        <Box
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.25,
            pr: 1,
            py: 0.6,
            mb: 0.25,
            mr: 1,
            borderRadius: 1,
            bgcolor: hovered ? alpha(theme.palette.text.primary, 0.04) : "transparent",
            transition: "background 0.15s",
          }}
        >
          {/* Drag handle */}
          <Tooltip title="Drag to reorder" placement="left">
            <IconButton
              size="small"
              {...attributes}
              {...listeners}
              sx={{
                cursor: isDragging ? "grabbing" : "grab",
                touchAction: "none",
                p: 0.25,
                color: "text.disabled",
                "&:hover": { color: "text.secondary" },
              }}
            >
              <DragIndicator sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>

          {/* Lesson serial number */}
          <Typography
            sx={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "text.secondary",
              minWidth: 24,
              textAlign: "left",
              flexShrink: 0,
            }}
          >
            {`${chapterIndex + 1}.${index + 1}`}
          </Typography>

          {/* Title + type inline */}
          <Box sx={{ minWidth: 0, display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.82rem",
                color: "text.primary",
                lineHeight: 1.3,
              }}
            >
              {lesson.title}
            </Typography>
            <Typography
              sx={{ fontSize: "0.72rem", color: cfg.color, fontWeight: 500, flexShrink: 0 }}
            >
              {cfg.label}
            </Typography>
          </Box>

          {/* Actions — visible on hover */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.25,
              ml: 1.5,
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.15s",
            }}
          >
            <PermissionGuard resource="lesson" action="update" silent>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={e => {
                    e.preventDefault()
                    setEditOpen(true)
                  }}
                  sx={{ p: 0.4, color: "text.secondary", "&:hover": { color: "primary.main" } }}
                >
                  <EditOutlined sx={{ fontSize: 13 }} />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
            <PermissionGuard resource="lesson" action="delete" silent>
              <CDelete
                values={{
                  model: "Lesson",
                  filters: [{ field: "public_id", operator: "in", value: [lesson.public_id] }],
                }}
                invalidateTag="LESSONS"
                label="Delete Lesson"
              />
            </PermissionGuard>
          </Box>
        </Box>
      </Box>

      <EditLessonDialog
        lesson={lesson}
        courseId={courseId || lesson.course_id}
        chapterId={chapterId || lesson.chapter_id}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  )
}

function LessonsEmptyState() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: "64px", py: 1.5, opacity: 0.4 }}>
      <AutoStoriesOutlined sx={{ fontSize: 16, color: "text.disabled" }} />
      <Typography variant="caption" color="text.disabled">
        No lessons yet
      </Typography>
    </Box>
  )
}

// Lesson list with its own DnD context
function LessonDndList({ lessons, chapterId, courseId, chapterIndex }) {
  const [reorderLessons] = useReorderLessonsMutation()
  const [orderedLessons, setOrderedLessons] = useState(lessons)
  useEffect(() => {
    setOrderedLessons(lessons)
  }, [lessons])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const lessonIds = orderedLessons.map(l => l.id)

  const handleDragEnd = async event => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = orderedLessons.findIndex(l => l.id === active.id)
    const newIndex = orderedLessons.findIndex(l => l.id === over.id)
    const reordered = arrayMove(orderedLessons, oldIndex, newIndex)
    setOrderedLessons(reordered)
    try {
      await reorderLessons({
        chapterId,
        body: reordered.map((l, i) => ({ id: l.id, order_index: i })),
      }).unwrap()
    } catch (err) {
      setOrderedLessons(lessons)
      toast.error(err?.data?.message || "Failed to reorder lessons")
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={lessonIds} strategy={verticalListSortingStrategy}>
        {orderedLessons.map((lesson, i) => (
          <LessonTreeItem
            key={lesson.id}
            lesson={lesson}
            index={i}
            isLast={i === orderedLessons.length - 1}
            courseId={courseId}
            chapterId={chapterId}
            chapterIndex={chapterIndex}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}

export default function ChapterTreeItem({
  chapter,
  index,
  courseId,
  isDragging,
  attributes,
  listeners,
  setNodeRef,
  style,
  expandAllToggle,
  collapseAllToggle,
}) {
  const theme = useTheme()
  const [expanded, setExpanded] = useState(false)
  const hasSetInitialExpand = useRef(false)
  const [chapterEditOpen, setChapterEditOpen] = useState(false)
  const [headerHovered, setHeaderHovered] = useState(false)

  const { data: { data: lessons = [] } = {}, isLoading } = useReadLessonsByChapterQuery({
    chapterId: chapter.public_id,
  })
  const sortedLessons = [...lessons].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))

  useEffect(() => {
    if (!isLoading && !hasSetInitialExpand.current) {
      if (lessons.length > 0) {
        setTimeout(() => {
          setExpanded(true)
        }, 0)
      }
      hasSetInitialExpand.current = true
    }
  }, [isLoading, lessons])

  useEffect(() => {
    if (expandAllToggle > 0) {
      setTimeout(() => {
        setExpanded(true)
      }, 0)
    }
  }, [expandAllToggle])

  useEffect(() => {
    if (collapseAllToggle > 0) {
      setTimeout(() => {
        setExpanded(false)
      }, 0)
    }
  }, [collapseAllToggle])

  return (
    <div ref={setNodeRef} style={style}>
      <Box sx={{ opacity: isDragging ? 0.55 : 1 }}>
        {/* Chapter header row */}
        <Box
          onMouseEnter={() => setHeaderHovered(true)}
          onMouseLeave={() => setHeaderHovered(false)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 0.75,
            py: 0.75,
            borderRadius: 1,
            bgcolor: headerHovered ? alpha(theme.palette.text.primary, 0.04) : "transparent",
            transition: "background 0.15s",
          }}
        >
          {/* Drag handle — leftmost, always visible */}
          <Tooltip title="Drag to reorder">
            <IconButton
              size="small"
              {...attributes}
              {...listeners}
              sx={{
                cursor: isDragging ? "grabbing" : "grab",
                touchAction: "none",
                p: 0.3,
                color: "text.disabled",
                "&:hover": { color: "text.secondary" },
                flexShrink: 0,
              }}
            >
              <DragIndicator sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>

          {/* Expand/collapse */}
          <IconButton
            size="small"
            onClick={() => setExpanded(p => !p)}
            sx={{ p: 0.3, color: "text.secondary", flexShrink: 0 }}
          >
            {expanded ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
          </IconButton>

          {/* Chapter serial number */}
          <Typography
            sx={{
              fontSize: "0.8rem",
              fontWeight: 800,
              color: "primary.main",
              minWidth: 20,
              textAlign: "left",
              flexShrink: 0,
            }}
          >
            {`${index + 1}.`}
          </Typography>

          {/* Chapter info */}
          <Box
            sx={{ minWidth: 0, display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}
          >
            <Typography
              sx={{ fontWeight: 700, fontSize: "0.875rem", color: "text.primary", lineHeight: 1.3 }}
            >
              {chapter.title}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "text.disabled", fontWeight: 400 }}>
              {isLoading
                ? "…"
                : `${sortedLessons.length} ${sortedLessons.length === 1 ? "lesson" : "lessons"}`}
              {!chapter.is_active && " · Inactive"}
            </Typography>
          </Box>

          {/* Add / Edit / Delete — hover-only */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.25,
              ml: 1.5,
              opacity: headerHovered ? 1 : 0,
              transition: "opacity 0.15s",
            }}
          >
            <PermissionGuard resource="lesson" action="create" silent>
              <InlineLessonCreate
                chapterId={chapter.public_id}
                courseId={courseId}
                triggerType="icon"
              />
            </PermissionGuard>

            <PermissionGuard resource="chapter" action="update" silent>
              <Tooltip title="Edit chapter">
                <IconButton
                  size="small"
                  onClick={() => setChapterEditOpen(true)}
                  sx={{ p: 0.4, color: "text.secondary", "&:hover": { color: "primary.main" } }}
                >
                  <EditOutlined sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </PermissionGuard>

            <PermissionGuard resource="chapter" action="delete" silent>
              <CDelete
                values={{
                  model: "Chapter",
                  filters: [{ field: "public_id", operator: "in", value: [chapter.public_id] }],
                }}
                invalidateTag="CHAPTERS"
                label="Delete Chapter"
              />
            </PermissionGuard>
          </Box>
        </Box>

        {/* Lessons tree */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 0.25, pb: 0.5 }}>
            {isLoading ? (
              <Box sx={{ display: "flex", pl: "64px", py: 1.5 }}>
                <CircularProgress size={16} />
              </Box>
            ) : sortedLessons.length === 0 ? (
              <LessonsEmptyState />
            ) : (
              <LessonDndList
                lessons={sortedLessons}
                chapterId={chapter.public_id}
                courseId={courseId}
                chapterIndex={index}
              />
            )}
          </Box>
        </Collapse>
      </Box>

      <EditChapterDialog
        chapter={chapter}
        open={chapterEditOpen}
        onClose={() => setChapterEditOpen(false)}
      />
    </div>
  )
}

// Wrapper that wires up DnD sortable for chapter-level drag
export function SortableChapterItem({
  chapter,
  index,
  courseId,
  expandAllToggle,
  collapseAllToggle,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
  }

  return (
    <ChapterTreeItem
      chapter={chapter}
      index={index}
      courseId={courseId}
      isDragging={isDragging}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      style={style}
      expandAllToggle={expandAllToggle}
      collapseAllToggle={collapseAllToggle}
    />
  )
}
