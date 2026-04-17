"use client";
import React from "react";
import { Box, Container, Grid } from "@mui/material";

// Components
import HeroBackground from "./HeroBanner/HeroBackground";
import HeroContent from "./HeroBanner/HeroContent";
import HeroVisuals from "./HeroBanner/HeroVisuals";

const HeroBanner = () => {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: { xs: 6, md: 15 },
        pb: { xs: 6, md: 15 },
        mb: { xs: 4, md: 8 },
      }}
    >
      <HeroBackground />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={{ xs: 6, md: 4 }} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <HeroContent />
          </Grid>

          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <HeroVisuals />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroBanner;
