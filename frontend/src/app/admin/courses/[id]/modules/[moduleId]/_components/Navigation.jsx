"use client"
import Link from "next/link"
import { Button, Stack, Box, alpha, useTheme } from "@mui/material"
import { useParams, usePathname } from "next/navigation"
import { Contacts, Edit, Event, School, Work, Payments } from "@mui/icons-material"

export default function Navigation({ serviceType }) {
  const { id, moduleId } = useParams()
  const pathname = usePathname()
  const theme = useTheme()


  const navigators = [
    { label: "Update", href: `/admin/courses/${id}/modules/${moduleId}`, icon: <Edit /> },
    { label: "Lessons", href: `/admin/courses/${id}/modules/${moduleId}/lessons`, icon: <School /> },
  ]

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        mb: 4,
        pb: 1,
        // Hide scrollbar
        "&::-webkit-scrollbar": { display: "none" },
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          width: { xs: "max-content", sm: "100%" },
          p: 0.75,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(12px)",
          borderRadius: 3,
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.08),
          boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.04)}`,
        }}
      >
        {navigators.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/admin/doctors/${id}` && pathname?.startsWith(item.href))

          return (
            <Button
              key={index}
              component={Link}
              href={item.href}
              startIcon={item.icon}
              sx={{
                flexGrow: { xs: 0, sm: 1 },
                px: { xs: 2.5, sm: 3.5 },
                py: 1.25,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: isActive ? 700 : 500,
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                color: isActive ? "primary.main" : "text.secondary",
                bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                border: "1px solid",
                borderColor: isActive ? alpha(theme.palette.primary.main, 0.1) : "transparent",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                whiteSpace: "nowrap",
                "&:hover": {
                  bgcolor: isActive
                    ? alpha(theme.palette.primary.main, 0.12)
                    : alpha(theme.palette.action.hover, 0.05),
                  color: "primary.main",
                  transform: "translateY(-1px)",
                  boxShadow: isActive ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}` : "none",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
                "& .MuiButton-startIcon": {
                  mr: { xs: 0.75, sm: 1.25 },
                  transition: "transform 0.3s ease",
                },
                "&:hover .MuiButton-startIcon": {
                  transform: "scale(1.1)",
                },
              }}
            >
              {item.label}
            </Button>
          )
        })}
      </Stack>
    </Box>
  )
}
