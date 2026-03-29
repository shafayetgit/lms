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
} from "@mui/material";
import { Facebook, Twitter, Instagram, YouTube, LinkedIn } from "@mui/icons-material";

const Footer = () => {
  const paymentLogos = [
    "https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg", // Visa ✅
    "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg", // Mastercard ✅
    "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg", // PayPal ✅
    "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg", // Stripe ✅
  ];

  return (
    <Box
      component="footer"
      sx={{
        pt: 7,
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 4 }} />
        <Grid container spacing={4}>
          {/* Logo + About */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              E-Courses
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your gateway to quality online learning. Explore courses, upgrade
              your skills, and achieve your goals with us.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" color="inherit">
                <Facebook />
              </IconButton>
              <IconButton size="small" color="inherit">
                <Twitter />
              </IconButton>
              <IconButton size="small" color="inherit">
                <Instagram />
              </IconButton>
              <IconButton size="small" color="inherit">
                <YouTube />
              </IconButton>
              <IconButton size="small" color="inherit">
                <LinkedIn />
              </IconButton>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              <Link href="/" underline="hover" variant="body2">
                Home
              </Link>
              <Link href="/about" underline="hover" variant="body2">
                About
              </Link>
              <Link href="/courses" underline="hover" variant="body2">
                Courses
              </Link>
              <Link href="/contact" underline="hover" variant="body2">
                Contact
              </Link>
            </Stack>
          </Grid>

          {/* Support */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Support
            </Typography>
            <Stack spacing={1}>
              <Link href="/faq" underline="hover" variant="body2">
                FAQ
              </Link>
              <Link href="/privacy" underline="hover" variant="body2">
                Privacy Policy
              </Link>
              <Link href="/terms" underline="hover" variant="body2">
                Terms & Conditions
              </Link>
            </Stack>
          </Grid>

          {/* Payment Methods */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Payment Methods
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              alignItems="center"
            >
              {paymentLogos.map((logo, index) => (
                <Box
                  key={index}
                  component="img"
                  src={logo}
                  alt="Payment Method"
                  sx={{
                    height: 32,
                    objectFit: "contain",
                  }}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, }} />

        <Typography variant="body2" align="center" color="text.secondary" sx={{ pb: 3 }}>
          © {new Date().getFullYear()} E-Courses. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
