"use client"

import React from "react"
import Grid from "@mui/material/Grid"
import { Box, Typography } from "@mui/material"
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined"
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined"
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined"
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined"
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined"
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined"
import { useReadStatisticsQuery } from "@/features/statistics/statisticsAPI"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"
import { useTheme } from "@mui/material/styles"

import { StatCard } from "./_parts/StatCard"
import { EnrollmentTrendChart } from "./_parts/EnrollmentTrendChart"
import { RevenueTrendChart } from "./_parts/RevenueTrendChart"
import { EnrollmentStatusChart } from "./_parts/EnrollmentStatusChart"
import { CompletionRateChart } from "./_parts/CompletionRateChart"
import { CategoryDistributionChart } from "./_parts/CategoryDistributionChart"
import { TopCoursesList } from "./_parts/TopCoursesList"

// Curated palette for chart status matching
const CHART_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#059669",
  "#D97706",
  "#DC2626",
  "#0891B2",
  "#4F46E5",
  "#BE185D",
]

const STATUS_COLORS = {
  active: "#2563EB",
  completed: "#059669",
  cancelled: "#DC2626",
  pending: "#D97706",
}

export default function LmsDashboardPage() {
  // Set custom breadcrumb label for LMS dashboard
  useSetBreadcrumb("Dashboard")
  const theme = useTheme()
  const { data: { data } = {}, isLoading, isError } = useReadStatisticsQuery()

  if (isLoading) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  const stats = [
    {
      title: "Published Courses",
      value: data?.courses,
      icon: <MenuBookOutlinedIcon />,
      color: "primary",
    },
    { title: "Active Members", value: data?.users, icon: <PeopleOutlinedIcon />, color: "success" },
    {
      title: "Course Enrollments",
      value: data?.enrollments,
      icon: <SchoolOutlinedIcon />,
      color: "info",
    },
    {
      title: "Course Completions",
      value: data?.completions,
      icon: <EmojiEventsOutlinedIcon />,
      color: "warning",
    },
    {
      title: "Certified Members",
      value: data?.certifications,
      icon: <WorkspacePremiumOutlinedIcon />,
      color: "error",
    },
    {
      title: "Total Revenue",
      value: `$${(data?.total_revenue || 0).toLocaleString()}`,
      icon: <AttachMoneyOutlinedIcon />,
      color: "success",
      subtitle: "All-time",
    },
  ]

  // Enrollment trend (30 days)
  const trendData = data?.trend?.length ? data.trend : []
  const trendXAxis = trendData.map(d => d.date)
  const trendSeries = trendData.map(d => d.count)

  // Revenue trend (30 days)
  const revenueTrend = data?.revenue_trend?.length ? data.revenue_trend : []
  const revenueXAxis = revenueTrend.map(d => d.date)
  const revenueSeries = revenueTrend.map(d => d.amount)

  // Category distribution for bar chart
  const categoryDist = data?.category_distribution?.length ? data.category_distribution : []
  const categoryLabels = categoryDist.map(d => d.category)
  const categoryCounts = categoryDist.map(d => d.count)

  // Enrollment completion pie
  const inProgress = Math.max(0, (data?.enrollments || 0) - (data?.completions || 0))
  const pieData = [
    { id: 0, value: data?.completions || 0, label: "Completed", color: "#059669" },
    { id: 1, value: inProgress, label: "In Progress", color: "#2563EB" },
  ].filter(d => d.value > 0)

  // Status breakdown for donut
  const statusData = (data?.status_breakdown || [])
    .filter(item => item.count > 0)
    .map((item, i) => ({
      id: i,
      value: item.count,
      label: item.status,
      color: STATUS_COLORS[item.status?.toLowerCase()] || CHART_COLORS[i % CHART_COLORS.length],
    }))

  // Top courses
  const topCourses = data?.top_courses?.length ? data.top_courses : []

  // Shared axis styling
  const axisStyle = {
    tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary },
    labelStyle: { fontSize: 11, fill: theme.palette.text.secondary },
  }

  return (
    <CModuleLayout>
      <Box sx={{ pb: 2 }}>
        <Typography variant="h6" component="h1" sx={{ mb: 2, fontWeight: "bold" }}>
          LMS Overview
        </Typography>

        {/* Stat Cards */}
        <Grid container spacing={1.5} columns={{ xs: 12, sm: 12, md: 12 }}>
          {stats.map((stat, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>

        {/* Charts Grid */}
        <Box sx={{ mt: 1.5 }}>
          <Grid container spacing={1.5} columns={{ xs: 4, sm: 8, md: 12 }}>
            {/* Enrollment Trend */}
            <Grid size={{ xs: 4, sm: 8, md: 6 }}>
              <EnrollmentTrendChart
                trendXAxis={trendXAxis}
                trendSeries={trendSeries}
                axisStyle={axisStyle}
              />
            </Grid>

            {/* Revenue Trend */}
            <Grid size={{ xs: 4, sm: 8, md: 6 }}>
              <RevenueTrendChart
                revenueXAxis={revenueXAxis}
                revenueSeries={revenueSeries}
                axisStyle={axisStyle}
              />
            </Grid>

            {/* Enrollment Status */}
            <Grid size={{ xs: 4, sm: 8, md: 6 }}>
              <EnrollmentStatusChart statusData={statusData} />
            </Grid>

            {/* Completion Rate */}
            <Grid size={{ xs: 4, sm: 8, md: 6 }}>
              <CompletionRateChart pieData={pieData} completions={data?.completions || 0} />
            </Grid>

            {/* Category Distribution */}
            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
              <CategoryDistributionChart
                categoryLabels={categoryLabels}
                categoryCounts={categoryCounts}
              />
            </Grid>

            {/* Top Courses */}
            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
              <TopCoursesList topCourses={topCourses} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </CModuleLayout>
  )
}
