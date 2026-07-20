"use client";

import React from "react";
import { Box, IconButton, alpha } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export default function CollapseButton({ isMini, setIsMini, isMobile, theme }) {
  if (isMobile) return null;

  return (
    <Box
      sx={{
        p: 2,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
        display: "flex",
        justifyContent: isMini ? "center" : "flex-end",
      }}
    >
      <IconButton
        onClick={() => setIsMini(!isMini)}
        aria-label={isMini ? "Expand sidebar" : "Collapse sidebar"}
        size="small"
        sx={{
          color: "text.secondary",
          bgcolor: alpha(theme.palette.action.hover, 0.05),
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          "&:hover": {
            bgcolor: alpha(theme.palette.action.hover, 0.1),
            color: "text.primary",
          },
        }}
      >
        {isMini ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
      </IconButton>
    </Box>
  );
}
