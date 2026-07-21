"use client"

import React from "react"
import {
  Card,
  CardMedia,
  CardContent,
  Box,
  Stack,
  Typography,
  LinearProgress,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import {
  PlayCircleOutline,
  PeopleOutline,
  MenuBookOutlined,
  HelpOutline,
  AssignmentOutlined,
  WorkspacePremium,
  Favorite,
  FavoriteBorder,
  Share,
} from "@mui/icons-material"
import EnrollButton from "@/components/payment/EnrollButton"
import CButton from "@/components/ui/CButton"
import { getGradient } from "@/utils/shared"
import Link from "next/link"
import Image from "next/image"

export default function CourseActionCard({
  course,
  isEnrolled,
  courseProgressPercent = 0,
  flatLessonsList = [],
  completedLessons = {},
  priceDisplay = "",
  isFavorite = false,
  onAddToFavorites,
  onShare,
  handleStartLearning,
  enableCertification = false,
  courseRequest = null,
  courseCertificate = null,
  handleRequestCertificate,
  isRequesting = false,
}) {
  const completedCount =
    flatLessonsList.length > 0
      ? flatLessonsList.filter(l => completedLessons[l.id]).length
      : Object.keys(completedLessons).length
  const totalLessonsCount = flatLessonsList.length || course.total_lessons || 0
  const gradient = getGradient(course.card_gradient)

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 1,
        overflow: "hidden",
        border: theme => `1px solid ${theme.palette.divider}`,
        boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
      }}
    >
      <CardMedia
        component="div"
        sx={{
          height: 200,
          backgroundColor: "background.default",
          background: !course.thumbnail ? gradient : "transparent",
          position: "relative",
        }}
      >
        {course.thumbnail && (
          <Image
            src={course.thumbnail}
            alt={course.title || "Course thumbnail"}
            fill
            sizes="(max-width: 900px) 100vw, 33vw"
            style={{ objectFit: "cover" }}
            priority={false}
          />
        )}
      </CardMedia>

      <CardContent>
        {isEnrolled ? (
          /* Course Progress Section */
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight="700">
                Your Course Progress
              </Typography>
              <Typography variant="body2" fontWeight="700" color="primary.main">
                {courseProgressPercent}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={courseProgressPercent}
              aria-label="Course Progress"
              sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover" }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              {completedCount} of {totalLessonsCount} lessons completed
            </Typography>
          </Box>
        ) : (
          /* Price and Actions Section */
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography
              variant="h4"
              color="text.primary"
              fontWeight="800"
              sx={{ letterSpacing: "-0.02em" }}
            >
              {priceDisplay}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {/* {onAddToFavorites && (
                <Button
                  variant="contained"
                  startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
                  onClick={onAddToFavorites}
                  color={isFavorite ? "error" : "inherit"}
                  sx={{ textTransform: "none", minWidth: 0, px: 1.5, boxShadow: "none", "&:hover": { boxShadow: "none" } }}
                  size="small"
                >
                  {isFavorite ? "Saved" : "Save"}
                </Button>
              )} */}
              {onShare && (
                <Button
                  variant="contained"
                  startIcon={<Share />}
                  onClick={onShare}
                  color="inherit"
                  sx={{
                    textTransform: "none",
                    minWidth: 0,
                    px: 1.5,
                    boxShadow: "none",
                    "&:hover": { boxShadow: "none" },
                  }}
                  size="small"
                >
                  Share
                </Button>
              )}
            </Box>
          </Box>
        )}

        <Box sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          {isEnrolled ? (
            <>
              <CButton
                label={courseProgressPercent > 0 ? "Continue Learning" : "Start Learning"}
                variant={
                  courseProgressPercent === 100 && enableCertification ? "outlined" : "contained"
                }
                color="primary"
                fullWidth
                size="large"
                onClick={handleStartLearning}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1rem",
                  borderRadius: 1,
                  textTransform: "none",
                }}
              />

              {enableCertification && courseProgressPercent === 100 && (
                <>
                  {courseCertificate ? (
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      size="large"
                      component={Link}
                      href={`/academy/certificates/${courseCertificate.public_id}`}
                      sx={{
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: "1rem",
                        borderRadius: 1,
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": { boxShadow: "none" },
                      }}
                    >
                      View Certificate
                    </Button>
                  ) : courseRequest?.status === "Pending" ? (
                    <Button
                      variant="contained"
                      color="warning"
                      fullWidth
                      disabled
                      size="large"
                      sx={{
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: "1rem",
                        borderRadius: 1,
                        textTransform: "none",
                      }}
                    >
                      Request Pending
                    </Button>
                  ) : courseRequest?.status === "Approved" ? (
                    <Button
                      variant="contained"
                      color="info"
                      fullWidth
                      disabled
                      size="large"
                      sx={{
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: "1rem",
                        borderRadius: 1,
                        textTransform: "none",
                      }}
                    >
                      Evaluation Scheduled
                    </Button>
                  ) : (
                    <CButton
                      label="Request Certificate"
                      variant="contained"
                      color="secondary"
                      fullWidth
                      size="large"
                      loading={isRequesting}
                      onClick={handleRequestCertificate}
                      sx={{
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: "1rem",
                        borderRadius: 1,
                        textTransform: "none",
                      }}
                    />
                  )}
                </>
              )}
            </>
          ) : (
            <EnrollButton
              paymentForType="course"
              paymentForPublicId={course.public_id}
              paidItem={course.paid_course}
              price={priceDisplay}
              fullWidth
              size="large"
            />
          )}
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Course Includes */}
        <Box>
          <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
            This course includes
          </Typography>
          <List dense sx={{ py: 0 }}>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <PlayCircleOutline sx={{ fontSize: 20, color: "error.main" }} />
              </ListItemIcon>
              <ListItemText primary="On demand course video" />
            </ListItem>
            {(course.total_enrollments ?? 0) > 0 && (
              <ListItem disableGutters sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <PeopleOutline sx={{ fontSize: 20, color: "info.main" }} />
                </ListItemIcon>
                <ListItemText primary={`${course.total_enrollments} students enrolled`} />
              </ListItem>
            )}
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <MenuBookOutlined sx={{ fontSize: 20, color: "primary.main" }} />
              </ListItemIcon>
              <ListItemText primary={`${course.total_lessons || 0} lessons`} />
            </ListItem>
            {(course.total_quizzes ?? 0) > 0 && (
              <ListItem disableGutters sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <HelpOutline sx={{ fontSize: 20, color: "warning.main" }} />
                </ListItemIcon>
                <ListItemText primary={`${course.total_quizzes} quizzes`} />
              </ListItem>
            )}
            {(course.total_assignments ?? 0) > 0 && (
              <ListItem disableGutters sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <AssignmentOutlined sx={{ fontSize: 20, color: "success.main" }} />
                </ListItemIcon>
                <ListItemText primary={`${course.total_assignments} assignments`} />
              </ListItem>
            )}
            {course.enable_certification && (
              <ListItem disableGutters sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <WorkspacePremium sx={{ fontSize: 20, color: "secondary.main" }} />
                </ListItemIcon>
                <ListItemText primary="Certificate of completion" />
              </ListItem>
            )}
          </List>
        </Box>
      </CardContent>
    </Card>
  )
}
