"use client"
import React from "react"
import { Box, Typography } from "@mui/material"
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

const MissionSection = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={itemVariants}
    >
      <Box
        sx={{
          my: { xs: 6, md: 8 },
          p: { xs: 4, md: 6 },
          textAlign: "center",
          position: "relative",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            position: "absolute",
            top: -20,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "12rem",
            fontWeight: 900,
            opacity: 0.03,
            lineHeight: 1,
            color: "text.primary",
            userSelect: "none",
          }}
        >
          &ldquo;
        </Typography>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 900, color: "secondary.main", letterSpacing: "-0.02em", mb: 2 }}
        >
          Our Mission
        </Typography>
        <Typography
          variant="h5"
          sx={{
            maxWidth: 900,
            mx: "auto",
            lineHeight: 1.6,
            fontWeight: 500,
            color: "text.primary",
            position: "relative",
            zIndex: 1,
          }}
        >
          At <b>E-Courses</b>, our mission is to democratize high-quality, industry-relevant
          education and empower professionals to reach their full potential.
        </Typography>
      </Box>
    </motion.div>
  )
}

export default MissionSection
