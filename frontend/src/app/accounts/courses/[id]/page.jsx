"use client";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Box,
  Chip,
  useTheme,
} from "@mui/material";
import { ExpandMore, PlayCircleFilledWhite, Lock } from "@mui/icons-material";
import { useState } from "react";
import AccountsLayout from "../../AccountsLayout";

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
  language: "English",
  description:
    "Master financial analysis, valuation, and modeling techniques used by investment bankers and equity research analysts.",
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
  ],
  instructorInfo: {
    name: "Michael Chen",
    title: "Former Senior Analyst at Global Bank Inc.",
    image: "https://placehold.co/150x150/87CEEB/000000?text=MC",
  },
};

export default function EnrolledCourseDetail() {
  const [selectedVideo, setSelectedVideo] = useState(
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  );

  const handleLessonSelection = (lesson) => {
    if (lesson.preview) {
      setSelectedVideo("http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4");
    }
  };
  const theme = useTheme();

  return (
    <AccountsLayout pageTitle="Course Details">
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: 2,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <Grid container>
          {/* Video Player Section */}

          <Grid size={{ xs: 12, md: 12 }}>
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
              <source src={selectedVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </Box>
          </Grid>

          {/* Course Curriculum Section */}
          <Grid size={{ xs: 12, md: 12 }}>
            <Box sx={{ padding: 3 }}>
              <Typography variant="h3" gutterBottom>
                Advanced Financial Analysis & Investment Banking
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {courseData.lectures} lectures • {courseData.duration} •{" "}
                {courseData.level} level
              </Typography>

              {courseData.curriculum.map((section, sectionIndex) => (
                <Accordion
                  key={sectionIndex}
                  sx={{
                    marginBottom: 2,
                    borderRadius: 1,
                    "&:before": { display: "none" },
                  }}
                  elevation={1}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {section.section}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {section.lectures} lectures • {section.duration}
                        </Typography>
                      </Box>
                      {/* <Chip
                        label={`${section.lectures} lessons`}
                        size="small"
                        variant="outlined"
                      /> */}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ padding: 0 }}>
                    <List disablePadding>
                      {section.content.map((lesson, lessonIndex) => (
                        <ListItem
                          key={lessonIndex}
                          // button={lesson.preview}
                          disabled={!lesson.preview}
                          onClick={() => handleLessonSelection(lesson)}
                          sx={{
                            borderBottom:
                              lessonIndex < section.content.length - 1 ? 1 : 0,
                            borderColor: "divider",
                            padding: 2,
                            "&:hover": {
                              backgroundColor: lesson.preview
                                ? "action.hover"
                                : "transparent",
                            },
                            "&.Mui-disabled": {
                              opacity: 0.6,
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                backgroundColor: lesson.preview
                                  ? "primary.main"
                                  : "grey.400",
                                width: 40,
                                height: 40,
                              }}
                            >
                              {lesson.preview ? (
                                <PlayCircleFilledWhite fontSize="small" />
                              ) : (
                                <Lock fontSize="small" />
                              )}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography variant="body1" fontWeight={500}>
                                  {lesson.title}
                                </Typography>
                                {lesson.preview && (
                                  <Chip
                                    label="Preview"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            }
                            secondary={`Duration: ${lesson.duration}`}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {lesson.duration}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Card>
    </AccountsLayout>
  );
}
