"use client"
import React, { useState } from "react"
import Image from "next/image"
import { Container, Grid, Card, Box, Divider, useTheme, useMediaQuery } from "@mui/material"

import { useParams, useRouter } from "next/navigation"
import { useReadCourseQuery } from "@/features/course/courseAPI"
import { useReadChaptersByCourseQuery } from "@/features/chapter/chapterAPI"
import { useReadMyEnrollmentsQuery } from "@/features/enrollment/enrollmentAPI"
import { useReadMyProgressQuery } from "@/features/courseProgress/courseProgressAPI"
import { getCurrentUser } from "@/lib/auth/client"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import EnrollButton from "@/components/payment/EnrollButton"
import { toast } from "react-toastify"
import RatingSection from "@/components/course/RatingSection"
import PortalCourseCard from "@/components/course/PortalCourseCard"
import InstructorSection from "@/components/course/InstructorSection"
import ChapterAccordion from "@/components/course/CurriculumAccordion"
import CoursePreviewVideo from "@/components/course/CoursePreviewVideo"
import CourseActionCard from "@/components/course/CourseActionCard"
import CourseProgressBlock from "@/components/course/CourseProgressBlock"
import { getGradient } from "@/utils/shared"

import CourseOverview from "./_components/CourseOverview"
import CourseCurriculum from "./_components/CourseCurriculum"
import CourseRelated from "./_components/CourseRelated"
import CourseHeader from "./_components/CourseHeader"

// FAQs for the course

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
    answer: "You’ll get lifetime access, including all future updates and additional resources.",
  },
]

function CourseDetailPage() {
  const params = useParams()
  const slug = params?.slug
  const {
    data: responseData,
    isLoading,
    isError,
  } = useReadCourseQuery({ id: slug, is_portal: true }, { skip: !slug })

  const course = responseData?.data
  const related = course?.related_courses || []
  const validRelated = related.map(rc => rc.related_course).filter(Boolean)
  const { data: { data: chapters = [] } = {}, isLoading: isChaptersLoading } =
    useReadChaptersByCourseQuery(
      { courseId: course?.public_id, is_portal: true },
      { skip: !course?.public_id }
    )

  const sortedChapters = React.useMemo(
    () => [...chapters].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [chapters]
  )

  const router = useRouter()

  const [user, setUser] = useState(null)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setUser(getCurrentUser())
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const { data: enrollmentsResponse, isLoading: isEnrollmentsLoading } = useReadMyEnrollmentsQuery(
    { size: 100 },
    { skip: !course || !user, refetchOnMountOrArgChange: true }
  )

  const currentEnrollment = React.useMemo(() => {
    if (!course) return null
    const enrollments = enrollmentsResponse?.data || []
    return enrollments.find(
      e => e.course?.slug === course.slug && (e.status === "active" || e.status === "completed")
    )
  }, [enrollmentsResponse, course])

  const isEnrolled = !!currentEnrollment
  const enrollmentProgress = currentEnrollment ? Math.round(currentEnrollment.progress || 0) : 0

  const { data: myProgressResponse } = useReadMyProgressQuery(undefined, { skip: !isEnrolled })
  const completedLessons = React.useMemo(() => {
    const map = {}
    const myProgressList = myProgressResponse || []
    myProgressList.forEach(p => {
      if (p.is_completed && p.course_id === course?.id) {
        map[p.lesson_id] = true
      }
    })
    return map
  }, [myProgressResponse, course?.id])

  const [isFavorite, setIsFavorite] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  if (isLoading || isEnrollmentsLoading) return <CPageLoader />
  if (isError || !course) return <CError message="Course not found" />

  const isFree = !course.paid_course
  const currencySymbol =
    course.currency === "BDT" ? "৳" : course.currency === "USD" ? "$" : course.currency || "$"
  const priceDisplay = isFree
    ? "Free"
    : `${currencySymbol} ${Number(course.course_price || 0).toLocaleString()}`

  const handleAddToFavorites = () => {
    setIsFavorite(!isFavorite)
  }

  const handleShare = async () => {
    const shareData = {
      title: course.title,
      text: course.short_introduction || "",
      url: window.location.href,
    }
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err)
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard!")
      } catch (err) {
        console.error("Could not copy text:", err)
        toast.error("Failed to copy link")
      }
    }
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Left Column - Course Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Course Preview Video */}
          {course.video ? (
            <CoursePreviewVideo course={course} />
          ) : (
            <Box
              sx={{
                display: { xs: "block", md: "none" },
                height: 200,
                borderRadius: { xs: 0, md: 1 },
                mt: { xs: -4, md: 0 },
                mb: 2.5,
                mx: { xs: -1, sm: -2, md: 0 },
                position: "relative",
                overflow: "hidden",
                background: !course.thumbnail ? getGradient(course.card_gradient) : "transparent",
              }}
            >
              {course.thumbnail && (
                <Image
                  src={course.thumbnail}
                  alt={course.title || "Course thumbnail"}
                  fill
                  sizes="(max-width: 900px) 100vw, 66vw"
                  style={{ objectFit: "cover" }}
                  priority={true}
                  fetchPriority="high"
                />
              )}
            </Box>
          )}

          <CourseHeader course={course} />

          {/* Mobile-Only Checkout Action Block (Hidden on Desktop) */}
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 2, pt: 1 }}>
            {isEnrolled ? (
              <CourseProgressBlock
                courseProgressPercent={enrollmentProgress}
                completedLessons={completedLessons}
                totalLessons={course.total_lessons}
                handleStartLearning={() => router.push(`/academy/courses/${course.slug}`)}
              />
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 1.5,
                    mb: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{
                      color: "text.primary",
                      fontWeight: "800",
                      letterSpacing: "-0.02em",
                      fontSize: "2rem",
                    }}
                  >
                    {priceDisplay}
                  </Box>
                </Box>
                <EnrollButton
                  paymentForType="course"
                  paymentForPublicId={course.public_id}
                  paidItem={course.paid_course}
                  price={priceDisplay}
                  fullWidth
                  size="large"
                />
              </>
            )}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <CourseOverview course={course} />

          {/* Curriculum Section */}
          <CourseCurriculum
            isChaptersLoading={isChaptersLoading}
            sortedChapters={sortedChapters}
            isEnrolled={isEnrolled}
            slug={slug}
            completedLessons={completedLessons}
          />

          {/* Instructor Section (Mobile only) */}
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 3 }}>
            <InstructorSection course={course} />
          </Box>

          {/* Reviews Section */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: 1, mb: 3 }}>
            <RatingSection course={course} isEnrolled={isEnrolled} />
          </Card>

          {/* FAQ Section
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
          */}
        </Grid>

        {/* Right Column - Course Action Card & Instructor */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: "none", md: "block" } }}>
          <Box
            sx={{
              position: "sticky",
              top: 96,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CourseActionCard
              course={course}
              isEnrolled={isEnrolled}
              courseProgressPercent={enrollmentProgress}
              completedLessons={completedLessons}
              priceDisplay={priceDisplay}
              isFavorite={isFavorite}
              onAddToFavorites={handleAddToFavorites}
              onShare={handleShare}
              handleStartLearning={() => router.push(`/academy/courses/${course.slug}`)}
            />

            {/* Instructor Section (Desktop only) */}
            <InstructorSection course={course} />
          </Box>
        </Grid>
      </Grid>

      <CourseRelated validRelated={validRelated} />
    </Container>
  )
}

export default CourseDetailPage
