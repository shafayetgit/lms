"use client";
import React from "react";
import {
  Box,
  Grid,
  Typography,
  Avatar,
  useTheme,
  Stack,
  Divider,
  Paper
} from "@mui/material";
import {
  School,
  WorkspacePremium,
  CalendarMonth,
  Verified,
  Edit,
  Email,
  Phone,
  Cake,
  Person
} from "@mui/icons-material";
import AccountsLayout from "../AccountsLayout";
import CButton from "@/components/CButton";

export default function ProfilePage() {
  const theme = useTheme();

  const stats = [
    { count: "120", label: "All Courses", icon: <School sx={{ color: 'primary.main' }} />, color: 'primary.main' },
    { count: "15", label: "Enrolled", icon: <CalendarMonth sx={{ color: 'secondary.main' }} />, color: 'secondary.main' },
    { count: "05", label: "Completed", icon: <Verified sx={{ color: '#4CAF50' }} />, color: '#4CAF50' },
    { count: "03", label: "Certificates", icon: <WorkspacePremium sx={{ color: '#FFB000' }} />, color: '#FFB000' },
  ];

  return (
    <AccountsLayout
      pageTitle="Profile Information"
      actionButton={
        <CButton
          label="Edit Profile"
          variant="contained"
          startIcon={<Edit />}
          sx={{ borderRadius: '50px', px: 3 }}
        />
      }
    >
      <Stack spacing={4}>
        {/* Profile Hero Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 6,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
            border: "1px solid",
            borderColor: "rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 4,
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src="https://i.pravatar.cc/150?u=nick"
              sx={{
                width: { xs: 100, md: 120 },
                height: { xs: 100, md: 120 },
                border: "4px solid",
                borderColor: "background.paper",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                bgcolor: 'secondary.main',
                color: 'white',
                borderRadius: '50%',
                p: 0.5,
                display: 'flex',
                border: '2px solid white'
              }}
            >
              <Verified sx={{ fontSize: 16 }} />
            </Box>
          </Box>

          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1 }}>
              Nick DuBuque
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 3 }}
              alignItems="center"
              justifyContent={{ xs: 'center', sm: 'flex-start' }}
            >
              <Typography variant="body2" sx={{ color: "text.secondary", display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Email sx={{ fontSize: 16 }} /> jayden.gislason78@gmail.com
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: "50px",
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Silver Member
              </Typography>
            </Stack>
          </Box>
        </Paper>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          {stats.map((item, idx) => (
            <Grid size={{ xs: 6, sm: 3 }} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "rgba(0,0,0,0.06)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.04)",
                    borderColor: item.color,
                  }
                }}
              >
                <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
                  {item.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
                  {item.count}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  {item.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Details Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 6,
            border: "1px solid",
            borderColor: "rgba(0,0,0,0.06)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person sx={{ color: 'primary.main' }} /> Personal Information
          </Typography>

          <Grid container spacing={4}>
            {[
              { label: "First Name", value: "Nick", icon: null },
              { label: "Last Name", value: "DuBuque", icon: null },
              { label: "Email Address", value: "Jayden.Gislason78@gmail.com", icon: <Email fontSize="small" /> },
              { label: "Phone Number", value: "(445) 653-3771", icon: <Phone fontSize="small" /> },
              { label: "Date of Birth", value: "25 April, 1996", icon: <Cake fontSize="small" /> },
              { label: "Country", value: "United States", icon: null },
            ].map((field, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                  {field.label}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                  {field.value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Stack>
    </AccountsLayout>
  );
}
