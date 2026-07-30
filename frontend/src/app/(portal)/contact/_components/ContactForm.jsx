"use client"
import React from "react"
import { Grid, Card, CardContent, Typography, useTheme } from "@mui/material"
import { motion } from "framer-motion"
import SendOutlinedIcon from "@mui/icons-material/SendOutlined"

import CTextField from "@/components/form/CTextField"
import CButton from "@/components/ui/CButton"

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

const ContactForm = () => {
  const theme = useTheme()

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={itemVariants}
    >
      <Card
        elevation={0}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 1,
          height: "100%",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.dark }}
          >
            Send a Message
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Fill out the form below and we&apos;ll get back to you as soon as possible.
          </Typography>

          <form noValidate autoComplete="off">
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CTextField
                  fullWidth
                  label="First Name"
                  variant="outlined"
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CTextField
                  fullWidth
                  label="Last Name"
                  variant="outlined"
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CTextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  type="email"
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CTextField
                  fullWidth
                  label="Subject"
                  variant="outlined"
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CTextField
                  fullWidth
                  label="Message"
                  variant="outlined"
                  multiline
                  rows={5}
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CButton
                  label="Send Message"
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  endIcon={<SendOutlinedIcon />}
                  sx={{
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 800,
                    borderRadius: 1,
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ContactForm
