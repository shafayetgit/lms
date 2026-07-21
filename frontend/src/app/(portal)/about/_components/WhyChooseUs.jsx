"use client"
import React from "react"
import { Box, Typography, Grid, Card, CardContent, Icon } from "@mui/material"
import { motion } from "framer-motion"
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined"
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined"
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined"
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined"

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

const items = [
  {
    icon: PeopleOutlinedIcon,
    title: "Expert-Led Content",
    text: "Learn from seasoned professionals.",
  },
  {
    icon: SchoolOutlinedIcon,
    title: "Flexible Learning",
    text: "Access self-paced modules anytime.",
  },
  {
    icon: AssignmentTurnedInOutlinedIcon,
    title: "Diverse Catalog",
    text: "Courses in finance, tech, and more.",
  },
  {
    icon: EmojiEventsOutlinedIcon,
    title: "Certified & Recognized",
    text: "Earn credentials employers trust.",
  },
]

const WhyChooseUs = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={itemVariants}
    >
      <Box sx={{ my: { xs: 6, md: 8 }, pb: 7 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 800, color: "text.primary" }}
        >
          Why Choose Us?
        </Typography>

        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: 4 }}>
          {items.map((item, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Card
                sx={{
                  height: "100%",
                  p: 3,
                  textAlign: "center",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                }}
              >
                <Icon
                  component={item.icon}
                  sx={{
                    fontSize: 50,
                    color: "text.primary",
                    mb: 2,
                  }}
                />
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.text}
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

export default WhyChooseUs
