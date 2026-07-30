"use client"

import React from "react"
import { Box } from "@mui/material"
import dynamic from "next/dynamic"
import { ChartCard } from "./ChartCard"
import { ChartHeader } from "./ChartHeader"
import { EmptyState } from "./EmptyState"

// Dynamically import x-charts sub-components
const ChartsContainer = dynamic(
  () => import("@mui/x-charts/ChartsContainer").then(mod => mod.ChartsContainer),
  { ssr: false }
)
const AreaPlot = dynamic(() => import("@mui/x-charts/LineChart").then(mod => mod.AreaPlot), {
  ssr: false,
})
const LinePlot = dynamic(() => import("@mui/x-charts/LineChart").then(mod => mod.LinePlot), {
  ssr: false,
})
const ChartsXAxis = dynamic(() => import("@mui/x-charts").then(mod => mod.ChartsXAxis), {
  ssr: false,
})
const ChartsYAxis = dynamic(() => import("@mui/x-charts").then(mod => mod.ChartsYAxis), {
  ssr: false,
})
const ChartsTooltip = dynamic(() => import("@mui/x-charts").then(mod => mod.ChartsTooltip), {
  ssr: false,
})

// Renders the daily revenue trend line chart
export function RevenueTrendChart({ revenueXAxis = [], revenueSeries = [], axisStyle = {} }) {
  return (
    <ChartCard>
      <ChartHeader
        title="Revenue Trend"
        subtitle="Daily revenue from completed payments — Last 30 days"
      />
      <Box sx={{ flexGrow: 1, width: "100%", height: 220 }}>
        {revenueXAxis.length > 0 ? (
          <ChartsContainer
            xAxis={[
              {
                scaleType: "point",
                data: revenueXAxis,
                ...axisStyle,
              },
            ]}
            yAxis={[
              {
                ...axisStyle,
                valueFormatter: v => `$${v}`,
              },
            ]}
            series={[
              {
                type: "line",
                data: revenueSeries,
                area: true,
                color: "#059669",
                showMark: false,
                curve: "catmullRom",
                valueFormatter: v => `$${v?.toLocaleString() || 0}`,
              },
            ]}
            margin={{ top: 8, bottom: 20, left: 28, right: 8 }}
            sx={{
              "& .MuiAreaElement-root": {
                fill: "url('#revenueGradient')",
              },
              "& .MuiLineElement-root": {
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
  )
}
