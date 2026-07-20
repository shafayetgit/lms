"use client";
import React, { useState, useEffect } from "react";
import { Box, Container, Grid, Typography, alpha } from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";

// Components
import PortalCourseCard from "@/components/course/PortalCourseCard";
import CPageLoader from "@/components/ui/CPageLoader";
import CButton from "@/components/ui/CButton";

// Hooks / Auth
import { useReadCoursesQuery } from "@/features/course/courseAPI";
import { useReadMyEnrollmentsQuery } from "@/features/enrollment/enrollmentAPI";
import { getCurrentUser } from "@/lib/auth/client";

const UpcomingCourses = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(getCurrentUser());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const { data: { data: enrollments = [] } = {} } = useReadMyEnrollmentsQuery(
    { size: 100 },
    { skip: !user }
  );

  const enrollmentMap = React.useMemo(() => {
    const map = {};
    enrollments.forEach((e) => {
      if (e.course?.public_id) {
        map[e.course.public_id] = e;
      }
    });
    return map;
  }, [enrollments]);

  // Fetch only first 6 upcoming courses dynamically
  const { data: { data: courses = [] } = {}, isLoading } = useReadCoursesQuery({
    upcoming: true,
    size: 6,
    is_portal: true,
  });

  // If there are no upcoming courses, don't render the section at all
  if (!isLoading && courses.length === 0) return null;

  return (
    <Box sx={{ py: 12, borderTop: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.04)}` }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "flex-end" },
            gap: 4,
            mb: 8
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
              }}
            >
              Upcoming Courses
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600 }}
            >
              Get a sneak peek at our upcoming courses. Prepare yourself for the next cohort and explore new learning paths.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <CButton
              component={Link}
              href="/courses?status=upcoming"
              label="Explore Upcoming"
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 1,
                px: { xs: 3, md: 5 },
                py: 1.5,
                fontSize: "1rem",
                textTransform: "none",
                fontWeight: 700,
                borderColor: (theme) => alpha(theme.palette.text.primary, 0.15),
                color: "text.primary",
                "&:hover": {
                  borderColor: "text.primary",
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
                },
              }}
            />
          </motion.div>
        </Box>

        {isLoading ? (
          <CPageLoader fullPage={false} />
        ) : (
          /* Course Grid */
          <Grid
            container
            spacing={4}
            justifyContent="center"
          >
            {courses.map((course, index) => {
              const enrollment = enrollmentMap[course.public_id];
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
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default UpcomingCourses;
