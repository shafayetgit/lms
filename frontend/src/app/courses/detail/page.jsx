"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  Rating,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Dialog,
  DialogContent,
  Stack,
  CardHeader,
} from "@mui/material";
import {
  PlayCircleOutline,
  AccessTime,
  Person,
  Assignment,
  Star,
  ExpandMore,
  Home,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Share,
  ThumbUp,
  Chat,
  PlayCircleFilledWhite,
  MenuBook,
  CheckCircleOutline,
  TaskAlt,
  Email,
  LinkedIn,
  Twitter,
  Article,
  FileDownload,
} from "@mui/icons-material";
import RatingSection from "./_partials/RatingSection";

// Mock data for the course
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
        { title: "Balance Sheet Analysis", duration: "28:40", preview: false },
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

const faqs = [
  {
    question: "Do I need prior experience?",
    answer:
      "No prior coding experience is required. This course starts from the basics and gradually moves to advanced concepts.",
  },
  {
    question: "Will I get a certificate?",
    answer:
      "Yes! Upon completion, you’ll receive a certificate that you can share on LinkedIn or with employers.",
  },
  {
    question: "How long do I have access to the course?",
    answer:
      "You’ll get lifetime access, including all future updates and additional resources.",
  },
];

function CourseDetailPage() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleAddToFavorites = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        {/* Left Column - Course Content */}
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
            <DialogContent sx={{ p: 0 }}>
              <Box
                component="video"
                width="100%"
                height="auto"
                controls
                sx={{
                  display: "block",
                  borderRadius: 1,
                  backgroundColor: "black",
                }}
              >
                <source
                  src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  type="video/mp4"
                />
              </Box>
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
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ ml: 1 }}
                >
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
                <ListItem
                  key={index}
                  sx={{ alignItems: "flex-start", py: 0.5 }}
                >
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
                  and has guided 50,000+ students worldwide. His courses focus
                  on practical, project-based learning.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Reviews Section */}
          <RatingSection />

          {/* FAQ Section */}
          <Box sx={{ mb: 6 }}>
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
          </Box>
        </Grid>

        {/* Right Column - Course Action Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              position: "sticky",
              top: 115,
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            }}
          >
            {/* Thumbnail */}
            <CardMedia
              component="div"
              sx={{
                height: 200,
                backgroundColor: "#f5f5f5",
                backgroundImage: `url('https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            <CardContent>
              {/* Price Section */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="h4" color="primary" fontWeight="bold">
                  ${courseData.price}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  ${courseData.originalPrice}
                </Typography>
                <Chip
                  label="37% OFF"
                  color="success"
                  size="small"
                  sx={{ fontWeight: "bold" }}
                />
              </Box>

              {/* Action Buttons */}
              <Button
                variant="contained"
                fullWidth
                size="medium"
                startIcon={<ShoppingCart />}
                sx={{ mb: 1.5, borderRadius: 2, fontWeight: "bold" }}
              >
                Add to Cart
              </Button>

              <Button
                variant="outlined"
                fullWidth
                size="medium"
                sx={{ mb: 2, borderRadius: 2, fontWeight: "bold" }}
              >
                Buy Now
              </Button>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Button
                  startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
                  onClick={handleAddToFavorites}
                  color={isFavorite ? "error" : "inherit"}
                  sx={{ textTransform: "none" }}
                >
                  {isFavorite ? "Saved" : "Save"}
                </Button>
                <Button startIcon={<Share />} sx={{ textTransform: "none" }}>
                  Share
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Course Includes */}
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  This course includes
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PlayCircleOutline color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${courseData.duration} on-demand video`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Article color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="18 articles" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <FileDownload color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="25 downloadable resources" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <AccessTime color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Full lifetime access" />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default CourseDetailPage;
