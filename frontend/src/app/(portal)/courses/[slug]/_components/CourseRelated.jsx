import React from "react"
import { Box, Typography, Grid } from "@mui/material"
import PortalCourseCard from "@/components/course/PortalCourseCard"

export default function CourseRelated({ validRelated }) {
  if (!validRelated || validRelated.length === 0) return null

  return (
    <Box sx={{ mt: 4, mb: 3 }}>
      <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 1.5 }}>
        Related Courses
      </Typography>
      <Grid container spacing={3}>
        {validRelated.map(relatedCourse => (
          <Grid key={relatedCourse.public_id} size={{ xs: 12, sm: 6, md: 4 }}>
            <PortalCourseCard course={relatedCourse} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
