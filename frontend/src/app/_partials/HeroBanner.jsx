import { Box, Container, Typography, Grid, Stack, Button, Divider, useMediaQuery } from "@mui/material";
import CButton from "@/components/CButton";
import { PlayCircleOutline, Verified } from "@mui/icons-material";

const HeroBanner = () => {

  return (
    <Container maxWidth="lg" sx={{ mb: 6 }}>

      <Grid container spacing={2} columns={12} alignItems="center">
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <Typography variant="h1">
              Master Your Future In Finance with Our Expert-Led Courses.
            </Typography>

            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Online learning and teaching marketplace with 5K+ courses & 10M
              students. Taught by experts to help you acquire new skills.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Verified />
                Learn with experts
              </Typography>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Verified />
                Get certificate
              </Typography>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Verified />
                Get membership
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <CButton
                label="Get Started"
                size="large"
                sx={{
                  fontSize: { xs: "0.875rem", lg: "1rem" },
                }}
              />
              <CButton
                label="Watch Video"
                variant="outlined"
                size="large"
                startIcon={<PlayCircleOutline />}
                sx={{
                  fontSize: { xs: "0.875rem", lg: "1rem" },
                }}
              />
            </Stack>
          </Stack>
        </Grid>

        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{ display: { xs: "none", md: "block" } }}
        >
          <Box
            component="img"
            src="/images/banners/hero-girl.png"
            alt="A smiling woman looking at a laptop"
            sx={{
              width: "100%",
              objectFit: "cover",
              borderRadius: 2,
            }}
          />
        </Grid>
      </Grid>

    </Container>
  );
};

export default HeroBanner;
