"use client"
import React, { useState, useEffect } from "react"
import { Box, Container, Grid, alpha } from "@mui/material"
import { motion } from "framer-motion"

// Components
import PortalCourseCard from "@/components/course/PortalCourseCard"
import FeaturedHeader from "./Featured/FeaturedHeader"
import CPageLoader from "@/components/ui/CPageLoader"

// Hooks / Auth
import { useReadCoursesQuery } from "@/features/course/courseAPI"
import { useReadMyEnrollmentsQuery } from "@/features/enrollment/enrollmentAPI"
import { getCurrentUser } from "@/lib/auth/client"

const FeaturedCourses = () => {
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

  // Fetch only first 3 published/featured courses dynamically
  const { data: { data: courses = [] } = {}, isLoading } = useReadCoursesQuery({
    published: true,
    featured: true,
    upcoming: false,
    size: 3,
    is_portal: true,
  })

  return (
    <Box
      sx={{ py: 12, borderTop: theme => `1px solid ${alpha(theme.palette.text.primary, 0.04)}` }}
    >
      <Container maxWidth="lg">
        <FeaturedHeader />

        {isLoading ? (
          <CPageLoader fullPage={false} />
        ) : (
          /* Course Grid */
          <Grid container spacing={4} justifyContent="center">
            {courses.map((course, index) => {
              const enrollment = enrollmentMap[course.public_id]
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.public_id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    style={{ height: "100%" }}
                  >
                    <PortalCourseCard
                      course={course}
                      enrolled={!!enrollment}
                      progress={enrollment ? Math.round(enrollment.progress || 0) : 0}
                    />
                  </motion.div>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Container>
    </Box>
  )
}

export default FeaturedCourses
