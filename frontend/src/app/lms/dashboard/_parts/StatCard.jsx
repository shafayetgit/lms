import React from "react"
import { Box, Card, CardContent, Typography } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"

export const StatCard = ({ title, value, icon, color, subtitle }) => {
  const theme = useTheme()
  return (
    <Card
      sx={{
        height: "100%",
        minHeight: 90,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        borderLeft: "4px solid",
        borderLeftColor: `${color}.main`,
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <CardContent
        sx={{ display: "flex", alignItems: "center", p: 1.5, "&:last-child": { pb: 1.5 } }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: "50%",
            bgcolor: theme => alpha(theme.palette[color]?.main || "#000", 0.1),
            color: `${color}.main`,
            mr: 1.5,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight="medium"
            sx={{ lineHeight: 1.2, mb: 0.5 }}
          >
            {title}
          </Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
            {value || 0}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: 1, mt: 0.25, display: "block" }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
