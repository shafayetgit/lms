"use client"
import React from "react"
import { Box, Typography, Grid, Card, CardContent, Avatar } from "@mui/material"
import { motion } from "framer-motion"

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

const teamMembers = [
  {
    name: "Dr. Anya Sharma",
    title: "Founder & CEO",
    bio: "Visionary leader with 20+ years in financial technology and digital learning.",
    avatar: "/images/team/anya_sharma.png",
  },
  {
    name: "Michael Chen",
    title: "Head of Curriculum (Banking)",
    bio: "Former Senior Analyst at Global Bank Inc., shaping practical banking courses.",
    avatar: "/images/team/michael_chen.png",
  },
  {
    name: "Sarah O'Connell",
    title: "Lead Learning Designer",
    bio: "Expert in adult learning theory, ensuring engaging and accessible course design.",
    avatar: "/images/team/sarah_oconnell.png",
  },
  {
    name: "David Lee",
    title: "Director of Technology",
    bio: "Architect of scalable cloud solutions for a smooth, reliable learning platform.",
    avatar: "/images/team/david_lee.png",
  },
]

const TeamSection = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={itemVariants}
    >
      <Box sx={{ my: { xs: 6, md: 8 } }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{ fontWeight: 800, color: "text.primary", textAlign: "center" }}
        >
          Meet Our Teachers
        </Typography>

        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: 4 }}>
          {teamMembers.map((member, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx} sx={{ display: "flex" }}>
              <Card
                sx={{
                  flex: 1,
                  textAlign: "center",
                  p: 4,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                }}
              >
                <Avatar
                  src={member.avatar}
                  alt={member.name}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    mx: "auto",
                    border: "4px solid",
                    borderColor: "divider",
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {member.name}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {member.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.bio}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </motion.div>
  )
}

export default TeamSection
