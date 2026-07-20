"use client";
import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Stack,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import { Facebook, Twitter, Instagram, YouTube, LinkedIn, Mail } from "@mui/icons-material";
import { motion } from "framer-motion";
import Image from "next/image";
import { LOGO, LOGO_HEIGHT, LOGO_WIDTH } from "@/lib/constants";
import { useReadSettingsQuery } from "@/features/settings/settingsApi";

const Footer = () => {
  const theme = useTheme();
  const { data: settingsData } = useReadSettingsQuery();
  const isDarkMode = theme.palette.mode === "dark";
  const dynamicLogo = isDarkMode
    ? settingsData?.site_logo_light || settingsData?.site_logo_dark
    : settingsData?.site_logo_dark || settingsData?.site_logo_light;

  const defaultLogo = isDarkMode
    ? "/images/logo/ecofin-light-logo.png"
    : "/images/logo/ecofin-dark-logo.png";

  const logoSrc = dynamicLogo
    ? (dynamicLogo.startsWith("http") ? dynamicLogo : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${dynamicLogo.replace(/^\//, "")}`)
    : defaultLogo;

  const paymentLogos = [
    { name: "Visa", url: "/images/payments/visa.jpg" },
    { name: "Mastercard", url: "/images/payments/mastercard.svg" },
    { name: "PayPal", url: "/images/payments/paypal.svg" },
    { name: "Stripe", url: "/images/payments/stripe.svg" },
  ];

  const socialIcons = [
    { name: "Facebook", icon: <Facebook fontSize="small" />, color: "#1877F2" },
    { name: "Twitter", icon: <Twitter fontSize="small" />, color: "#1DA1F2" },
    { name: "Instagram", icon: <Instagram fontSize="small" />, color: "#E4405F" },
    { name: "YouTube", icon: <YouTube fontSize="small" />, color: "#FF0000" },
    { name: "LinkedIn", icon: <LinkedIn fontSize="small" />, color: "#0A66C2" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        pt: 10,
        pb: 4,
        borderTop: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Logo + About */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Image
                  src={logoSrc}
                  width={160}
                  height={40}
                  alt="Logo"
                  style={{ objectFit: "contain" }}
                  priority={false}
                />
              </Box>
              <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: "320px" }}>
                Empowering the next generation of financial professionals through expert-led,
                high-conversion banking and finance education globally.
              </Typography>
              <Stack direction="row" spacing={1}>
                {socialIcons.map((social, idx) => (
                  <IconButton
                    key={idx}
                    aria-label={social.name}
                    component={motion.button}
                    whileHover={{ y: -4, color: social.color }}
                    size="small"
                    sx={{
                      bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
                      transition: "all 0.3s ease",
                      "&:hover": { bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06) }
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Explore */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, textTransform: "uppercase", letterSpacing: "1px", color: "text.primary" }}>
              Explore
            </Typography>
            <Stack spacing={1.5}>
              {[
                { name: "Home", path: "/" },
                { name: "Courses", path: "/courses" },
                { name: "E-Books", path: "/ebooks" },
                { name: "About Us", path: "/about" }
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  underline="none"
                  component={motion.a}
                  whileHover={{ x: 5 }}
                  sx={{
                    variant: "body2",
                    color: "text.secondary",
                    fontWeight: 500,
                    transition: "color 0.2s ease",
                    "&:hover": { color: "primary.main" }
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Support */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, textTransform: "uppercase", letterSpacing: "1px", color: "text.primary" }}>
              Resources
            </Typography>
            <Stack spacing={1.5}>
              {[
                { name: "FAQ", path: "/faq" },
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Service", path: "/terms" },
                { name: "Student Portal", path: "#" }
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  underline="none"
                  component={motion.a}
                  whileHover={{ x: 5 }}
                  sx={{
                    variant: "body2",
                    color: "text.secondary",
                    fontWeight: 500,
                    transition: "color 0.2s ease",
                    "&:hover": { color: "primary.main" }
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Newsletter / Contact */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, textTransform: "uppercase", letterSpacing: "1px", color: "text.primary" }}>
              Stay Updated
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Subscribe to get the latest in financial trends and exclusive course offers.
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
              <Box
                sx={{
                  flexGrow: 1,
                  height: 48,
                  borderRadius: "12px",
                  bgcolor: "background.paper",
                  border: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                  display: "flex",
                  alignItems: "center",
                  px: 2
                }}
              >
                <Mail sx={{ color: "text.secondary", fontSize: 20, mr: 1 }} />
                <input
                  placeholder="Your email address"
                  style={{
                    border: "none",
                    background: "none",
                    width: "100%",
                    fontSize: "0.85rem",
                    outline: "none",
                    fontWeight: 500
                  }}
                />
              </Box>
              <IconButton
                aria-label="Subscribe to newsletter"
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: "12px",
                  width: 48,
                  height: 48,
                  "&:hover": { bgcolor: "primary.dark", transform: "scale(1.05)" },
                  transition: "all 0.2s ease"
                }}
              >
                <Twitter fontSize="small" sx={{ transform: "rotate(90deg)" }} />
              </IconButton>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              {paymentLogos.map((payment, idx) => (
                <Box
                  key={idx}
                  sx={{
                    height: 20,
                    width: 40, // Estimated width for logos
                    position: 'relative',
                    filter: "grayscale(100%)",
                    opacity: 0.6,
                    transition: "all 0.3s ease",
                    "&:hover": { filter: "grayscale(0%)", opacity: 1, transform: "scale(1.1)" }
                  }}
                >
                  <Image
                    src={payment.url}
                    alt={payment.name}
                    width={40}
                    height={20}
                    style={{ objectFit: "contain" }}
                    priority={false}
                  />
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, borderColor: (theme) => alpha(theme.palette.divider, 0.1) }} />

        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
            © {new Date().getFullYear()} ecoFin Institute. Powered by Coderiven.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link href="#" sx={{ variant: "caption", color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } }}>
              Sitemap
            </Link>
            <Link href="#" sx={{ variant: "caption", color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } }}>
              Cookies
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
