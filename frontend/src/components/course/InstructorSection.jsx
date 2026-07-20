"use client"

import React from "react"
import { Card, Typography, Box, Avatar, Divider } from "@mui/material"

export default function InstructorSection({ course }) {
  const instructors = course.instructors || []

  return (
    <Card variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 2, color: "text.primary" }}>
        Instructor{instructors.length > 1 ? "s" : ""}
      </Typography>

      {instructors.length > 0 ? (
        instructors.map((inst, idx) => (
          <Box key={inst.public_id}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar src={inst.avatar} sx={{ width: 48, height: 48, bgcolor: "text.primary", color: "background.paper" }}>
                {`${inst.first_name?.[0] || ""}${inst.last_name?.[0] || ""}`.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" component="span" fontWeight="bold">
                  {`${inst.first_name || ""} ${inst.last_name || ""}`.trim()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Instructor
                </Typography>
              </Box>
            </Box>
            {idx < instructors.length - 1 && <Divider sx={{ my: 2 }} />}
          </Box>
        ))
      ) : (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src="https://randomuser.me/api/portraits/men/32.jpg" sx={{ width: 48, height: 48, bgcolor: "text.primary", color: "background.paper" }} />
          <Box>
            <Typography variant="subtitle1" component="span" fontWeight="bold">
              Instructor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Course Instructor
            </Typography>
          </Box>
        </Box>
      )}
    </Card>
  )
}
