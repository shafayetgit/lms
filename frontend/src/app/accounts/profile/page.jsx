"use client";
import React, { useState } from "react";
import { Box, Grid, Typography, Avatar, useTheme, Chip } from "@mui/material";
import AccountsLayout from "../AccountsLayout";

export default function page() {
  const theme = useTheme();

  return (
    <AccountsLayout pageTitle="Profile Info">
      <Box
        p={3}
        borderRadius={2}
        boxShadow={1}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: 3,
          // backgroundColor: "background.paper",
          border: 1,
          borderColor: "divider",
        }}
      >
        {/* Avatar Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src="https://i.pravatar.cc/100"
            sx={{
              width: 72,
              height: 72,
              border: 3,
              borderColor: "primary.light",
            }}
          />
        </Box>

        {/* User Info Section */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Nick DuBuque
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 0.5, sm: 3 },
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Member since:{" "}
              <Box component="span" fontWeight={500}>
                2023
              </Box>
            </Typography>
          </Box>
        </Box>

        {/* Status Section */}
        <Typography color="text.secondary" fontStyle="italic" fontWeight={500}>
          SILVER USER
        </Typography>
      </Box>

      <Grid container spacing={2} mt={2}>
        {[
          { count: "120", label: "All Courses" },
          { count: "15", label: "Enrolled" },
          { count: "05", label: "Completed" },
          { count: "03", label: "Certificates Earned" },
        ].map((item, idx) => (
          <Grid size={{ xs: 6, sm: 3 }} key={idx}>
            <Box
              p={2.5}
              textAlign="center"
              // bgcolor={theme.palette.background.paper}
              borderRadius={3}
              boxShadow={1}
            >
              <Typography variant="h6" color="primary" fontWeight={700}>
                {item.count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
          </Grid>
        ))}

        <Grid size={12}>
          <Box mt={4} p={3} borderRadius={3} boxShadow={1}>
            <Grid container spacing={2}>
              {/* First Name */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  First Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  Nick
                </Typography>
              </Grid>

              {/* Last Name */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  DuBuque
                </Typography>
              </Grid>

              {/* Email */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={500}
                  sx={{ wordBreak: "break-word" }}
                >
                  Jayden.Gislason78@gmail.com
                </Typography>
              </Grid>

              {/* Phone */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Phone
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  (445) 653-3771 x985
                </Typography>
              </Grid>

              {/* Birth Date */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Birth date
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  25 Apr, 1996
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </AccountsLayout>
  );
}
