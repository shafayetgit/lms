import React from "react"
import { Typography, Box, alpha } from "@mui/material"

export default function CSectionLabel({ label, sx = {} }) {
  return (
    <Box sx={{ width: "100%", mb: 1, mt: 1, ...sx }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "text.secondary",
          textTransform: "uppercase",
          display: "block",
          mb: 2.5,
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

// <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: "0.1em", color: "text.secondary", textTransform: "uppercase", display: "block", mb: 2.5 }}>
//   Email Templates
// </Typography>
