"use client"

import React from "react"
import { Box, Typography, Stack } from "@mui/material"
import dynamic from "next/dynamic"
import { ChartCard } from "./ChartCard"
import { ChartHeader } from "./ChartHeader"
import { EmptyState } from "./EmptyState"

const PieChart = dynamic(() => import("@mui/x-charts/PieChart").then(mod => mod.PieChart), {
  ssr: false,
})

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

// Renders top courses distribution as a donut chart with legend centered underneath
export function TopCoursesList({ topCourses = [] }) {
  const chartData = topCourses.map((course, index) => ({
    id: index,
    value: course.enrollments,
    label: course.title,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }))

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <ChartCard>
      <ChartHeader title="Top Courses" subtitle="Most enrolled courses" />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: 270,
          px: 2,
          pb: 1.5,
          overflow: "hidden",
        }}
      >
        {chartData.length > 0 ? (
          <>
            {/* Donut Chart Centered at Top */}
            <Box
              sx={{
                position: "relative",
                height: 135,
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <PieChart
                series={[
                  {
                    data: chartData,
                    innerRadius: 36,
                    outerRadius: 58,
                    paddingAngle: 0,
                    cornerRadius: 0,
                    highlightScope: { fade: "global", highlight: "item" },
                  },
                ]}
                sx={{
                  "& .MuiPieArc-root, & .MuiPieArc-root path, & path": {
                    stroke: "transparent !important",
                    strokeWidth: "0px !important",
                  },
                  "& .MuiChartsLegend-root": {
                    display: "none !important",
                  },
                }}
                margin={{ top: 5, bottom: 5, left: 5, right: 5 }}
                slotProps={{
                  legend: { hidden: true },
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary", lineHeight: 1 }}>
                  {total}
                </Typography>
              </Box>
            </Box>

            {/* Legend Stacked Centered Directly Below Donut */}
            <Stack
              spacing={1}
              sx={{
                width: "100%",
                maxWidth: 360,
                mx: "auto",
                flexGrow: 1,
                overflowY: "auto",
                mt: 1,
                px: 1,
              }}
            >
              {topCourses.map((course, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    width: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: CHART_COLORS[index % CHART_COLORS.length],
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        wordBreak: "break-word",
                        lineHeight: 1.3,
                        fontSize: "0.825rem",
                      }}
                    >
                      {course.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      fontSize: "0.825rem",
                      flexShrink: 0,
                    }}
                  >
                    ({course.enrollments})
                  </Typography>
                </Box>
              ))}
            </Stack>
          </>
        ) : (
          <EmptyState text="No course data available" />
        )}
      </Box>
    </ChartCard>
  )
}
