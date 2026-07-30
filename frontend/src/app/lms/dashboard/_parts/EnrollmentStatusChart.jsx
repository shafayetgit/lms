"use client"

import React from "react"
import { Box, Typography } from "@mui/material"
import dynamic from "next/dynamic"
import { ChartCard } from "./ChartCard"
import { ChartHeader } from "./ChartHeader"
import { EmptyState } from "./EmptyState"

const PieChart = dynamic(() => import("@mui/x-charts/PieChart").then(mod => mod.PieChart), {
  ssr: false,
})

// Renders the enrollment status donut chart with centered total count
export function EnrollmentStatusChart({ statusData = [] }) {
  const total = statusData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <ChartCard>
      <ChartHeader title="Enrollment Status" subtitle="Current distribution" />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 230,
          position: "relative",
        }}
      >
        {statusData.length > 0 ? (
          <>
            <PieChart
              series={[
                {
                  data: statusData,
                  innerRadius: 50,
                  outerRadius: 80,
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
              }}
              margin={{ top: 15, bottom: 45, left: 5, right: 5 }}
              slotProps={{
                legend: {
                  direction: "row",
                  position: { vertical: "bottom", horizontal: "middle" },
                },
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 85,
                left: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "text.primary", lineHeight: 1 }}>
                {total}
              </Typography>
            </Box>
          </>
        ) : (
          <EmptyState text="No enrollment data available" />
        )}
      </Box>
    </ChartCard>
  )
}
