import React from "react"
import { Box, Typography } from "@mui/material"

// Section header for chart cards
export const ChartHeader = ({ title, subtitle }) => (
  <Box sx={{ mb: 1 }}>
    <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.3 }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Box>
)
