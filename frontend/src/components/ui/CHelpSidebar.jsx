"use client"
import React from "react"
import { Box, Typography, Stack } from "@mui/material"
import { LightbulbOutlined } from "@mui/icons-material"

export default function CHelpSidebar({
  title = "Help & Guidelines",
  description,
  tips = [],
  children,
}) {
  return (
    <Box
      sx={{
        position: "sticky",
        top: 24, // adjust this if you have a fixed topbar
        maxHeight: "calc(100vh - 48px)",
        overflowY: "auto",
        // Hide scrollbar for a cleaner look
        "&::-webkit-scrollbar": { display: "none" },
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <LightbulbOutlined color="primary" />
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </Stack>
      {description && (
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
      )}

      {tips && tips.length > 0 && (
        <>
          <Typography variant="subtitle2" fontWeight="bold" mt={2} mb={1}>
            Quick Tips:
          </Typography>
          <Box
            component="ul"
            sx={{ pl: 2, m: 0, "& li": { mb: 1, typography: "body2", color: "text.secondary" } }}
          >
            {tips.map((tip, index) => {
              const label = tip.label || tip.title
              const text = tip.text || tip.description
              return (
                <li key={index}>
                  {label && <strong>{label}: </strong>}
                  {text}
                </li>
              )
            })}
          </Box>
        </>
      )}
      {children}
    </Box>
  )
}
