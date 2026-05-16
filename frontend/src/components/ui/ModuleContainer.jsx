"use client";
import { Box, Breadcrumbs, Typography, alpha } from "@mui/material"
import Link from "next/link"

export default function ModuleContainer({ children, breadcrumbs, action }) {
  return (
    <Box sx={{ width: "100%" }}>
      {/* Header Section - Separate from content card */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 1, md: 2 },
        }}
      >
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            "& .MuiBreadcrumbs-separator": {
              color: "text.disabled",
              mx: 1.5,
            },
          }}
        >
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              href={crumb.path}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color:
                    index === breadcrumbs.length - 1
                      ? "secondary.main"
                      : "text.secondary",
                  "&:hover": {
                    color: "secondary.main",
                  },
                  transition: "color 0.2s ease",
                }}
              >
                {crumb.label}
              </Typography>
            </Link>
          ))}
        </Breadcrumbs>

        {action}
      </Box>

      {/* Content Section - The Floating Panel */}
      <Box
        sx={{
          bgcolor: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.common.black, 0.05),
          boxShadow: (theme) =>
            `0 10px 40px ${alpha(theme.palette.common.black, 0.02)}`,

        }}
      >
        {children}
      </Box>

    </Box>
  )
}

