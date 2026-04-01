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
import RatingSection from "./_components/RatingSection";

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
              borderRadius: 4,
              boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.04)",
              overflow: "hidden",
              transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
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
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
              letterSpacing: "-0.02em",
              color: "text.primary",
              lineHeight: 1.2,
              mb: { xs: 2, md: 3 }
            }}
          >
            {courseData.title}
          </Typography>

          {/* Rating */}
          <Stack
            direction="row"
            spacing={{ xs: 1.5, sm: 2, md: 4 }}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ mb: 4 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Rating value={courseData.rating} readOnly size="small" precision={0.1} />
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>{courseData.rating}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>({courseData.totalRatings.toLocaleString()} ratings)</Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <MenuBook sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                {courseData.lectures} Lessons
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTime sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                {courseData.duration}
              </Typography>
            </Stack>
          </Stack>

          {/* Mobile-Only Checkout Action Block (Hidden on Desktop) */}
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 4, pt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
              <Typography variant="h3" color="text.primary" fontWeight="800" sx={{ letterSpacing: "-0.02em", fontSize: "2rem" }}>
                ${courseData.price}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ textDecoration: "line-through", fontWeight: 600 }}>
                ${courseData.originalPrice}
              </Typography>
              <Chip label="37% OFF" size="small" sx={{ fontWeight: 800, bgcolor: "rgba(0,0,0,0.06)", color: "text.primary" }} />
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                color="secondary"
                startIcon={<ShoppingCart />}
                sx={{
                  py: 1.5,
                  borderRadius: "50px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "white",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  "&:hover": { bgcolor: "secondary.dark", transform: "scale(1.02)" },
                  transition: "all 0.2s ease"
                }}
              >
                Buy Now
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                sx={{
                  py: 1.5,
                  borderRadius: "50px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "text.primary",
                  borderColor: "rgba(0,0,0,0.15)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.03)", borderColor: "text.primary" }
                }}
              >
                Add to Cart
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Overview Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: "text.primary" }}>
              Overview
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
              {courseData.description}
              <br /><br />
              {courseData.description}
            </Typography>
          </Box>

          {/* Requirements Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: "text.primary" }}>
              Requirements
            </Typography>
            <List dense>
              {courseData.requirements.map((req, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleOutline sx={{ color: "text.primary", fontSize: "1.2rem" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={req}
                    primaryTypographyProps={{
                      color: "text.secondary",
                      variant: "body1",
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* What You Will Learn */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: "text.primary" }}>
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
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: "text.primary" }}>
              Curriculum
            </Typography>

            {courseData.curriculum.map((section, index) => (
              <Accordion
                key={index}
                defaultExpanded={index === 0}
                disableGutters
                elevation={0}
                sx={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: index === 0 ? "12px 12px 0 0" : index === courseData.curriculum.length - 1 ? "0 0 12px 12px" : 0,
                  "&:not(:last-child)": { borderBottom: 0 },
                  "&:before": { display: "none" },
                  overflow: "hidden",
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
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: "none", md: "block" } }}>
          <Card
            sx={{
              position: "sticky",
              top: 115,
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.04)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
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
                  alignItems: "baseline",
                  gap: 1.5,
                  mb: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="h3" color="text.primary" fontWeight="800" sx={{ letterSpacing: "-0.02em" }}>
                  ${courseData.price}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through", fontWeight: 600 }}
                >
                  ${courseData.originalPrice}
                </Typography>
                <Chip
                  label="37% OFF"
                  size="small"
                  sx={{ fontWeight: 800, bgcolor: "rgba(0,0,0,0.06)", color: "text.primary" }}
                />
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                color="secondary"
                startIcon={<ShoppingCart />}
                sx={{
                  mb: 1.5,
                  py: 1.8,
                  borderRadius: "50px",
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  color: "white",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.12)",
                  textTransform: "none",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    bgcolor: "secondary.dark",
                    boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                Buy Now
              </Button>

              <Button
                variant="outlined"
                fullWidth
                size="large"
                sx={{
                  mb: 2,
                  py: 1.8,
                  borderRadius: "50px",
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  color: "text.primary",
                  borderColor: "rgba(0,0,0,0.15)",
                  textTransform: "none",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    borderColor: "text.primary",
                    bgcolor: "rgba(0,0,0,0.03)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Add to Cart
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
