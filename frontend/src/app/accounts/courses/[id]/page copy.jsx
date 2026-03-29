"use client";
import React, { useState } from "react";
import AccountsLayout from "../AccountsLayout";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { AccessTime, ExpandMore, MenuBook, PlayCircleFilledWhite, PlayCircleOutline, TaskAlt } from "@mui/icons-material";
import CourseReviews from "./_partials/CourseReviews";

export default function page() {
  const courseData = {
    id: 1,
    title: "Advanced Financial Analysis & Investment Banking",
    instructor: "Michael Chen",
    rating: 4.8,
    totalRatings: 1247,
    students: 15420,
    duration: "28 hours",
    lectures: 186,
    level: "Intermediate",
    lastUpdated: "October 2023",
    price: 94.99,
    originalPrice: 149.99,
    language: "English",
    description:
      "Master financial analysis, valuation, and modeling techniques used by investment bankers and equity research analysts.",
    learningObjectives: [
      "Perform advanced financial statement analysis",
      "Build complex financial models in Excel",
      "Value companies using DCF, comparable companies, and precedent transactions",
      "Analyze M&A deals and LBO transactions",
      "Create investment recommendations and pitch books",
    ],
    curriculum: [
      {
        section: "Introduction to Investment Banking",
        lectures: 12,
        duration: "2.5 hours",
        content: [
          { title: "Course Overview", duration: "15:20", preview: true },
          {
            title: "The Role of Investment Banks",
            duration: "22:45",
            preview: false,
          },
          {
            title: "Financial Markets Overview",
            duration: "18:30",
            preview: false,
          },
        ],
      },
      {
        section: "Financial Statement Analysis",
        lectures: 24,
        duration: "4 hours",
        content: [
          {
            title: "Income Statement Deep Dive",
            duration: "25:15",
            preview: true,
          },
          {
            title: "Balance Sheet Analysis",
            duration: "28:40",
            preview: false,
          },
          {
            title: "Cash Flow Statement Mastery",
            duration: "32:10",
            preview: false,
          },
        ],
      },
      {
        section: "Financial Modeling",
        lectures: 38,
        duration: "6.5 hours",
        content: [
          {
            title: "Excel Tips for Financial Modeling",
            duration: "35:25",
            preview: true,
          },
          {
            title: "Building Revenue Projections",
            duration: "42:30",
            preview: false,
          },
          {
            title: "Working Capital Schedule",
            duration: "38:15",
            preview: false,
          },
        ],
      },
    ],
    instructorInfo: {
      name: "Michael Chen",
      title: "Former Senior Analyst at Global Bank Inc.",
      bio: "Michael has over 12 years of experience in investment banking and equity research. He has worked on transactions totaling over $50 billion in value and specializes in financial modeling and valuation. Michael is passionate about teaching finance professionals practical skills that are directly applicable in their careers.",
      students: 84500,
      courses: 8,
      rating: 4.9,
      image: "https://placehold.co/150x150/87CEEB/000000?text=MC",
    },
    requirements: [
      "Basic understanding of accounting principles",
      "Microsoft Excel 2010 or later",
      "No prior finance experience required",
    ],
  };

  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <AccountsLayout pageTitle="Courses">
      <Grid size={{ xs: 12, md: 8 }}>
        {/* Course Preview Video */}
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
            },
          }}
        >
          <CardMedia
            component="div"
            onClick={() => setVideoOpen(true)} // Add your state handler
            sx={{
              height: { xs: 250, md: 400 },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              position: "relative",
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "darken",
              "&:hover .play-overlay": {
                transform: "scale(1.05)",
                backgroundColor: "rgba(255,255,255,0.15)",
              },
            }}
            aria-label="Watch course preview video"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && setVideoOpen(true)}
          >
            {/* Gradient Overlay */}
            <Box
              className="play-overlay"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(45deg, rgba(25,118,210,0.3) 0%, rgba(156,39,176,0.3) 100%)",
                transition: "all 0.3s ease",
                opacity: 0.7,
              }}
            />

            {/* Play Button with Enhanced Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: 1,
                rotate: [0, -2, 2, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "reverse",
              }}
              style={{
                position: "relative",
                zIndex: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PlayCircleFilledWhite
                  sx={{
                    fontSize: { xs: 80, md: 100 },
                    color: "white",
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                    opacity: 0.9,
                  }}
                >
                  Watch Preview
                </Typography>
              </Box>
            </motion.div>

            {/* Duration Badge */}
            <Chip
              label="2:30"
              size="small"
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "white",
                fontWeight: 600,
                backdropFilter: "blur(10px)",
              }}
            />
          </CardMedia>
        </Card>

        {/* Optional: Add this modal component for video playback */}
        <Dialog
          open={videoOpen}
          onClose={() => setVideoOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent sx={{ p: 0, height: { xs: 300, md: 500 } }}>
            {/* Replace with your video component */}
            <video controls style={{ width: "100%", height: "100%" }}>
              <source src="/course-preview.mp4" type="video/mp4" />
            </video>
          </DialogContent>
        </Dialog>

        <Typography
          variant="h2"
          // component="h1"
          gutterBottom
          fontWeight="bold"
        >
          {courseData.title}
        </Typography>

        {/* Rating */}
        <Grid container spacing={2}>
          <Grid>
            <Stack direction="row">
              <Rating value={4} readOnly size="small" precision={0.1} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {4}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                ({1012})
              </Typography>
            </Stack>
          </Grid>
          <Grid>
            <Stack direction="row">
              <MenuBook
                sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
              />
              <Typography variant="body2" color="textSecondary">
                {60} Lessons
              </Typography>
            </Stack>
          </Grid>

          <Grid>
            <Stack direction="row">
              <AccessTime
                sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
              />
              <Typography variant="body2" color="textSecondary">
                {20}h
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Overview Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Overview
          </Typography>
          <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
            {courseData.description}
            {courseData.description}
            {courseData.description}
          </Typography>
        </Box>

        {/* Requirements Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Requirements
          </Typography>
          <List dense>
            {courseData.requirements.map((req, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <TaskAlt color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={req}
                  primaryTypographyProps={{
                    color: "text.secondary",
                    variant: "body1",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* What You Will Learn */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            What you'll learn
          </Typography>

          <List>
            {courseData.learningObjectives.map((item, index) => (
              <ListItem key={index} sx={{ alignItems: "flex-start", py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                  <TaskAlt color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{
                    color: "text.secondary",
                    variant: "body1",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Curriculum Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Curriculum
          </Typography>

          {courseData.curriculum.map((section, index) => (
            <Accordion
              key={index}
              defaultExpanded={index === 0}
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography fontWeight="bold">{section.section}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.lectures} lectures • {section.duration}
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <List dense>
                  {section.content.map((lecture, idx) => (
                    <ListItem
                      key={idx}
                      secondaryAction={
                        <Typography variant="body2" color="text.secondary">
                          {lecture.duration}
                        </Typography>
                      }
                      sx={{ py: 0.8 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <PlayCircleOutline
                          color={lecture.preview ? "primary" : "inherit"}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={lecture.title}
                        primaryTypographyProps={{
                          color: lecture.preview
                            ? "primary.main"
                            : "text.primary",
                          fontWeight: lecture.preview ? "bold" : "normal",
                        }}
                      />
                      {lecture.preview && (
                        <Chip
                          label="Preview"
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mx: 2 }}
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Instructor Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Instructor
          </Typography>

          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardHeader
              avatar={
                <Avatar
                  src="https://randomuser.me/api/portraits/men/32.jpg" // instructor photo
                  sx={{ width: 80, height: 80 }}
                />
              }
              title={<Typography variant="h6">John Doe</Typography>}
              subheader={
                <Typography variant="body2" color="text.secondary">
                  Senior Web Development Instructor
                </Typography>
              }
            />
            <Divider />
            <CardContent>
              <Typography variant="body1" color="text.secondary">
                John has over 10 years of experience teaching web development
                and has guided 50,000+ students worldwide. His courses focus on
                practical, project-based learning.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Reviews Section */}
        <CourseReviews />

        {/* FAQ Section */}
        {/* <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Frequently Asked Questions
          </Typography>

          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                "&:before": { display: "none" },
                transition: "all 0.3s ease",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ px: 2, py: 1 }}
              >
                <Typography fontWeight="bold">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, py: 1 }}>
                <Typography color="text.secondary" lineHeight={1.7}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box> */}
      </Grid>
    </AccountsLayout>
  );
}
