"use client"
import React from "react"
import { Box, Typography, Chip, useTheme, useMediaQuery } from "@mui/material"
import { motion } from "framer-motion"

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
}

const ContactHero = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={itemVariants}
    >
      <Box
        sx={{
          py: { xs: 10, md: 16 },
          textAlign: "center",
          mb: 8,
        }}
      >
        {/* Top Pill */}
        <Chip
          label="📞 Contact us"
          color="secondary"
          variant="outlined"
          sx={{
            mb: 4,
            fontWeight: 800,
            borderRadius: 1,
            textTransform: "uppercase",
            fontSize: "0.75rem",
            letterSpacing: "1px",
            px: 1,
            borderColor: "secondary.main",
            height: "36px",
          }}
        />

        <Typography
          variant="h2"
          gutterBottom
          sx={{
            fontWeight: 900,
            mb: 1.5,
            letterSpacing: "-0.02em",
            fontSize: { xs: "2.2rem", md: "3.2rem" },
          }}
        >
          Get In Touch
        </Typography>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          color="text.secondary"
          sx={{ maxWidth: 800, mx: "auto", fontWeight: 400, lineHeight: 1.6 }}
        >
          Have questions about our courses or need assistance?
        </Typography>
      </Box>
    </motion.div>
  )
}

export default ContactHero
