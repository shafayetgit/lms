"use client"

import React from "react"
import { Box, useTheme } from "@mui/material"
import dynamic from "next/dynamic"
import { ChartCard } from "./ChartCard"
import { ChartHeader } from "./ChartHeader"
import { EmptyState } from "./EmptyState"

const BarChart = dynamic(() => import("@mui/x-charts/BarChart").then(mod => mod.BarChart), {
  ssr: false,
})

// Renders bar chart displaying course count per category
export function CategoryDistributionChart({ categoryLabels = [], categoryCounts = [] }) {
  const theme = useTheme()

  return (
    <ChartCard>
      <ChartHeader
        title="Courses by Category"
        subtitle="Published courses per category"
      />
      <Box sx={{ flexGrow: 1, width: "100%", height: 270 }}>
        {categoryLabels.length > 0 ? (
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: categoryLabels,
                categoryGapRatio: 0.4,
                tickLabelStyle: {
                  fontSize: 10,
                  angle: -40,
                  textAnchor: "end",
                  fill: theme.palette.text.secondary,
                },
              },
            ]}
            yAxis={[
              {
                tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary },
                tickMinStep: 1,
              },
            ]}
            series={[
              {
                data: categoryCounts,
                color: "#7C3AED",
                valueFormatter: value => `${value} course${value !== 1 ? "s" : ""}`,
              },
            ]}
            margin={{ top: 15, bottom: 70, left: 35, right: 15 }}
            borderRadius={4}
            sx={{
              "& .MuiBarElement-root": {
                transition: "opacity 0.2s",
                "&:hover": { opacity: 0.8 },
              },
            }}
          />
        ) : (
          <EmptyState text="No category data available" />
        )}
      </Box>
    </ChartCard>
  )
}
