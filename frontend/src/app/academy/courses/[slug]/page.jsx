"use client"

import React, { useState, useMemo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Box,
  Grid,
  Typography,
  Card,
  Divider,
  Stack,
  Rating,
  CircularProgress,
  Button,
} from "@mui/material"
import { MenuBook, FolderOpen } from "@mui/icons-material"
import Link from "next/link"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import RatingSection from "@/components/course/RatingSection"
import { renderMarkdownOrHTML } from "@/utils/markdown"
import { getGradient } from "@/utils/shared"

// API Imports
import { useReadCourseQuery } from "@/features/course/courseAPI"
import { useReadChaptersByCourseQuery } from "@/features/chapter/chapterAPI"
import { useReadMyEnrollmentsQuery } from "@/features/enrollment/enrollmentAPI"
import { useReadMyProgressQuery } from "@/features/courseProgress/courseProgressAPI"
import { useLazyReadLessonsByChapterQuery } from "@/features/lesson/lessonAPI"
import {
  useRequestCertificateMutation,
  useReadCertificateRequestsQuery,
  useReadCertificatesQuery,
} from "@/features/certificate/certificateApi"
import { toast } from "react-toastify"

// Sub-components
import PortalCourseCard from "@/components/course/PortalCourseCard"
import PortalChapterAccordion from "@/components/course/CurriculumAccordion"
import CoursePreviewVideo from "@/components/course/CoursePreviewVideo"
import CourseProgressBlock from "@/components/course/CourseProgressBlock"
import CourseActionCard from "@/components/course/CourseActionCard"
import InstructorSection from "@/components/course/InstructorSection"

export default function StudentCoursePlayerPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [triggerReadLessons] = useLazyReadLessonsByChapterQuery()

  // Fetch Course details
  const {
    data: courseResponse,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = useReadCourseQuery({ id: slug }, { skip: !slug })
  const course = courseResponse?.data

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
  const { data: myProgressResponse } = useReadMyProgressQuery()

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

  // Fetch student's certificate requests
  const { data: requestsResponse, refetch: refetchRequests } = useReadCertificateRequestsQuery(
    { size: 100 },
    { skip: !isEnrolled }
  )

  // Fetch student's certificates for this course
  const { data: certsResponse, refetch: refetchCerts } = useReadCertificatesQuery(
    { course_id: course?.id },
    { skip: !course?.id || !isEnrolled }
  )
  const certificates = certsResponse?.data || []
  const courseCertificate = certificates[0]

  const [requestCertificate, { isLoading: isRequesting }] = useRequestCertificateMutation()

  const courseRequest = useMemo(() => {
    if (!course) return null
    const certificateRequests = requestsResponse?.data || []
    return certificateRequests.find(r => r.course?.public_id === course.public_id)
  }, [requestsResponse, course])

  const handleRequestCertificate = async () => {
    try {
      await requestCertificate({ course_public_id: course.public_id }).unwrap()
      toast.success("Certificate request submitted successfully!")
      if (refetchRequests) refetchRequests()
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit certificate request.")
    }
  }

  // Find first incomplete lesson or default to first lesson
  const handleStartLearning = async () => {
    if (flatLessonsList.length > 0) {
      const firstIncomplete = flatLessonsList.find(l => !completedLessons[l.id])
      const targetLesson = firstIncomplete || flatLessonsList[0]
      router.push(`/academy/courses/${slug}/lessons/${targetLesson.public_id}`)
      return
    }

    if (sortedChapters.length > 0) {
      try {
        const firstChapter = sortedChapters[0]
        const res = await triggerReadLessons({ chapterId: firstChapter.public_id }).unwrap()
        const lessons = res?.data || []
        if (lessons.length > 0) {
          const sorted = [...lessons].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
          router.push(`/academy/courses/${slug}/lessons/${sorted[0].public_id}`)
        } else {
          toast.info("No lessons are available in this course yet.")
        }
      } catch (err) {
        console.error("Failed to load fallback first lesson", err)
        toast.error("Failed to start learning. Please try again.")
      }
    } else {
      toast.info("No content is available in this course yet.")
    }
  }

  const validRelated = useMemo(() => {
    return (course?.related_courses || []).map(rc => rc.related_course).filter(Boolean)
  }, [course])

  // Select lesson helper
  const handleSelectLesson = lesson => {
    router.push(`/academy/courses/${slug}/lessons/${lesson.public_id}`)
  }

  // Set Breadcrumbs using project helper hook
  useSetBreadcrumb(course?.title || "Course Details", `/academy/courses/${slug}`)

  if (isCourseLoading || isEnrollmentsLoading) return <CPageLoader />
  if (isCourseError || !course) return <CError message="Course not found" />

  if (!isEnrolled) {
    return (
      <Box sx={{ py: 8, px: 3, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary" fontWeight={700}>
          You are not enrolled in this course
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          Please go to the course details page to purchase or enroll.
        </Typography>
        <Button variant="contained" component={Link} href={`/courses/${slug}`}>
          View Course Details
        </Button>
      </Box>
    )
  }

  return (
    <CModuleLayout>
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        {/* Left Column - Course Content */}
        <Grid size={{ xs: 4, sm: 8, md: 8 }}>
          {/* Course Preview Video */}
          {course.video ? (
            <CoursePreviewVideo course={course} />
          ) : (
            <Box
              sx={{
                display: { xs: "block", md: "none" },
                height: 200,
                borderRadius: 1,
                mb: 2.5,
                backgroundImage: course.thumbnail
                  ? `url('${course.thumbnail}')`
                  : getGradient(course.card_gradient),
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.35rem", sm: "1.65rem", md: "1.85rem" },
              letterSpacing: "-0.02em",
              color: "text.primary",
              lineHeight: 1.2,
              mb: 1.5,
            }}
          >
            {course.title}
          </Typography>

          {/* Rating */}
          <Stack
            direction="row"
            spacing={{ xs: 1.5, sm: 2, md: 4 }}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ mb: 2 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Rating
                value={Number(course.avg_rating || 0)}
                readOnly
                size="small"
                precision={0.1}
              />
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                {Number(course.avg_rating || 0).toFixed(1)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                ({course.total_reviews || 0} reviews)
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <MenuBook sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                }}
              >
                {course.total_lessons || 0} Lessons
              </Typography>
            </Stack>

            {course.category && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <FolderOpen sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  }}
                >
                  {course.category.name}
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* Mobile-Only Checkout Action Block (Hidden on Desktop) */}
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 3 }}>
            <CourseProgressBlock
              courseProgressPercent={courseProgressPercent}
              flatLessonsList={flatLessonsList}
              completedLessons={completedLessons}
              handleStartLearning={handleStartLearning}
              enableCertification={course?.enable_certification}
              courseRequest={courseRequest}
              courseCertificate={courseCertificate}
              handleRequestCertificate={handleRequestCertificate}
              isRequesting={isRequesting}
            />
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Overview Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}>
              Overview
            </Typography>
            {course.overview ? (
              <Box
                dangerouslySetInnerHTML={{ __html: renderMarkdownOrHTML(course.overview) }}
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.8,
                  fontSize: "1rem",
                  textAlign: "justify",
                  "& p": { my: 1.5 },
                  "& ul, & ol": { pl: 3, my: 1.5 },
                  "& li": { mb: 0.5 },
                  "& h1, & h2, & h3": { color: "text.primary", mt: 2, mb: 1, fontWeight: 700 },
                }}
              />
            ) : (
              <Typography
                variant="body1"
                color="text.secondary"
                lineHeight={1.8}
                textAlign="justify"
              >
                {course.short_introduction || "No description available."}
              </Typography>
            )}
          </Box>

          {/* Curriculum Section */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: 1, mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}>
              Curriculum
            </Typography>

            {isChaptersLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress />
              </Box>
            ) : sortedChapters.length === 0 ? (
              <Typography color="text.secondary">
                No curriculum available for this course yet.
              </Typography>
            ) : (
              sortedChapters.map((chapter, index) => (
                <PortalChapterAccordion
                  key={chapter.id}
                  chapter={chapter}
                  index={index}
                  isEnrolled={isEnrolled}
                  slug={slug}
                  activeLessonId={undefined}
                  onSelectLesson={handleSelectLesson}
                  completedLessons={completedLessons}
                  onLessonLoaded={handleLessonLoaded}
                />
              ))
            )}
          </Card>

          {/* Instructor Section (Mobile only) */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <InstructorSection course={course} />
          </Box>

          {/* Reviews Section */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: 1, mb: 3 }}>
            <RatingSection course={course} isEnrolled={isEnrolled} />
          </Card>
        </Grid>

        {/* Right Column - Course Action Card & Instructor */}
        <Grid size={{ xs: 4, sm: 8, md: 4 }} sx={{ display: { xs: "none", md: "block" } }}>
          <Box
            sx={{
              position: "sticky",
              top: 68,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CourseActionCard
              course={course}
              isEnrolled={isEnrolled}
              courseProgressPercent={courseProgressPercent}
              flatLessonsList={flatLessonsList}
              completedLessons={completedLessons}
              handleStartLearning={handleStartLearning}
              enableCertification={course?.enable_certification}
              courseRequest={courseRequest}
              courseCertificate={courseCertificate}
              handleRequestCertificate={handleRequestCertificate}
              isRequesting={isRequesting}
            />

            {/* Instructor Section (Desktop only) */}
            <InstructorSection course={course} />
          </Box>
        </Grid>
      </Grid>

      {/* Related Courses Section */}
      {validRelated.length > 0 && (
        <Box sx={{ mt: 4, mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1.5 }}>
            Related Courses
          </Typography>
          <Grid container spacing={3}>
            {validRelated.map(relatedCourse => {
              return (
                <Grid key={relatedCourse.public_id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <PortalCourseCard course={relatedCourse} />
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}
    </CModuleLayout>
  )
}
