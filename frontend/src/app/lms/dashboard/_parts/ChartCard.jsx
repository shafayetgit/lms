import React from "react"
import { Card, CardContent } from "@mui/material"

// Shared chart card wrapper
export const ChartCard = ({ children, sx }) => (
  <Card sx={{ 
    height: '100%', 
    borderRadius: 1, 
    border: '1px solid', 
    borderColor: 'divider', 
    boxShadow: 'none',
    ...sx 
  }}>
    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1.25, '&:last-child': { pb: 1.25 } }}>
      {children}
    </CardContent>
  </Card>
)
