"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Button,
  Tooltip,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { LockOutlined } from "@mui/icons-material"
import CModuleLayout from "@/components/ui/CModuleLayout"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"

// API Imports
import { useReadCourseQuery } from "@/features/course/courseAPI"
import { useReadChaptersByCourseQuery } from "@/features/chapter/chapterAPI"
import { useReadLessonQuery } from "@/features/lesson/lessonAPI"
import { useReadMyEnrollmentsQuery } from "@/features/enrollment/enrollmentAPI"
import { useReadSettingsQuery } from "@/features/settings/settingsApi"
import {
  useReadMyProgressQuery,
  useCompleteMyLessonMutation,
} from "@/features/courseProgress/courseProgressAPI"

import QuizPlayer from "./_parts/QuizPlayer"
import AssignmentPlayer from "./_parts/AssignmentPlayer"
import NotesTab from "./_parts/NotesTab"
import CommunityTab from "./_parts/CommunityTab"
import VideoPlayer from "./_parts/VideoPlayer"
import LessonHeader from "./_parts/LessonHeader"
import CourseSidebar from "./_parts/CourseSidebar"

// MAIN PAGE COMPONENT
export default function StudentCoursePlayerPage() {
  const { slug, lessonId } = useParams()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Fetch General LMS Settings
  const { data: settingsResponse } = useReadSettingsQuery()
  const settings = useMemo(() => settingsResponse || {}, [settingsResponse])

  // Fetch Course details
  const {
    data: courseResponse,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = useReadCourseQuery({ id: slug }, { skip: !slug })
  const course = courseResponse?.data

  // Fetch active lesson details
  const {
    data: lessonResponse,
    isLoading: isLessonLoading,
    isError: isLessonError,
  } = useReadLessonQuery({ id: lessonId }, { skip: !lessonId })
  const activeLesson = lessonResponse?.data

  // Fetch student enrollments
  const { data: enrollmentsResponse, isLoading: isEnrollmentsLoading } = useReadMyEnrollmentsQuery(
    { size: 100 },
    { refetchOnMountOrArgChange: true }
  )

  // Check enrollment
  const isEnrolled = useMemo(() => {
    if (!course) return false
    const enrollments = enrollmentsResponse?.data || []
    return enrollments.some(
      e =>
        e.course?.public_id === course.public_id &&
        (e.status === "active" || e.status === "completed")
    )
  }, [enrollmentsResponse, course])

  // Fetch chapters
  const { data: chaptersResponse, isLoading: isChaptersLoading } = useReadChaptersByCourseQuery(
    { courseId: course?.public_id },
    { skip: !course?.public_id }
  )

  const sortedChapters = useMemo(() => {
    const chapters = chaptersResponse?.data || []
    return [...chapters].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  }, [chaptersResponse])

  // Track loaded lessons to build next/prev flat navigation
  const [lessonsMap, setLessonsMap] = useState({})
  const handleLessonLoaded = useCallback((chapterId, lessonsList) => {
    setLessonsMap(prev => {
      if (prev[chapterId] && prev[chapterId].length === lessonsList.length) {
        return prev
      }
      return { ...prev, [chapterId]: lessonsList }
    })
  }, [])

  // Flat lessons list
  const flatLessonsList = useMemo(() => {
    const list = []
    sortedChapters.forEach(chapter => {
      const chapterLessons = lessonsMap[chapter.id] || []
      list.push(...chapterLessons)
    })
    return list
  }, [sortedChapters, lessonsMap])

  // Student progress details
  const { data: myProgressResponse, refetch: refetchProgress } = useReadMyProgressQuery()

  const completedLessons = useMemo(() => {
    const map = {}
    const myProgressList = myProgressResponse || []
    myProgressList.forEach(p => {
      if (p.is_completed && p.course_id === course?.id) {
        map[p.lesson_id] = true
      }
    })
    return map
  }, [myProgressResponse, course?.id])

  // Calculate course progress percentage
  const courseProgressPercent = useMemo(() => {
    if (flatLessonsList.length === 0) return 0
    const completedCount = flatLessonsList.filter(l => completedLessons[l.id]).length
    return Math.round((completedCount / flatLessonsList.length) * 100)
  }, [flatLessonsList, completedLessons])

  // State for notes & community tabs
  const [activePlayerTab, setActivePlayerTab] = useState("notes")
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [mobileDrawerTab, setMobileDrawerTab] = useState(null)
  const [isCinemaMode, setIsCinemaMode] = useState(false)
  const [videoStartTime, setVideoStartTime] = useState(0)
  const videoProgressRef = useRef(0)

  // Reset video progress time when lesson changes
  useEffect(() => {
    let active = true
    videoProgressRef.current = 0
    setTimeout(() => {
      if (active) setVideoStartTime(0)
    }, 0)
    return () => {
      active = false
    }
  }, [lessonId])

  // Load cinema mode preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lms_player_cinema_mode")
      if (saved === "true") {
        setTimeout(() => {
          setIsCinemaMode(true)
        }, 0)
      }
    }
  }, [])

  const handleToggleCinemaMode = () => {
    setVideoStartTime(videoProgressRef.current)
    setIsCinemaMode(prev => {
      const nextVal = !prev
      localStorage.setItem("lms_player_cinema_mode", nextVal ? "true" : "false")
      return nextVal
    })
  }

  // Mark lesson as complete mutation
  const [completeLesson, { isLoading: isCompleting }] = useCompleteMyLessonMutation()

  const handleMarkComplete = async () => {
    if (!activeLesson) return
    try {
      await completeLesson({ lessonId: activeLesson.id }).unwrap()
      refetchProgress()
    } catch (err) {
      console.error("Failed to mark lesson complete", err)
    }
  }

  // Select lesson helper
  const handleSelectLesson = lesson => {
    router.push(`/academy/courses/${slug}/lessons/${lesson.public_id}`)
  }

  // Calculate locked lessons based on sequential progression settings
  const lockedLessons = useMemo(() => {
    const lockedMap = {}
    let hasPendingEnforced = false

    for (const lesson of flatLessonsList) {
      if (hasPendingEnforced) {
        lockedMap[lesson.id] = true
      } else {
        lockedMap[lesson.id] = false
      }

      const isCompleted = !!completedLessons[lesson.id]
      if (!isCompleted) {
        const isEnforced =
          (lesson.lesson_type === "video" && (settings.enforce_video_completion ?? true)) ||
          (lesson.lesson_type === "quiz" && (settings.enforce_quiz_completion ?? true)) ||
          (lesson.lesson_type === "assignment" && (settings.enforce_assignment_completion ?? true))

        if (isEnforced) {
          hasPendingEnforced = true
        }
      }
    }
    return lockedMap
  }, [flatLessonsList, completedLessons, settings])

  // Next / Prev selection
  const activeIndex = useMemo(() => {
    if (!activeLesson) return -1
    return flatLessonsList.findIndex(l => l.public_id === activeLesson.public_id)
  }, [activeLesson, flatLessonsList])

  const prevLesson = activeIndex > 0 ? flatLessonsList[activeIndex - 1] : null
  const nextLesson =
    activeIndex < flatLessonsList.length - 1 ? flatLessonsList[activeIndex + 1] : null
  const nextLessonFiltered = nextLesson && !lockedLessons[nextLesson.id] ? nextLesson : null

  // Set Breadcrumbs using project helper hook
  useSetBreadcrumb(course?.title || "Course Player", `/academy/courses/${slug}`)

  if (isCourseLoading || isEnrollmentsLoading || isLessonLoading) return <CPageLoader />
  if (isCourseError || !course) return <CError message="Course not found" />
  if (isLessonError || !activeLesson) return <CError message="Lesson not found" />

  if (!isEnrolled) {
    return (
      <Box sx={{ py: 8, px: 3, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary" fontWeight={700}>
          You are not enrolled in this course
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          Please go to the course details page to purchase or enroll.
        </Typography>
        <Button variant="contained" onClick={() => router.push(`/courses/${slug}`)}>
          View Course Details
        </Button>
      </Box>
    )
  }

  const isCurrentLocked = !!activeLesson && !!lockedLessons[activeLesson.id]

  return (
    <CModuleLayout>
      {/* 1. Cinema Mode Top Video Player (Spans 100% of container width) */}
      {isCinemaMode && !isCurrentLocked && (
        <VideoPlayer
          activeLesson={activeLesson}
          isCinemaMode={true}
          settings={settings}
          onVideoEnded={handleMarkComplete}
          startTime={videoStartTime}
          onTimeUpdate={time => {
            videoProgressRef.current = time
          }}
        />
      )}

      {/* 1.5 Mobile Sticky Default Video Player (Spans 100% of container width on mobile) */}
      {isMobile && !isCinemaMode && !isCurrentLocked && activeLesson?.lesson_type === "video" && (
        <Box
          sx={{
            position: "sticky",
            top: { xs: 56, sm: 64 },
            zIndex: 1100,
            mx: { xs: -2, sm: -3 },
            mt: -2,
            mb: 2,
            bgcolor: "background.default",
          }}
        >
          <VideoPlayer
            activeLesson={activeLesson}
            isCinemaMode={false}
            settings={settings}
            onVideoEnded={handleMarkComplete}
            startTime={videoStartTime}
            onTimeUpdate={time => {
              videoProgressRef.current = time
            }}
          />
        </Box>
      )}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Left Side: Player Content Area */}
        <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
          {isCurrentLocked ? (
            <Box
              sx={{
                py: 8,
                px: 3,
                textAlign: "center",
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
              }}
            >
              <LockOutlined sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.primary" fontWeight={700} gutterBottom>
                Lesson Locked
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
              >
                Please complete the preceding lessons/activities in order to unlock this lesson.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  const firstPending = flatLessonsList.find(
                    l => !completedLessons[l.id] && !lockedLessons[l.id]
                  )
                  if (firstPending) {
                    handleSelectLesson(firstPending)
                  } else if (flatLessonsList.length > 0) {
                    handleSelectLesson(flatLessonsList[0])
                  }
                }}
                sx={{ borderRadius: 1 }}
              >
                Go to current lesson
              </Button>
            </Box>
          ) : (
            <Box>
              {/* 2. Default Mode Video Player (at the very top of Left Column, Desktop only) */}
              {!isMobile && !isCinemaMode && activeLesson?.lesson_type === "video" && (
                <VideoPlayer
                  activeLesson={activeLesson}
                  isCinemaMode={false}
                  settings={settings}
                  onVideoEnded={handleMarkComplete}
                  startTime={videoStartTime}
                  onTimeUpdate={time => {
                    videoProgressRef.current = time
                  }}
                />
              )}

              <Box sx={{ px: { xs: 0, md: 0 } }}>
                {/* 3. Lesson Title & Next/Prev Controls */}
                <LessonHeader
                  course={course}
                  activeLesson={activeLesson}
                  isCinemaMode={isCinemaMode}
                  handleToggleCinemaMode={handleToggleCinemaMode}
                  completedLessons={completedLessons}
                  handleMarkComplete={handleMarkComplete}
                  isCompleting={isCompleting}
                  prevLesson={prevLesson}
                  nextLesson={nextLessonFiltered}
                  handleSelectLesson={handleSelectLesson}
                  settings={settings}
                />

                {/* 4. Non-video players render below Title & Controls */}
                {activeLesson.lesson_type === "content" && (
                  <Card variant="outlined" sx={{ mb: 3, borderColor: "divider", borderRadius: 1 }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Typography variant="h6" fontWeight="700" gutterBottom>
                        Reading Material
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                        {activeLesson.content ||
                          activeLesson.description ||
                          "No reading material available."}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {activeLesson.lesson_type === "quiz" && (
                  <QuizPlayer quizId={activeLesson.quiz_id} onCompleted={handleMarkComplete} />
                )}

                {activeLesson.lesson_type === "assignment" && (
                  <AssignmentPlayer
                    assignmentId={activeLesson.assignment_id}
                    onCompleted={handleMarkComplete}
                  />
                )}

                {/* Tabs for Notes & Community */}
                <Box sx={{ mt: { xs: 1, md: 4 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      pb: 1,
                      mb: { xs: 0, md: 2 },
                    }}
                  >
                    <Button
                      variant="text"
                      onClick={() => {
                        setActivePlayerTab("notes")
                        if (typeof window !== "undefined" && window.innerWidth < 900) {
                          setMobileDrawerTab("notes")
                          setMobileDrawerOpen(true)
                        }
                      }}
                      size="small"
                      sx={{
                        textTransform: "none",
                        boxShadow: "none",
                        fontWeight: 600,
                        borderRadius: 1,
                        bgcolor: activePlayerTab === "notes" ? "action.selected" : "transparent",
                        color: "text.primary",
                        "&:hover": {
                          bgcolor: activePlayerTab === "notes" ? "action.selected" : "action.hover",
                          boxShadow: "none",
                        },
                      }}
                    >
                      Notes
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => {
                        setActivePlayerTab("community")
                        if (typeof window !== "undefined" && window.innerWidth < 900) {
                          setMobileDrawerTab("community")
                          setMobileDrawerOpen(true)
                        }
                      }}
                      size="small"
                      sx={{
                        textTransform: "none",
                        boxShadow: "none",
                        fontWeight: 600,
                        borderRadius: 1,
                        bgcolor:
                          activePlayerTab === "community" ? "action.selected" : "transparent",
                        color: "text.primary",
                        "&:hover": {
                          bgcolor:
                            activePlayerTab === "community" ? "action.selected" : "action.hover",
                          boxShadow: "none",
                        },
                      }}
                    >
                      Community
                    </Button>
                  </Box>

                  {/* Desktop-only Tab Contents */}
                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    {activePlayerTab === "notes" && (
                      <NotesTab activeLesson={activeLesson} isMobile={false} />
                    )}

                    {activePlayerTab === "community" && (
                      <CommunityTab course={course} activeLesson={activeLesson} isMobile={false} />
                    )}
                  </Box>

                  {/* Mobile Swipeable-style Bottom Drawer */}
                  <SwipeableDrawer
                    anchor="bottom"
                    open={mobileDrawerOpen}
                    onClose={() => setMobileDrawerOpen(false)}
                    onOpen={() => setMobileDrawerOpen(true)}
                    disableDiscovery={true}
                    sx={{
                      display: { xs: "block", md: "none" },
                      zIndex: 1300,
                    }}
                    PaperProps={{
                      sx: {
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        height: "60vh",
                        maxHeight: "60vh",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                      },
                    }}
                  >
                    {/* Drag handle indicator */}
                    <Box
                      sx={{
                        width: 36,
                        height: 4,
                        bgcolor: "divider",
                        borderRadius: 2,
                        mx: "auto",
                        mt: 1,
                        mb: 1,
                        flexShrink: 0,
                      }}
                    />

                    {/* Drawer scrollable content */}
                    <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1.5, py: 2 }}>
                      {mobileDrawerTab === "notes" && (
                        <NotesTab activeLesson={activeLesson} isMobile={true} />
                      )}

                      {mobileDrawerTab === "community" && (
                        <CommunityTab course={course} activeLesson={activeLesson} isMobile={true} />
                      )}
                    </Box>
                  </SwipeableDrawer>
                </Box>
              </Box>
            </Box>
          )}
        </Grid>

        {/* Right Side: Curriculum & Progress */}
        <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
          <CourseSidebar
            course={course}
            courseProgressPercent={courseProgressPercent}
            sortedChapters={sortedChapters}
            activeLesson={activeLesson}
            handleSelectLesson={handleSelectLesson}
            completedLessons={completedLessons}
            lockedLessons={lockedLessons}
            handleLessonLoaded={handleLessonLoaded}
          />
        </Grid>
      </Grid>
    </CModuleLayout>
  )
}
