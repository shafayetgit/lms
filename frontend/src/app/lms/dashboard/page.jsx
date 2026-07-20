"use client"

import React from "react"
import Grid from "@mui/material/Grid"
import { Box, Card, CardContent, Typography, List, ListItem, LinearProgress } from "@mui/material"
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
import { alpha, useTheme } from "@mui/material/styles"
import dynamic from "next/dynamic"

// Dynamically import heavy chart components to improve Performance score
const LineChart = dynamic(() => import("@mui/x-charts/LineChart").then(mod => mod.LineChart), { ssr: false })
const PieChart = dynamic(() => import("@mui/x-charts/PieChart").then(mod => mod.PieChart), { ssr: false })
const BarChart = dynamic(() => import("@mui/x-charts/BarChart").then(mod => mod.BarChart), { ssr: false })
const ChartsContainer = dynamic(() => import("@mui/x-charts/ChartsContainer").then(mod => mod.ChartsContainer), { ssr: false })
const AreaPlot = dynamic(() => import("@mui/x-charts/LineChart").then(mod => mod.AreaPlot), { ssr: false })
const LinePlot = dynamic(() => import("@mui/x-charts/LineChart").then(mod => mod.LinePlot), { ssr: false })
const ChartsXAxis = dynamic(() => import("@mui/x-charts").then(mod => mod.ChartsXAxis), { ssr: false })
const ChartsYAxis = dynamic(() => import("@mui/x-charts").then(mod => mod.ChartsYAxis), { ssr: false })
const ChartsTooltip = dynamic(() => import("@mui/x-charts").then(mod => mod.ChartsTooltip), { ssr: false })

import { StatCard } from "./_parts/StatCard"
import { ChartHeader } from "./_parts/ChartHeader"
import { ChartCard } from "./_parts/ChartCard"
import { EmptyState } from "./_parts/EmptyState"

// Curated palette for charts
const CHART_COLORS = [
  "#2563EB", "#7C3AED", "#059669", "#D97706",
  "#DC2626", "#0891B2", "#4F46E5", "#BE185D"
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
    { title: "Published Courses", value: data?.courses, icon: <MenuBookOutlinedIcon />, color: "primary" },
    { title: "Active Members", value: data?.users, icon: <PeopleOutlinedIcon />, color: "success" },
    { title: "Course Enrollments", value: data?.enrollments, icon: <SchoolOutlinedIcon />, color: "info" },
    { title: "Course Completions", value: data?.completions, icon: <EmojiEventsOutlinedIcon />, color: "warning" },
    { title: "Certified Members", value: data?.certifications, icon: <WorkspacePremiumOutlinedIcon />, color: "error" },
    { title: "Total Revenue", value: `$${(data?.total_revenue || 0).toLocaleString()}`, icon: <AttachMoneyOutlinedIcon />, color: "success", subtitle: "All-time" }
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
    { id: 0, value: data?.completions || 0, label: 'Completed', color: '#059669' },
    { id: 1, value: inProgress, label: 'In Progress', color: '#2563EB' }
  ].filter(d => d.value > 0)

  // Status breakdown for donut
  const statusData = (data?.status_breakdown || [])
    .filter(item => item.count > 0)
    .map((item, i) => ({
      id: i,
      value: item.count,
      label: item.status,
      color: STATUS_COLORS[item.status?.toLowerCase()] || CHART_COLORS[i % CHART_COLORS.length]
    }))

  // Top courses
  const topCourses = data?.top_courses?.length ? data.top_courses : []
  const topCourseLabels = topCourses.map(d => d.title)
  const topCourseCounts = topCourses.map(d => d.enrollments)

  // Shared axis styling
  const axisStyle = {
    tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary },
    labelStyle: { fontSize: 11, fill: theme.palette.text.secondary }
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
              <ChartCard>
                <ChartHeader title="Enrollment Trend" subtitle="Daily new enrollments — Last 30 days" />
                <Box sx={{ flexGrow: 1, width: '100%', height: 220 }}>
                  {trendXAxis.length > 0 ? (
                    <ChartsContainer
                      xAxis={[{
                        scaleType: 'point',
                        data: trendXAxis,
                        ...axisStyle,
                      }]}
                      yAxis={[{ ...axisStyle }]}
                      series={[{
                        type: 'line',
                        data: trendSeries,
                        area: true,
                        color: '#2563EB',
                        showMark: false,
                        curve: 'catmullRom',
                      }]}
                      margin={{ top: 8, bottom: 20, left: 18, right: 8 }}
                      sx={{
                        '& .MuiAreaElement-root': {
                          fill: "url('#enrollmentGradient')",
                        },
                        '& .MuiLineElement-root': {
                          strokeWidth: 2.5,
                        },
                      }}
                    >
                      <defs>
                        <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <AreaPlot />
                      <LinePlot />
                      <ChartsXAxis position="bottom" />
                      <ChartsYAxis position="left" />
                      <ChartsTooltip />
                    </ChartsContainer>
                  ) : (
                    <EmptyState text="No enrollment data available" />
                  )}
                </Box>
              </ChartCard>
            </Grid>

            {/* Revenue Trend */}
            <Grid size={{ xs: 4, sm: 8, md: 6 }}>
              <ChartCard>
                <ChartHeader title="Revenue Trend" subtitle="Daily revenue from completed payments — Last 30 days" />
                <Box sx={{ flexGrow: 1, width: '100%', height: 220 }}>
                  {revenueXAxis.length > 0 ? (
                    <ChartsContainer
                      xAxis={[{
                        scaleType: 'point',
                        data: revenueXAxis,
                        ...axisStyle,
                      }]}
                      yAxis={[{
                        ...axisStyle,
                        valueFormatter: (v) => `$${v}`
                      }]}
                      series={[{
                        type: 'line',
                        data: revenueSeries,
                        area: true,
                        color: '#059669',
                        showMark: false,
                        curve: 'catmullRom',
                        valueFormatter: (v) => `$${v?.toLocaleString() || 0}`,
                      }]}
                      margin={{ top: 8, bottom: 20, left: 28, right: 8 }}
                      sx={{
                        '& .MuiAreaElement-root': {
                          fill: "url('#revenueGradient')",
                        },
                        '& .MuiLineElement-root': {
                          strokeWidth: 2.5,
                        },
                      }}
                    >
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <AreaPlot />
                      <LinePlot />
                      <ChartsXAxis position="bottom" />
                      <ChartsYAxis position="left" />
                      <ChartsTooltip />
                    </ChartsContainer>
                  ) : (
                    <EmptyState text="No revenue data available" />
                  )}
                </Box>
              </ChartCard>
            </Grid>

            {/* Enrollment Status */}
            <Grid size={{ xs: 4, sm: 8, md: 6 }}>
              <ChartCard>
                <ChartHeader title="Enrollment Status" subtitle="Current distribution" />
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 230 }}>
                  {statusData.length > 0 ? (
                    <PieChart
                      series={[{
                        data: statusData,
                        innerRadius: 40,
                        outerRadius: 80,
                        paddingAngle: statusData.length > 1 ? 2 : 0,
                        cornerRadius: statusData.length > 1 ? 4 : 0,
                        arcLabel: (item) => `${item.value}`,
                        arcLabelMinAngle: 25,
                        highlightScope: { fade: 'global', highlight: 'item' },
                      }]}
                      sx={{
                        '& .MuiPieArcLabel-root': {
                          fill: 'white',
                          fontWeight: 'bold',
                          fontSize: 12,
                        },
                      }}
                      margin={{ top: 5, bottom: 45, left: 5, right: 5 }}
                      slotProps={{
                        legend: {
                          direction: 'row',
                          position: { vertical: 'bottom', horizontal: 'middle' },
                        }
                      }}
                    />
                  ) : (
                    <EmptyState text="No enrollment data available" />
                  )}
                </Box>
              </ChartCard>
            </Grid>

            {/* Completion Rate */}
            <Grid size={{ xs: 4, sm: 8, md: 6 }}>
              <ChartCard>
                <ChartHeader title="Completion Rate" subtitle="Completed vs. In Progress" />
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 230 }}>
                  <PieChart
                    series={[{
                      data: pieData,
                      innerRadius: 40,
                      outerRadius: 80,
                      paddingAngle: pieData.length > 1 ? 2 : 0,
                      cornerRadius: pieData.length > 1 ? 4 : 0,
                      arcLabel: (item) => {
                        const total = pieData.reduce((s, d) => s + d.value, 0)
                        if (total === 0) return '0%'
                        return `${Math.round((item.value / total) * 100)}%`
                      },
                      arcLabelMinAngle: 25,
                      highlightScope: { fade: 'global', highlight: 'item' },
                    }]}
                    sx={{
                      '& .MuiPieArcLabel-root': {
                        fill: 'white',
                        fontWeight: 'bold',
                        fontSize: 12,
                      },
                    }}
                    margin={{ top: 5, bottom: 45, left: 5, right: 5 }}
                    slotProps={{
                      legend: {
                        direction: 'row',
                        position: { vertical: 'bottom', horizontal: 'middle' },
                      }
                    }}
                  />
                </Box>
              </ChartCard>
            </Grid>

            {/* Category Distribution */}
            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
              <ChartCard>
                <ChartHeader title="Courses by Category" subtitle="Published courses per category" />
                <Box sx={{ flexGrow: 1, width: '100%', height: 270 }}>
                  {categoryLabels.length > 0 ? (
                    <BarChart
                      xAxis={[{
                        scaleType: 'band',
                        data: categoryLabels,
                        categoryGapRatio: 0.4,
                        tickLabelStyle: {
                          fontSize: 10,
                          angle: -40,
                          textAnchor: 'end',
                          fill: theme.palette.text.secondary
                        }
                      }]}
                      yAxis={[{
                        tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary },
                        tickMinStep: 1,
                      }]}
                      series={[{
                        data: categoryCounts,
                        color: '#7C3AED',
                        valueFormatter: (value) => `${value} course${value !== 1 ? 's' : ''}`,
                      }]}
                      margin={{ top: 15, bottom: 70, left: 35, right: 15 }}
                      borderRadius={4}
                      sx={{
                        '& .MuiBarElement-root': {
                          transition: 'opacity 0.2s',
                          '&:hover': { opacity: 0.8 },
                        },
                      }}
                    />
                  ) : (
                    <EmptyState text="No category data available" />
                  )}
                </Box>
              </ChartCard>
            </Grid>

            {/* Top Courses */}
            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
              <ChartCard>
                <ChartHeader title="Top Courses" subtitle="Most enrolled courses" />
                <Box sx={{ flexGrow: 1, width: '100%', px: 2, pb: 2, pt: 1, overflowY: "auto", maxHeight: 270 }}>
                  {topCourses.length > 0 ? (
                    <List disablePadding>
                      {topCourses.map((course, index) => {
                        const maxEnrollment = Math.max(...topCourses.map(c => c.enrollments));
                        const progress = maxEnrollment > 0 ? (course.enrollments / maxEnrollment) * 100 : 0;
                        
                        return (
                          <ListItem 
                            key={index} 
                            disableGutters 
                            sx={{ mb: 1.25, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                          >
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600, 
                                  color: 'text.primary', 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap', 
                                  pr: 2 
                                }}
                              >
                                {course.title}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                {course.enrollments}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress} 
                              aria-label={`Course progress for ${course.title}`}
                              sx={{ 
                                width: '100%', 
                                height: 4, 
                                borderRadius: 2,
                                bgcolor: (theme) => alpha(theme.palette.divider, 0.1),
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 2,
                                  bgcolor: CHART_COLORS[index % CHART_COLORS.length] || 'primary.main'
                                }
                              }} 
                            />
                          </ListItem>
                        )
                      })}
                    </List>
                  ) : (
                    <EmptyState text="No course data available" />
                  )}
                </Box>
              </ChartCard>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </CModuleLayout>
  )
}
