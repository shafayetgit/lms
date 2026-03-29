"use client";
import React from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Divider,
  Chip,
  Rating,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
  }),
};

export default function CourseDetailPage() {
  return (
    <Box>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <motion.div initial="hidden" whileInView="visible" variants={fadeUp}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Advanced Banking Risk Management
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Master risk frameworks, compliance, and financial modeling with
              experts from global banks.
            </Typography>
            <Stack
              direction={{xs:'column', sm:'row'}}
              justifyContent="center"
              spacing={1}
              sx={{ mb: 3 }}
            >
              <Chip icon={<SchoolIcon />} label="Banking & Finance" />
              <Chip icon={<AccessTimeIcon />} label="12 Weeks" />
              <Chip icon={<PeopleIcon />} label="2,300+ Learners" />
            </Stack>
            <Rating value={4.7} precision={0.1} readOnly size="large" />
          </Box>
        </motion.div>

        <Grid container spacing={6}>
          {/* Left Side: Content */}
          <Grid item xs={12} md={8}>
            {/* About Course */}
            <motion.div
              custom={1}
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
            >
              <Typography variant="h5" fontWeight={600} gutterBottom>
                About This Course
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.7 }}
              >
                This program dives deep into banking risk frameworks, compliance
                essentials, and hands-on financial modeling. You’ll gain
                practical knowledge to navigate regulatory landscapes and make
                data-driven risk decisions in today’s banking sector.
              </Typography>
            </motion.div>

            <Divider sx={{ my: 4 }} />

            {/* What You’ll Learn */}
            <motion.div
              custom={2}
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
            >
              <Typography variant="h5" fontWeight={600} gutterBottom>
                What You’ll Learn
              </Typography>
              <Stack spacing={2} mt={2}>
                {[
                  "Identify and assess banking risks using global frameworks.",
                  "Apply Basel III principles to financial institutions.",
                  "Conduct advanced risk modeling with real-world datasets.",
                  "Strengthen compliance with regulatory standards.",
                ].map((item, idx) => (
                  <Stack
                    direction="row"
                    spacing={1}
                    key={idx}
                    alignItems="center"
                  >
                    <CheckCircleIcon color="success" />
                    <Typography variant="body1">{item}</Typography>
                  </Stack>
                ))}
              </Stack>
            </motion.div>

            <Divider sx={{ my: 4 }} />

            {/* Instructor */}
            <motion.div
              custom={3}
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
            >
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Instructor
              </Typography>
              <Card sx={{ display: "flex", alignItems: "center", p: 2, mt: 2 }}>
                <Avatar
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  sx={{ width: 80, height: 80, mr: 3 }}
                />
                <CardContent>
                  <Typography variant="h6">Dr. Michael Johnson</Typography>
                  <Typography variant="subtitle2" color="primary">
                    Former Risk Director, Global Bank Inc.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    With 15+ years of banking risk management experience, Dr.
                    Johnson has trained thousands of professionals across Asia
                    and Europe.
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Right Side: Enrollment Card */}
          <Grid item xs={12} md={4}>
            <motion.div
              custom={4}
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
            >
              <Card raised sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Enroll Today
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  $499
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  One-time payment. Lifetime access to course materials.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ mb: 2 }}
                  startIcon={<PlayCircleIcon />}
                >
                  Start Learning
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  fullWidth
                >
                  Preview Course
                </Button>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
