import { Box, Container } from "@mui/material";
import React from "react";

export default function layout({ children }) {
  return (
    <Box
      sx={{ minHeight: "80vh", display: "flex", alignItems: "center", py: 8 }}
    >
      <Container maxWidth="sm">{children}</Container>
    </Box>
  );
}
