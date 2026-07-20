"use client"
import React, { useState } from "react"
import { useParams } from "next/navigation"
import {
  Box,
  Grid,
  Typography,
  LinearProgress,
  Stack,
  alpha,
  useTheme,
} from "@mui/material"
import {
  PeopleOutlined,
  TrendingUpOutlined,
  StarOutlined,
  AutoStoriesOutlined,
  EmojiEventsOutlined,
  HourglassTopOutlined,
  DirectionsRunOutlined,
} from "@mui/icons-material"

import { useReadCourseDashboardQuery, useReadCourseQuery } from "@/features/course/courseAPI"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import PermissionGuard from "@/components/ui/PermissionGuard"
import { COURSE_TIPS } from "@/choices/helpTips/course"
import { InfoOutlined, MenuBookOutlined, Star, AssignmentTurnedInOutlined, DashboardOutlined, VisibilityOutlined } from "@mui/icons-material"
import CSelect from "@/components/form/CSelect"

function KpiCard({ icon, label, value, color }) {
  const theme = useTheme()
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 1,
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        gap: 2,
        height: "100%",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: theme.shadows[4] },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1,
          bgcolor: alpha(color, 0.12),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={800} sx={{ mt: 0.2, lineHeight: 1 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

function DistributionBar({ label, count, total, color, icon }) {
  const theme = useTheme()
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.75 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 120 }}>
        {React.cloneElement(icon, { sx: { fontSize: 16, color } })}
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          flexGrow: 1,
          height: 8,
          borderRadius: 4,
          bgcolor: alpha(color, 0.1),
          "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 },
        }}
      />
      <Typography variant="caption" fontWeight={700} sx={{ minWidth: 56, textAlign: "right", whiteSpace: "nowrap" }}>
        {count} ({pct}%)
      </Typography>
    </Box>
  )
}

export default function Page() {
  const { id } = useParams()
  const theme = useTheme()
  const [lessonSort, setLessonSort] = useState("index") // "index" | "completion"

  const { data: { data } = {}, isLoading, isError } = useReadCourseDashboardQuery(
    { id },
    { skip: !id, refetchOnMountOrArgChange: true }
  )
  const { data: { data: courseData } = {} } = useReadCourseQuery({ id }, { skip: !id })

  const navigators = [
    { label: "Details", href: `/lms/courses/${id}`, icon: <InfoOutlined />, resource: "course", action: "read" },
    { label: "Chapters", href: `/lms/courses/${id}/chapters`, icon: <MenuBookOutlined />, resource: "chapter", action: "read" },
    { label: "Reviews", href: `/lms/courses/${id}/reviews`, icon: <Star />, resource: "review", action: "read" },
    { label: "Enrollments", href: `/lms/courses/${id}/enrollments`, icon: <AssignmentTurnedInOutlined />, resource: "enrollment", action: "read" },
    { label: "Dashboard", href: `/lms/courses/${id}/dashboard`, icon: <DashboardOutlined />, resource: "course", action: "read" },
    { label: "Preview", href: `/courses/${courseData?.slug || ""}`, target: "_blank", icon: <VisibilityOutlined />, resource: "course", action: "read" },
  ]

  if (isLoading) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  const sortedLessons = [...(data?.lesson_stats ?? [])].sort((a, b) =>
    lessonSort === "completion" ? b.completion_rate - a.completion_rate : (a.chapter_idx - b.chapter_idx) || (a.lesson_idx - b.lesson_idx)
  )

  const dist = data?.progress_distribution ?? {}
  const totalEnroll = data?.total_enrollments ?? 0

  return (
    <PermissionGuard resource="course" action="read">
      <CModuleLayout navigators={navigators} helpTips={COURSE_TIPS.dashboard}>
        {/* KPI Row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard icon={<PeopleOutlined />} label="Enrolled Students" value={data?.total_enrollments ?? 0} color={theme.palette.primary.main} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard icon={<TrendingUpOutlined />} label="Avg. Completion" value={`${data?.average_progress ?? 0}%`} color={theme.palette.success.main} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard icon={<StarOutlined />} label="Average Rating" value={data?.rating ?? 0} color="#f59e0b" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard icon={<AutoStoriesOutlined />} label="Total Lessons" value={data?.total_lessons ?? 0} color={theme.palette.secondary.main} />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
          {/* Progress Distribution */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", flexDirection: "column" }}>
            <Box
              sx={{
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                p: 3,
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2}>
                Progress Distribution
              </Typography>
              <Stack spacing={1.5} sx={{ flexGrow: 1, justifyContent: "center" }}>
                <DistributionBar label="Just Started" count={dist.just_started ?? 0} total={totalEnroll} color="#ef4444" icon={<HourglassTopOutlined />} />
                <DistributionBar label="In Progress" count={dist.in_progress ?? 0} total={totalEnroll} color="#f59e0b" icon={<DirectionsRunOutlined />} />
                <DistributionBar label="Advanced" count={dist.advanced ?? 0} total={totalEnroll} color="#3b82f6" icon={<TrendingUpOutlined />} />
                <DistributionBar label="Completed" count={dist.completed ?? 0} total={totalEnroll} color="#10b981" icon={<EmojiEventsOutlined />} />
              </Stack>
            </Box>
          </Grid>

          {/* Lesson Completion */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", flexDirection: "column" }}>
            <Box
              sx={{
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                p: 3,
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                  Lesson Completion
                </Typography>
                <CSelect
                  value={lessonSort}
                  onChange={e => setLessonSort(e.target.value)}
                  options={[
                    { value: "index", label: "By Order" },
                    { value: "completion", label: "By Rate" },
                  ]}
                  sx={{ width: 130 }}
                />
              </Box>

              <Box sx={{ maxHeight: "50vh", overflowY: "auto", flexGrow: 1 }}>
                {sortedLessons.length === 0 ? (
                  <Typography variant="caption" color="text.disabled">No lesson data yet.</Typography>
                ) : (
                  sortedLessons.map((l) => (
                    <Box
                      key={l.lesson_id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        py: 0.9,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, minWidth: 0 }}>
                        <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ flexShrink: 0 }}>
                          {l.chapter_idx}.{l.lesson_idx}
                        </Typography>
                        <Typography variant="caption" noWrap sx={{ color: "text.primary", fontWeight: 500 }}>
                          {l.title}
                        </Typography>
                      </Box>
                      <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ flexShrink: 0, ml: 1 }}>
                        {l.completion_rate}%
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CModuleLayout>
    </PermissionGuard>
  )
}
