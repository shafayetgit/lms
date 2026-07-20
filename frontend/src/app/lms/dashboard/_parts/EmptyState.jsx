import React from "react"
import { Box, Typography } from "@mui/material"

// Placeholder for empty chart state
export const EmptyState = ({ text }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 200, 
    width: '100%' 
  }}>
    <Typography variant="body2" color="text.secondary">{text}</Typography>
  </Box>
)
