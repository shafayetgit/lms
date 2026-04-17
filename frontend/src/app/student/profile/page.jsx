"use client";
import React from "react";
import {
  Box,
  Typography,
  Avatar,
  useTheme,
  Stack,
  Divider,
  Paper,
  alpha,
  Grid
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
  Person,
  MilitaryTech,
  LocationOn,
  Security
} from "@mui/icons-material";
import { motion } from "framer-motion";
import StudentLayout from "../StudentLayout";
import CButton from "@/components/ui/CButton";
import NeuralPanel from "@/components/ui/NeuralPanel";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function ProfilePage() {
  const theme = useTheme();

  const stats = [
    { count: "120", label: "Module Points", icon: <MilitaryTech />, color: theme.palette.primary.main },
    { count: "15", label: "Active Courses", icon: <CalendarMonth />, color: theme.palette.secondary.main },
    { count: "05", label: "Specializations", icon: <Verified />, color: '#10b981' },
    { count: "03", label: "Elite Credentials", icon: <WorkspacePremium />, color: '#FFB000' },
  ];

  return (
    <StudentLayout>
      <Box
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        sx={{ width: "100%", pb: 10 }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Typography
              variant="h3"
              fontWeight="900"
              sx={{
                letterSpacing: "-0.04em",
                color: 'primary.main',
                mb: 1
              }}
            >
              Student Persona
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: -0.5 }}>
              Manage your academic identity and credential ecosystem.
            </Typography>
          </Box>

          <CButton
            label="Edit Identity"
            variant="contained"
            color="secondary"
            icon={<Edit />}
            sx={{ borderRadius: '16px', px: 4, py: 1.5, fontWeight: 900 }}
          />
        </Box>

        <Stack spacing={6}>
          {/* Profile Hero Card */}
          <motion.div variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: '40px',
                position: 'relative',
                overflow: 'hidden',
                bgcolor: "rgba(255, 255, 255, 0.6) !important",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                gap: 6,
              }}
            >
              <NeuralPanel particleCount={30} opacity={0.05} />

              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src="https://i.pravatar.cc/150?u=nick"
                  sx={{
                    width: { xs: 140, md: 180 },
                    height: { xs: 140, md: 180 },
                    border: "8px solid white",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    borderRadius: '48px'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    bgcolor: 'secondary.main',
                    color: 'white',
                    borderRadius: '14px',
                    p: 1,
                    display: 'flex',
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  <Verified sx={{ fontSize: 20 }} />
                </Box>
              </Box>

              <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' }, position: 'relative', zIndex: 1 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" mb={1}>
                  <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.04em', color: 'primary.main' }}>
                    Nick DuBuque
                  </Typography>
                  <Chip
                    label="SILVER MEMBER"
                    size="small"
                    sx={{
                      fontWeight: 900,
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: 'secondary.main',
                      height: 24,
                      fontSize: '0.65rem',
                      borderRadius: '6px'
                    }}
                  />
                </Stack>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={3}
                  alignItems="center"
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                  sx={{ mb: 4 }}
                >
                  <Typography variant="body1" sx={{ color: "text.secondary", display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                    <Email sx={{ fontSize: 18, color: 'secondary.main' }} /> nick.dubuque@ecofin.edu
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                    <LocationOn sx={{ fontSize: 18, color: 'secondary.main' }} /> New York, Global
                  </Typography>
                </Stack>

                <Divider sx={{ mb: 4, opacity: 0.1 }} />

                <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                  <CButton label="View Transcript" variant="outlined" color="primary" sx={{ borderRadius: '14px', fontWeight: 900 }} />
                  <CButton label="Security Protocol" variant="text" color="primary" icon={<Security />} sx={{ fontWeight: 900 }} />
                </Stack>
              </Box>
            </Paper>
          </motion.div>

          {/* Stats Grid */}
          <Grid container spacing={4}>
            {stats.map((item, idx) => (
              <Grid size={{ xs: 6, sm: 3 }} key={idx}>
                <motion.div variants={itemVariants}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      borderRadius: '32px',
                      border: "1px solid rgba(0,0,0,0.06)",
                      bgcolor: "rgba(255, 255, 255, 0.6) !important",
                      backdropFilter: "blur(10px)",
                      transition: "all 0.4s cubic-bezier(0.2, 1, 0.3, 1)",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 24px 48px -12px rgba(0,0,0,0.12)",
                        borderColor: alpha(item.color, 0.4),
                      }
                    }}
                  >
                    <Avatar sx={{ width: 44, height: 44, bgcolor: alpha(item.color, 0.1), color: item.color, mx: 'auto', mb: 2, borderRadius: '12px' }}>
                      {item.icon}
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: -1, mb: 0.5 }}>
                      {item.count}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {item.label}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Persona Details */}
          <motion.div variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: '40px',
                border: "1px solid rgba(0,0,0,0.06)",
                bgcolor: "rgba(255, 255, 255, 0.4) !important",
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 5, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 2, letterSpacing: -1 }}>
                <Person sx={{ color: 'secondary.main', fontSize: 32 }} /> Personal Archetype
              </Typography>

              <Grid container spacing={6}>
                {[
                  { label: "Designation", value: "Nick DuBuque", icon: null },
                  { label: "Account ID", value: "ECO-9942-X", icon: null },
                  { label: "Communication", value: "nick.dubuque@ecofin.edu", icon: <Email fontSize="small" /> },
                  { label: "Secure Phone", value: "+1 (445) 653-3771", icon: <Phone fontSize="small" /> },
                  { label: "Birth Era", value: "25th April, 1996", icon: <Cake fontSize="small" /> },
                  { label: "Primary Region", value: "United States (Global Hub)", icon: null },
                ].map((field, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 900, textTransform: 'uppercase', mb: 1, display: 'block', letterSpacing: 1 }}>
                      {field.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5, letterSpacing: -0.5 }}>
                      {field.icon && <Box sx={{ color: 'secondary.main', display: 'flex' }}>{field.icon}</Box>}
                      {field.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </motion.div>
        </Stack>
      </Box>
    </StudentLayout>
  );
}

const Chip = ({ label, size, sx }) => {
  return (
    <Box sx={{
      px: 1.5,
      py: 0.5,
      bgcolor: 'secondary.main',
      color: 'white',
      borderRadius: '6px',
      fontSize: '0.65rem',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: 1,
      ...sx
    }}>
      {label}
    </Box>
  )
}
