'use client';
import { Stack, Box, Typography, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigation = () => {
  const theme = useTheme();
  const pathname = usePathname();
  const navItems = [
    { label: "Home", url: "/" },
    { label: "Courses", url: "/courses" },
    { label: "E-Books", url: "/ebooks" },
    { label: "About", url: "/about" },
    { label: "Contact", url: "/contact" },
  ];

  return (
    <Stack
      direction="row"
      justifyContent="center"
      component="nav"
      spacing={0.5}
      sx={{
        position: 'relative',
        p: 0.5,
        width: 'fit-content',
        mx: 'auto',
      }}
    >
      {navItems.map((item, index) => {
        const isActive = pathname === item.url;
        return (
          <Box
            key={index}
            component={Link}
            href={item.url}
            sx={{
              position: 'relative',
              px: 3,
              py: 1,
              borderRadius: '50px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              bgcolor: isActive
                ? alpha(theme.palette.secondary.main, 0.08)
                : 'transparent',
              border: "1px solid",
              borderColor: isActive
                ? alpha(theme.palette.secondary.main, 0.1)
                : "transparent",
              "&:hover": {
                bgcolor: alpha(theme.palette.secondary.main, 0.05),
                "& .nav-text": {
                  color: 'secondary.main'
                }
              },
            }}
          >
            <Typography
              className="nav-text"
              component="span"
              variant="body2"
              sx={{
                fontWeight: isActive ? 900 : 700,
                fontSize: '0.9rem',
                color: isActive ? 'secondary.main' : 'primary.main',
                transition: 'all 0.3s ease',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {item.label}
              {isActive && (
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: 'secondary.main',
                    boxShadow: (theme) => `0 0 10px 2px ${alpha(theme.palette.secondary.main, 0.3)}`,
                  }}
                />
              )}
            </Typography>
          </Box>
        );
      })}
    </Stack>

  );
};

export default Navigation;
