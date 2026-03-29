"use client";

import { Box, Container, Typography, Card, CardMedia } from "@mui/material";
import CButton from "@/components/CButton";

const HeroBanner = () => {
  const page = {
    banner: "/images/vendor-banner3x1/2.jpg",
    description: "Master Your Future In Finance with Our Expert-Led Courses.",
  };

  return (
    <Container maxWidth="lg" sx={{ mb: 6 }}>
      <Card
        sx={{
          position: "relative",
          overflow: "hidden",
          boxShadow: "none",
          borderRadius: 3,
          bgcolor: "background.paper",
        }}
      >
        {/* Banner Image */}
        <Box sx={{ position: "relative", aspectRatio: "3 / 1" }}>
          <CardMedia
            component="img"
            src={page.banner}
            alt="Hero Banner"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          {/* Gradient Overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
            }}
          />

          {/* Content */}
          <Box
            sx={{
              position: "absolute",
              bottom: { xs: 5, md: 80 },
              left: { xs: 20, md: 40 },
              maxWidth: { xs: "90%", md: "60%" },
              color: "common.white",
            }}
          >
            <Typography
              variant="h3"
              fontWeight="bold"
              textTransform="uppercase"
              gutterBottom
              sx={{
                lineHeight: 1.2,
                textShadow: "2px 2px 6px rgba(0,0,0,0.7)",
              }}
            >
              {page.description}
            </Typography>

            <CButton label="Explore Courses"  size="large" color="warning" />
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

export default HeroBanner;
