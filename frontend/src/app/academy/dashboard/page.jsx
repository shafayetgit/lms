"use client"

import React from "react"
import { Box, Typography, Card, Avatar, Stack, Paper, Button, alpha } from "@mui/material"
import Grid from "@mui/material/Grid"
import {
  SchoolOutlined,
  MilitaryTechOutlined,
  ChevronRightOutlined,
  CheckCircleOutlined,
} from "@mui/icons-material"
import { useReadMyEnrollmentsQuery } from "@/features/enrollment/enrollmentAPI"
import { useReadBadgeAssignmentsQuery } from "@/features/badge/badgeApi"
import { useReadStudentDashboardSummaryQuery } from "@/features/student/studentAPI"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import PortalCourseCard from "@/components/course/PortalCourseCard"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"
import Link from "next/link"
import dayjs from "dayjs"

const DASHBOARD_HELP_TIPS = {
  description:
    "Welcome to your Academy Dashboard! Here you can track your active learning progress, streaks, view upcoming sessions, and manage your achievements.",
  tips: [
    {
      label: "Active Streaks 🔥",
      text: "Maintain your streak by completing a lesson, quiz, or assignment submission every day. Consistent learning is the key to mastery!",
    },
    {
      label: "Course Progress 📊",
      text: "Your active enrollments display a progress bar. Dive back into any course right where you left off by clicking 'Resume Course'.",
    },
    {
      label: "Upcoming Events 📅",
      text: "Keep track of scheduled live classes and evaluation sessions. Join live classes directly using the links provided.",
    },
    {
      label: "Certificates 🎓",
      text: "Upon completing 100% of a course, head over to the Certificates tab to claim your official certificate of completion.",
    },
    {
      label: "My Badges 🏆",
      text: "Badges and milestones are displayed under My Badges in the navigation menu. Keep learning to unlock new achievements!",
    },
  ],
}

export default function AcademyDashboard() {
  useSetBreadcrumb("Academy Dashboard")

  const {
    data: enrollmentsData,
    isLoading: enrollmentsLoading,
    isError: enrollmentsError,
  } = useReadMyEnrollmentsQuery({ size: 100 }, { refetchOnMountOrArgChange: true })
  const {
    data: badgesData,
    isLoading: badgesLoading,
    isError: badgesError,
  } = useReadBadgeAssignmentsQuery({ size: 3 })
  const {
    data: summaryRes,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useReadStudentDashboardSummaryQuery()

  const enrollments = enrollmentsData?.data ?? []
  const badges = badgesData?.data ?? []

  const summary = summaryRes?.data ?? {}
  const streak = summary.streak ?? { current_streak: 0, longest_streak: 0, active_dates: [] }
  const upcomingClasses = summary.upcoming_live_classes ?? []
  const upcomingEvaluations = summary.upcoming_evaluations ?? []

  const totalCoursesCount = enrollmentsData?.meta?.total ?? enrollments.length
  const totalBadgesCount = badgesData?.meta?.total ?? badges.length
  const completedCoursesCount = enrollments.filter(e => Math.round(e.progress || 0) === 100).length

  // Find active enrollment: prioritize in-progress (0 < progress < 100), then unstarted (progress == 0)
  const activeEnrollment =
    enrollments.find(e => e.progress > 0 && e.progress < 100) ||
    enrollments.find(e => Math.round(e.progress || 0) === 0)

  const activeDates = React.useMemo(() => {
    return new Set(streak.active_dates ?? [])
  }, [streak.active_dates])

  const last7Days = React.useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = dayjs().subtract(i, "day")
      days.push({
        name: d.format("ddd"),
        dateStr: d.format("YYYY-MM-DD"),
        dayNum: d.format("D"),
        isActive: activeDates.has(d.format("YYYY-MM-DD")),
        isToday: i === 0,
      })
    }
    return days
  }, [activeDates])

  if (enrollmentsLoading || badgesLoading || summaryLoading) return <CPageLoader fullPage={true} />
  if (enrollmentsError || badgesError || summaryError) return <CError fullPage={true} />

  return (
    <CModuleLayout helpTips={DASHBOARD_HELP_TIPS}>
      {/* Welcome & Streaks Hero Section */}
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }} sx={{ mb: 4 }}>
        {/* Welcome and Resume Course Banner */}
        {activeEnrollment && (
          <Grid size={{ xs: 4, sm: 8, md: 7 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: "primary.main",
                    letterSpacing: "0.05em",
                    display: "block",
                    mb: 1,
                  }}
                >
                  {activeEnrollment.progress > 0 ? "Resume Learning" : "Start Learning"}
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={2}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {activeEnrollment.course?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Progress: {Math.round(activeEnrollment.progress || 0)}% completed
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    href={`/academy/courses/${activeEnrollment.course?.slug}`}
                    variant="contained"
                    size="small"
                    sx={{ borderRadius: 1, fontWeight: 600, textTransform: "none", px: 2.5 }}
                  >
                    {activeEnrollment.progress > 0 ? "Resume Course" : "Start Course"}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Weekly Activity & Streak Tracker */}
        {streak && (
          <Grid size={{ xs: 4, sm: 8, md: activeEnrollment ? 5 : 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}
                  >
                    🔥 Activity Streak
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Keep your streak alive!
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 900, color: "warning.main", lineHeight: 1 }}
                  >
                    {streak.current_streak}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Days Streak
                  </Typography>
                </Box>
              </Stack>

              {/* Weekly calendar view */}
              <Box sx={{ my: 3 }}>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  {last7Days.map(day => (
                    <Box
                      key={day.dateStr}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flex: 1,
                        py: 1,
                        borderRadius: 1,
                        bgcolor: day.isToday
                          ? theme => alpha(theme.palette.primary.main, 0.08)
                          : "transparent",
                        border: day.isToday ? "1px solid" : "1px solid transparent",
                        borderColor: day.isToday ? "primary.main" : "transparent",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: day.isToday ? "primary.main" : "text.secondary",
                          fontSize: "0.75rem",
                          mb: 0.5,
                        }}
                      >
                        {day.name}
                      </Typography>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: day.isActive ? "warning.main" : "action.selected",
                          color: day.isActive ? "warning.contrastText" : "text.disabled",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          boxShadow: day.isActive
                            ? theme => `0 2px 8px ${alpha(theme.palette.warning.main, 0.4)}`
                            : "none",
                        }}
                      >
                        {day.isActive ? "🔥" : day.dayNum}
                      </Avatar>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Longest Streak: <strong>{streak.longest_streak} days</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Total active days: <strong>{streak.active_dates?.length || 0}</strong>
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }} sx={{ mb: 5 }}>
        <Grid size={{ xs: 4, sm: 4, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              gap: 2.5,
              boxShadow: "none",
            }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: theme => alpha(theme.palette.primary.main, 0.15),
                borderRadius: 1,
              }}
            >
              <SchoolOutlined sx={{ fontSize: 32, color: "primary.main" }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {totalCoursesCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Enrolled Courses
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 4, sm: 4, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              gap: 2.5,
              boxShadow: "none",
            }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: theme => alpha(theme.palette.success.main, 0.15),
                borderRadius: 1,
              }}
            >
              <CheckCircleOutlined sx={{ fontSize: 32, color: "success.main" }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {completedCoursesCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Completed Courses
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 4, sm: 4, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              gap: 2.5,
              boxShadow: "none",
            }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: theme => alpha(theme.palette.secondary.main, 0.15),
                borderRadius: 1,
              }}
            >
              <MilitaryTechOutlined sx={{ fontSize: 32, color: "secondary.main" }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {totalBadgesCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Badges Earned
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Upcoming Sections (Live Classes & Evaluations) */}
      {(upcomingClasses.length > 0 || upcomingEvaluations.length > 0) && (
        <Grid
          container
          spacing={{ xs: 3, md: 4 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          sx={{ mb: 5 }}
        >
          {upcomingClasses.length > 0 && (
            <Grid size={{ xs: 4, sm: 8, md: upcomingEvaluations.length > 0 ? 6 : 12 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Upcoming Live Classes
              </Typography>
              <Stack spacing={2}>
                {upcomingClasses.map(cls => (
                  <Card
                    key={cls.public_id}
                    sx={{
                      p: 2.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Box>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, color: "text.primary" }}
                        >
                          {cls.title}
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: theme => alpha(theme.palette.success.main, 0.15),
                            color: "success.main",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {cls.status}
                        </Paper>
                      </Stack>
                      {cls.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {cls.description}
                        </Typography>
                      )}
                    </Box>

                    <Stack spacing={1} sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2">
                          📅 {dayjs(cls.date).format("DD MMMM YYYY")}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2">
                          ⏰ {cls.time} ({cls.duration} mins)
                        </Typography>
                      </Box>
                      {cls.host && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2">👤 Hosted by {cls.host.full_name}</Typography>
                        </Box>
                      )}
                    </Stack>

                    <Button
                      variant="contained"
                      href={cls.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      sx={{
                        borderRadius: 1,
                        textTransform: "none",
                        fontWeight: 600,
                        alignSelf: "flex-start",
                      }}
                    >
                      Join Class
                    </Button>
                  </Card>
                ))}
              </Stack>
            </Grid>
          )}

          {upcomingEvaluations.length > 0 && (
            <Grid size={{ xs: 4, sm: 8, md: upcomingClasses.length > 0 ? 6 : 12 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Upcoming Evaluations
              </Typography>
              <Stack spacing={2}>
                {upcomingEvaluations.map(evalSession => (
                  <Card
                    key={evalSession.public_id}
                    sx={{
                      p: 2.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Box>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, color: "text.primary" }}
                        >
                          {evalSession.course?.title ||
                            evalSession.batch?.title ||
                            "Evaluation Session"}
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: theme => alpha(theme.palette.info.main, 0.15),
                            color: "info.main",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {evalSession.status}
                        </Paper>
                      </Stack>
                    </Box>

                    <Stack spacing={1} sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                      {evalSession.date && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2">
                            📅 {dayjs(evalSession.date).format("DD MMMM YYYY")}
                          </Typography>
                        </Box>
                      )}
                      {evalSession.start_time && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2">
                            ⏰ {evalSession.start_time} - {evalSession.end_time}
                          </Typography>
                        </Box>
                      )}
                      {evalSession.evaluator && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2">
                            🎓 Evaluator: {evalSession.evaluator.full_name}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Grid>
          )}
        </Grid>
      )}

      {/* Core Sections */}
      <Grid container spacing={{ xs: 3, md: 4 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        {/* Enrolled Courses Section */}
        <Grid size={{ xs: 4, sm: 8, md: 7 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2.5 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Recent Courses
            </Typography>
            {totalCoursesCount > 3 && (
              <Button
                component={Link}
                href="/academy/courses"
                endIcon={<ChevronRightOutlined />}
                size="small"
                sx={{ fontWeight: 600 }}
              >
                View All
              </Button>
            )}
          </Stack>

          {enrollments.length > 0 ? (
            <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }}>
              {enrollments.slice(0, 4).map(enrollment => (
                <Grid key={enrollment.public_id} size={{ xs: 4, sm: 8, md: 6 }}>
                  <PortalCourseCard
                    course={enrollment.course || {}}
                    enrolled={true}
                    progress={Math.round(enrollment.progress || 0)}
                    certificateId={enrollment.certificate_id}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              sx={{
                p: 5,
                textAlign: "center",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: "none",
              }}
            >
              <SchoolOutlined sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                No active courses
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Browse the course library to start learning.
              </Typography>
              <Button
                component={Link}
                href="/courses"
                variant="contained"
                size="small"
                sx={{ borderRadius: 1 }}
              >
                Explore Courses
              </Button>
            </Paper>
          )}
        </Grid>

        {/* Recently Earned Badges Section */}
        <Grid size={{ xs: 4, sm: 8, md: 5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2.5 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Recently Earned Badges
            </Typography>
            {totalBadgesCount > 3 && (
              <Button
                component={Link}
                href="/academy/badges"
                endIcon={<ChevronRightOutlined />}
                size="small"
                sx={{ fontWeight: 600 }}
              >
                View All
              </Button>
            )}
          </Stack>

          {badges.length > 0 ? (
            <Stack spacing={2}>
              {badges.map(assignment => {
                const badge = assignment.badge || {}
                return (
                  <Card
                    key={assignment.public_id}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Avatar
                      src={badge.image}
                      alt={badge.title || "Badge"}
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: theme => alpha(theme.palette.secondary.main, 0.15),
                      }}
                    >
                      <MilitaryTechOutlined sx={{ color: "secondary.main" }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, noWrap: true }}>
                        {badge.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ noWrap: true }}>
                        Awarded on {dayjs(assignment.created_at).format("MMM DD, YYYY")}
                      </Typography>
                    </Box>
                  </Card>
                )
              })}
            </Stack>
          ) : (
            <Paper
              sx={{
                p: 5,
                textAlign: "center",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: "none",
              }}
            >
              <MilitaryTechOutlined sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                No badges earned yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Earn badges automatically by completing your enrolled courses!
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </CModuleLayout>
  )
}
