
import { Box } from "@mui/material";
import React from "react";

export const renderCell = (value) => (
  <Box
    sx={{
      whiteSpace: "normal",
      wordBreak: "break-word",
      my: 0.8,
    }}
  >
    {value}
  </Box>
);
