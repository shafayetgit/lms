"use client";
import CTextField from "@/components/ui/CTextField";
import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Tabs,
  Tab,
  Button,
  useTheme
} from "@mui/material";
import {
  ExpandMore,
  PlayCircleFilled,
  CheckCircle,
  Lock,
  Timer,
  Assignment,
  Download,
  Share,
  ArrowBack,
  ArrowForward,
  ArrowForwardIos,
  ChatBubbleOutline,
  Send,
  ThumbUpOutlined
} from "@mui/icons-material";
import StudentLayout from "@/app/student/StudentLayout";
import CButton from "@/components/ui/CButton";

const courseData = {
  id: 1,
  title: "Advanced Financial Analysis & Investment Banking",
  instructor: "Michael Chen",
  progress: 65,
  currentLesson: "Income Statement Deep Dive",
  curriculum: [
    {
      section: "Introduction to Investment Banking",
      duration: "2.5 hours",
      content: [
        { id: 'l1', title: "Course Overview", duration: "15:20", completed: true, locked: false },
        { id: 'l2', title: "The Role of Investment Banks", duration: "22:45", completed: true, locked: false },
        { id: 'l3', title: "Financial Markets Overview", duration: "18:30", completed: false, locked: false },
      ],
    },
    {
      section: "Financial Statement Analysis",
      duration: "4 hours",
      content: [
        { id: 'l4', title: "Income Statement Deep Dive", duration: "25:15", completed: false, locked: false },
        { id: 'l5', title: "Balance Sheet Analysis", duration: "28:40", completed: false, locked: true },
        { id: 'l6', title: "Cash Flow Statement Mastery", duration: "32:10", completed: false, locked: true },
      ],
    },
  ],
  discussions: [
    {
      id: 1,
      user: "Sarah Jenkins",
      avatar: "SJ",
      date: "2 days ago",
      text: "Really helpful explanation of the COGS mapping. Does this vary significantly between manufacturing and SaaS companies?",
      likes: 12,
      replies: [
        { id: 101, user: "Michael Chen", avatar: "MC", date: "1 day ago", text: "Excellent question, Sarah! Yes, manufacturing has heavy inventory components while SaaS is mostly server and support costs. We cover this in Section 4." }
      ]
    },
    {
      id: 2,
      user: "David Miller",
      avatar: "DM",
      date: "5 hours ago",
      text: "The spreadsheet template is a lifesaver for the case study. Thank you!",
      likes: 4,
      replies: []
    }
  ]
};

export default function EnrolledCourseDetail() {
  const [selectedVideo, setSelectedVideo] = useState(
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  );
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <StudentLayout pageTitle="Continuing Course">
      <Grid container spacing={4}>
        {/* Main Content Area: Video & Tabs */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* Video Player Container */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 6,
                overflow: "hidden",
                bgcolor: "black",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                aspectRatio: "16 / 9",
                position: 'relative'
              }}
            >
              <Box
                component="video"
                width="100%"
                height="100%"
                controls
                sx={{ display: "block" }}
              >
                <source src={selectedVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </Box>
            </Paper>

            {/* Course Content Header */}
            <Box sx={{ mb: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', pb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: 'secondary.main',
                    opacity: 0.8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {courseData.title}
                </Typography>
                <ArrowForwardIos sx={{ fontSize: 10, color: 'text.secondary', opacity: 0.4 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Section 2: Financial Analysis
                </Typography>
              </Stack>

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'flex-end' }}
                spacing={3}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    {courseData.currentLesson}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{
                    bgcolor: 'secondary.main' + '15',
                    color: 'secondary.main',
                    px: 2,
                    py: 0.75,
                    borderRadius: '50px',
                  }}
                >
                  <Timer sx={{ fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    25:15 Remaining
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Action Bar */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "rgba(0,0,0,0.06)",
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              <Stack direction="row" spacing={1}>
                <CButton label="Previous" variant="outlined" startIcon={<ArrowBack />} sx={{ borderRadius: '50px' }} />
                <CButton label="Next Lesson" variant="contained" color="secondary" endIcon={<ArrowForward />} sx={{ borderRadius: '50px' }} />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Resources">
                  <IconButton sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}><Assignment /></IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}><Download /></IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}><Share /></IconButton>
                </Tooltip>
              </Stack>
            </Paper>

            {/* Lesson Tabs Section */}
            <Box sx={{ width: '100%', mt: 4 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  textColor="secondary"
                  indicatorColor="secondary"
                  sx={{
                    '& .MuiTab-root': {
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      minWidth: 100,
                      textTransform: 'none'
                    }
                  }}
                >
                  <Tab label="Overview" />
                  <Tab label="Resources" />
                  <Tab label={`Discussion (${courseData.discussions.length})`} />
                </Tabs>
              </Box>

              <Box sx={{ py: 4 }}>
                {tabValue === 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>About this Lesson</Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 4 }}>
                      In this lesson, we dive deep into the Income Statement structure. You'll learn how to analyze revenue drivers, COGS, and operating expenses to calculate various profitability margins used in enterprise valuation.
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>What you'll learn:</Typography>
                    <List sx={{ '& .MuiListItem-root': { px: 0, py: 0.5 } }}>
                      <ListItem>• Identifying non-operating income and expenses</ListItem>
                      <ListItem>• Calculating EBITDA and EBIT margins across sectors</ListItem>
                      <ListItem>• Understanding the difference between Gross and Net profit</ListItem>
                    </List>
                  </Box>
                )}

                {tabValue === 1 && (
                  <Stack spacing={2}>
                    {[
                      { name: "Income Statement Template.xlsx", size: "2.4 MB" },
                      { name: "Lesson Notes (PDF).pdf", size: "1.1 MB" },
                      { name: "Industry Valuation Benchmarks.pdf", size: "3.8 MB" }
                    ].map((file, i) => (
                      <Paper
                        key={i}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' }
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: 'secondary.main' + '20', color: 'secondary.main' }}>
                            <Assignment fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{file.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{file.size}</Typography>
                          </Box>
                        </Stack>
                        <IconButton color="secondary"><Download /></IconButton>
                      </Paper>
                    ))}
                  </Stack>
                )}

                {tabValue === 2 && (
                  <Stack spacing={4}>
                    {/* New Comment Input */}
                    <Box sx={{ mb: 6 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 0,
                          borderRadius: 4,
                          border: '1.5px solid',
                          borderColor: 'divider',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                          '&:focus-within': {
                            borderColor: 'secondary.main',
                            boxShadow: '0 0 0 4px rgba(118, 184, 42, 0.1)'
                          }
                        }}
                      >
                        <CTextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Ask a question or share a thought..."
                          variant="standard"
                          InputProps={{
                            disableUnderline: true,
                            sx: { p: 2.5, fontSize: '0.95rem' }
                          }}
                        />
                        <Box sx={{
                          px: 2,
                          py: 1.5,
                          bgcolor: 'rgba(0,0,0,0.015)',
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center'
                        }}>
                          <Button
                            variant="contained"
                            color="secondary"
                            endIcon={<Send />}
                            sx={{
                              borderRadius: '50px',
                              px: 4,
                              py: 1,
                              textTransform: 'none',
                              fontWeight: 900,
                              boxShadow: '0 8px 20px rgba(118, 184, 42, 0.25)',
                              '&:hover': {
                                boxShadow: '0 12px 24px rgba(118, 184, 42, 0.35)'
                              }
                            }}
                          >
                            Post Comment
                          </Button>
                        </Box>
                      </Paper>
                    </Box>

                    {/* Comment Feed */}
                    <Stack spacing={3}>
                      {courseData.discussions.map((comment) => (
                        <Box key={comment.id}>
                          <Stack direction="row" spacing={2}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>{comment.avatar}</Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{comment.user}</Typography>
                                <Typography variant="caption" color="text.secondary">• {comment.date}</Typography>
                              </Stack>
                              <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.primary' }}>{comment.text}</Typography>
                              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <Button size="small" startIcon={<ThumbUpOutlined fontSize="small" />} sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.75rem' }}>{comment.likes}</Button>
                                <Button size="small" startIcon={<ChatBubbleOutline fontSize="small" />} sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.75rem' }}>Reply</Button>
                              </Stack>

                              {/* Replies */}
                              {comment.replies.length > 0 && (
                                <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                                  {comment.replies.map((reply) => (
                                    <Stack key={reply.id} direction="row" spacing={1.5} sx={{ mt: 2 }}>
                                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'secondary.main' }}>{reply.avatar}</Avatar>
                                      <Box>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                          <Typography variant="caption" sx={{ fontWeight: 800 }}>{reply.user}</Typography>
                                          <Chip label="Instructor" size="small" variant="outlined" sx={{ height: 16, fontSize: '0.5rem', fontWeight: 800, color: 'secondary.main', borderColor: 'secondary.main' }} />
                                          <Typography variant="caption" color="text.secondary">• {reply.date}</Typography>
                                        </Stack>
                                        <Typography variant="caption" component="p" sx={{ mt: 0.5, color: 'text.secondary', lineHeight: 1.5 }}>{reply.text}</Typography>
                                      </Box>
                                    </Stack>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                )}
              </Box>
            </Box>
          </Stack>
        </Grid>

        {/* Sidebar Area: Progress & Curriculum */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            {/* Progress Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 6,
                border: "1px solid",
                borderColor: "rgba(0,0,0,0.06)",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Your Progress</Typography>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="caption" color="text.secondary">{courseData.progress}% Complete</Typography>
                <Typography variant="caption" fontWeight={800} color="secondary.main">12/18 Lessons</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={courseData.progress}
                sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(0,0,0,0.05)', '& .MuiLinearProgress-bar': { borderRadius: 5 } }}
              />
            </Paper>

            {/* Curriculum List */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, px: 1 }}>Curriculum</Typography>
              {courseData.curriculum.map((section, idx) => (
                <Accordion
                  key={idx}
                  defaultExpanded={idx === 1}
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'rgba(0,0,0,0.05)',
                    mb: 1.5,
                    borderRadius: '16px !important',
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{section.section}</Typography>
                      <Typography variant="caption" color="text.secondary">{section.duration}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <List disablePadding>
                      {section.content.map((lesson) => (
                        <ListItem key={lesson.id} disablePadding>
                          <ListItemButton
                            disabled={lesson.locked}
                            selected={lesson.title === courseData.currentLesson}
                            sx={{
                              py: 1.5,
                              px: 2.5,
                              '&.Mui-selected': { bgcolor: 'secondary.main' + '10', borderLeft: '4px solid', borderColor: 'secondary.main' }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {lesson.completed ? (
                                <CheckCircle sx={{ color: 'secondary.main', fontSize: 20 }} />
                              ) : lesson.locked ? (
                                <Lock sx={{ color: 'text.secondary', fontSize: 20, opacity: 0.5 }} />
                              ) : (
                                <PlayCircleFilled sx={{ color: 'primary.main', fontSize: 20 }} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={lesson.title}
                              primaryTypographyProps={{
                                variant: 'body2',
                                fontWeight: lesson.title === courseData.currentLesson ? 800 : 500,
                                color: lesson.locked ? 'text.secondary' : 'text.primary'
                              }}
                              secondary={lesson.duration}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </StudentLayout>
  );
}
