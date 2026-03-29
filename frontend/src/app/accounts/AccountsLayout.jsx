"use client";
import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Container,
  Paper
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./_partials/Sidebar";

export default function AccountsLayout({ children, pageTitle, actionButton }) {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Container>
      <Grid container spacing={{ xs: 3, md: 4 }}>

        {/* Desktop Sidebar (Hidden on Mobile) */}
        <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box
            sx={{
              position: "sticky",
              top: theme.spacing(12),
              alignSelf: "flex-start",
              height: "fit-content",
            }}
          >
            <Sidebar />
          </Box>
        </Grid>

        {/* Mobile Sidebar Drawer */}
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            display: { xs: "block", md: "none" },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              p: 2
            },
          }}
        >
          <Sidebar />
        </Drawer>

        {/* Main Content Area */}
        <Grid size={{ xs: 12, md: 9 }}>
          {/* Header Row */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            mb={4}
            flexDirection={{ xs: "column", sm: "row" }}
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={1}>
              {isSmall && (
                <IconButton
                  onClick={() => setMobileOpen(true)}
                  edge="start"
                  sx={{ mr: 1, color: theme.palette.primary.main }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h4" fontWeight={700} color="text.primary">
                {pageTitle}
              </Typography>
            </Box>
            {actionButton && (
              <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                {actionButton}
              </Box>
            )}
          </Box>

          {/* Page Content wrapped in a slight container space if needed, children handle cards */}
          <Box sx={{ minHeight: '60vh' }}>
            {children}
          </Box>
        </Grid>

      </Grid>
    </Container>
  );
}
