"use client"

import React, { Suspense } from "react"
import { Container, Box, Typography, Stack, alpha } from "@mui/material"
import { LockPerson, Dashboard } from "@mui/icons-material"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import CButton from "@/components/ui/CButton"

function ForbiddenContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const customMessage = searchParams.get("message")
  const displayMessage = customMessage || "The user doesn't have enough privileges"

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back()
    } else {
      router.push("/lms/dashboard")
    }
  }

  const handleGoDashboard = () => {
    router.push("/lms/dashboard")
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        px: 2,
        position: "relative",
        overflow: "hidden",
        bgcolor: "background.default",
        textAlign: "center",
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Box
            sx={{
              position: "relative",
              mb: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "7rem", sm: "10rem", md: "12rem" },
                lineHeight: 1,
                color: "error.main",
                opacity: 0.08,
                userSelect: "none",
                letterSpacing: "-0.05em",
              }}
            >
              403
            </Typography>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                component={motion.div}
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                sx={{
                  width: { xs: 90, sm: 110 },
                  height: { xs: 90, sm: 110 },
                  borderRadius: "50%",
                  bgcolor: theme => alpha(theme.palette.error.main, 0.1),
                  border: theme => `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: theme => `0 20px 40px ${alpha(theme.palette.error.main, 0.25)}`,
                  backdropFilter: "blur(8px)",
                }}
              >
                <LockPerson sx={{ fontSize: { xs: 46, sm: 56 }, color: "error.main" }} />
              </Box>
            </Box>
          </Box>

          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              color: "error.main",
              letterSpacing: 3,
              mb: 1,
              display: "block",
            }}
          >
            403 FORBIDDEN
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 2,
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
              color: "text.primary",
              letterSpacing: "-0.02em",
            }}
          >
            Access Restricted
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 5,
              fontWeight: 400,
              fontSize: { xs: "0.95rem", sm: "1.1rem" },
              lineHeight: 1.6,
              maxWidth: 480,
              mx: "auto",
            }}
          >
            {displayMessage}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "center" }}
          >
            <CButton label="Go Back" action="back" variant="outlined" onClick={handleGoBack} />
            <CButton
              label="Dashboard"
              icon={<Dashboard />}
              variant="contained"
              color="primary"
              onClick={handleGoDashboard}
            />
          </Stack>
        </motion.div>
      </Container>
    </Box>
  )
}

export default function ForbiddenPage() {
  return (
    <Suspense fallback={null}>
      <ForbiddenContent />
    </Suspense>
  )
}
