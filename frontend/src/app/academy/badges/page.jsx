"use client"

import React from "react"
import { Box, Typography, Card, CardContent, Avatar } from "@mui/material"
import Grid from "@mui/material/Grid"
import { MilitaryTechOutlined } from "@mui/icons-material"
import { useReadBadgeAssignmentsQuery } from "@/features/badge/badgeApi"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"
import dayjs from "dayjs"

const STUDENT_BADGE_TIPS = {
  description:
    "Celebrate your learning milestones! Earn badges as you complete courses, score well on quizzes, and finish assignments.",
  tips: [
    {
      label: "What are Badges?",
      text: "Badges are digital credentials that recognize your achievements and completed skills in the academy.",
    },
    {
      label: "How to Earn Badges?",
      text: "Badges are awarded automatically when you meet specific conditions (like finishing a course), or manually by your instructors.",
    },
    {
      label: "Viewing Badges",
      text: "Click or hover over any badge card to see when it was awarded and read its description.",
    },
  ],
}

export default function MyBadgesPage() {
  useSetBreadcrumb("My Badges")

  const { data, isLoading, isError } = useReadBadgeAssignmentsQuery({ size: 100 })
  const assignments = data?.data ?? []

  if (isLoading) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  return (
    <CModuleLayout helpTips={STUDENT_BADGE_TIPS}>
      {assignments.length > 0 ? (
        <Grid container spacing={{ xs: 1.5, md: 2 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          {assignments.map(assignment => {
            const badge = assignment.badge || {}
            return (
              <Grid key={assignment.public_id} size={{ xs: 2, sm: 4, md: 3 }}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    p: 2,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
                  }}
                >
                  <Avatar
                    src={badge.image}
                    alt={badge.title || "Badge"}
                    sx={{
                      width: 60,
                      height: 60,
                      mb: 1.5,
                      bgcolor: "primary.light",
                      color: "primary.contrastText",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                    }}
                  >
                    <MilitaryTechOutlined sx={{ fontSize: 32 }} />
                  </Avatar>
                  <CardContent sx={{ p: 0, flexGrow: 1, width: "100%" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}
                    >
                      {badge.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        mb: 1.5,
                        minHeight: "2.8em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.4,
                      }}
                    >
                      {badge.description || "No description available."}
                    </Typography>
                    <Box
                      sx={{
                        pt: 1,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        width: "100%",
                      }}
                    >
                      <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600 }}>
                        Awarded on {dayjs(assignment.created_at).format("MMM DD, YYYY")}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", py: 10, bgcolor: "background.paper", borderRadius: 3 }}>
          <MilitaryTechOutlined sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            No badges earned yet
          </Typography>
          <Typography variant="body2" color="text.disabled" mt={1}>
            Keep learning and completing course assignments to unlock achievements!
          </Typography>
        </Box>
      )}
    </CModuleLayout>
  )
}
