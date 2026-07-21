"use client"

import React, { useState, useEffect } from "react"
import {
  Box,
  Container,
  Grid,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Skeleton,
  Stack,
} from "@mui/material"
import { SchoolOutlined, SearchOutlined, AutoAwesome } from "@mui/icons-material"
import { useReadCoursesQuery } from "@/features/course/courseAPI"
import { useReadMyEnrollmentsQuery } from "@/features/enrollment/enrollmentAPI"
import { getCurrentUser } from "@/lib/auth/client"

import PortalCourseCard from "@/components/course/PortalCourseCard"

/* ─── Skeleton Card ─── */
function CourseCardSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: 1,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Skeleton variant="rectangular" height={168} />
      <Box sx={{ p: 2.5 }}>
        <Skeleton width="40%" height={14} sx={{ mb: 0.5 }} />
        <Skeleton width="90%" height={18} sx={{ mb: 0.5 }} />
        <Skeleton width="70%" height={18} sx={{ mb: 1.5 }} />
        <Skeleton width="100%" height={12} sx={{ mb: 0.5 }} />
        <Skeleton width="80%" height={12} sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Skeleton variant="circular" width={26} height={26} />
          <Skeleton width={50} height={20} />
        </Box>
      </Box>
    </Box>
  )
}

/* ─── Page ─── */
export default function CoursesPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("published") // "published" | "upcoming" | "certification"
  const [category, setCategory] = useState("")

  const [user, setUser] = useState(null)
  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(getCurrentUser())
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const { data: { data: enrollments = [] } = {} } = useReadMyEnrollmentsQuery(
    { size: 100 },
    { skip: !user }
  )

  const enrollmentMap = React.useMemo(() => {
    const map = {}
    enrollments.forEach(e => {
      if (e.course?.public_id) {
        map[e.course.public_id] = e
      }
    })
    return map
  }, [enrollments])

  // Fetch courses: published courses for both 'published' and 'certification' states, unpublished for 'upcoming'
  const { data: { data: courses = [] } = {}, isLoading } = useReadCoursesQuery({
    published: status === "upcoming" ? false : true,
    size: 48,
    term: search || undefined,
    is_portal: true,
  })

  // Get unique categories connected to the courses currently loaded
  const activeCategories = React.useMemo(() => {
    const categoryMap = new Map()
    courses.forEach(course => {
      if (course.category?.public_id && course.category?.name) {
        categoryMap.set(course.category.public_id, course.category.name)
      }
    })
    return Array.from(categoryMap.entries()).map(([value, label]) => ({
      value,
      label,
    }))
  }, [courses])

  // Client-side filtering for category and certification
  const filteredCourses = courses.filter(course => {
    if (category && course.category?.public_id !== category) {
      return false
    }
    if (status === "certification" && !(course.enable_certification || course.paid_certificate)) {
      return false
    }
    return true
  })

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, minHeight: "100vh" }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: { xs: 5, md: 6 }, textAlign: "center" }}>
          <Chip
            icon={
              <AutoAwesome sx={{ fontSize: "0.85rem !important", color: "inherit !important" }} />
            }
            label="Expert-Led Courses"
            color="primary"
            variant="outlined"
            sx={{
              mb: 2,
              fontWeight: 800,
              borderRadius: 1,
              textTransform: "uppercase",
              fontSize: "0.7rem",
              letterSpacing: "1px",
              px: 1,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 1.5,
              letterSpacing: "-0.02em",
              fontSize: { xs: "2.2rem", md: "3.2rem" },
            }}
          >
            Explore Our Courses
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: "auto",
              fontWeight: 400,
              lineHeight: 1.6,
              fontSize: { xs: "1rem", md: "1.1rem" },
            }}
          >
            Discover expert-led courses designed to elevate your career and expand your knowledge.
          </Typography>
        </Box>

        {/* Filter Bar */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: 4,
          }}
        >
          {/* Search Input */}
          <TextField
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            sx={{
              width: { xs: "100%", sm: 240 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                bgcolor: "background.paper",
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ color: "text.disabled", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Filters (Status & Category Dropdowns) */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {/* Status Dropdown */}
            <TextField
              select
              value={status}
              onChange={e => setStatus(e.target.value)}
              size="small"
              sx={{
                flex: { xs: 1, sm: "none" },
                width: { sm: 160 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: "background.paper",
                },
              }}
              slotProps={{
                select: {
                  native: true,
                },
              }}
            >
              <option value="published">Published</option>
              <option value="upcoming">Upcoming</option>
              <option value="certification">Certification</option>
            </TextField>

            {/* Category Dropdown */}
            <TextField
              select
              value={category}
              onChange={e => setCategory(e.target.value)}
              size="small"
              sx={{
                flex: { xs: 1, sm: "none" },
                width: { sm: 180 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: "background.paper",
                },
              }}
              slotProps={{
                select: {
                  native: true,
                },
              }}
            >
              <option value="">Category</option>
              {activeCategories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </TextField>
          </Stack>
        </Stack>

        {/* Grid */}
        <Grid container spacing={{ xs: 3, md: 3 }}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                  <CourseCardSkeleton />
                </Grid>
              ))
            : filteredCourses.map(course => {
                const enrollment = enrollmentMap[course.public_id]
                return (
                  <Grid key={course.public_id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <PortalCourseCard
                      course={course}
                      enrolled={!!enrollment}
                      progress={enrollment ? Math.round(enrollment.progress || 0) : 0}
                    />
                  </Grid>
                )
              })}
        </Grid>

        {/* Empty state */}
        {!isLoading && filteredCourses.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <SchoolOutlined sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={600}>
              No courses found
            </Typography>
            <Typography variant="body2" color="text.disabled" mt={1}>
              Try a different search term or check back later.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  )
}
