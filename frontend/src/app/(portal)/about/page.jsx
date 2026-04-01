"use client";
import React from "react";
import { Container, Box } from "@mui/material";

// Components
import AboutHero from "./_components/AboutHero";
import MissionSection from "./_components/MissionSection";
import WhyChooseUs from "./_components/WhyChooseUs";
import TeamSection from "./_components/TeamSection";
import AboutCTA from "./_components/AboutCTA";

function AboutPage() {
  return (
    <Container maxWidth="lg">
      <AboutHero />
      <MissionSection />
      <WhyChooseUs />
      <TeamSection />
      <Box sx={{ mt: 10 }}>
        <AboutCTA />
      </Box>
    </Container>
  );
}

export default AboutPage;
