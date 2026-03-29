"use client";
import React from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Avatar,
  Icon,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";

// Icons
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CButton from "@/components/CButton";

// Simplified animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const teamMembers = [
  {
    name: "Dr. Anya Sharma",
    title: "Founder & CEO",
    bio: "Visionary leader with 20+ years in financial technology and digital learning.",
    avatar: "https://placehold.co/150x150/FFD700/000000?text=AS",
  },
  {
    name: "Michael Chen",
    title: "Head of Curriculum (Banking)",
    bio: "Former Senior Analyst at Global Bank Inc., shaping practical banking courses.",
    avatar: "https://placehold.co/150x150/87CEEB/000000?text=MC",
  },
  {
    name: "Sarah O'Connell",
    title: "Lead Learning Designer",
    bio: "Expert in adult learning theory, ensuring engaging and accessible course design.",
    avatar: "https://placehold.co/150x150/90EE90/000000?text=SO",
  },
  {
    name: "David Lee",
    title: "Director of Technology",
    bio: "Architect of scalable cloud solutions for a smooth, reliable learning platform.",
    avatar: "https://placehold.co/150x150/FF6347/000000?text=DL",
  },
];

function AboutPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={itemVariants}
      >
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            textAlign: "center",
            color: theme.palette.primary.contrastText,
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.main} 90%)`,
            borderRadius: 4,
            boxShadow: theme.shadows[8],
          }}
        >
          <Typography variant="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Empowering Your Future in Finance
          </Typography>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{ maxWidth: 800, mx: "auto", opacity: 0.9 }}
          >
            Your trusted partner for specialized banking education and
            professional growth.
          </Typography>
        </Box>
      </motion.div>

      {/* Mission & Vision */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={itemVariants}
      >
        <Box sx={{ my: { xs: 6, md: 8 }, pb: 7, textAlign: "center" }}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{ fontWeight: 600, color: theme.palette.primary.main }}
          >
            Our Mission & Vision
          </Typography>
          <Typography
            variant="body1"
            sx={{ maxWidth: 900, mx: "auto", mt: 3, lineHeight: 1.7 }}
          >
            At <b>E-Courses</b>, our mission is to democratize high-quality,
            industry-relevant education.
          </Typography>
        </Box>
      </motion.div>

      {/* Why Choose Us */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={itemVariants}
      >
        <Box sx={{ my: { xs: 6, md: 8 }, pb: 7 }}>
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: 600, color: theme.palette.primary.main }}
          >
            Why Choose E-Courses?
          </Typography>

          {/* <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          > */}
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: 4 }}>
            {[
              {
                icon: PeopleIcon,
                title: "Expert-Led Content",
                text: "Learn from seasoned professionals.",
              },
              {
                icon: SchoolIcon,
                title: "Flexible Learning",
                text: "Access self-paced modules anytime.",
              },
              {
                icon: AssignmentTurnedInIcon,
                title: "Diverse Catalog",
                text: "Courses in finance, tech, and more.",
              },
              {
                icon: EmojiEventsIcon,
                title: "Certified & Recognized",
                text: "Earn credentials employers trust.",
              },
            ].map((item, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                <motion.div variants={itemVariants}>
                  <Card
                    raised
                    sx={{
                      height: "100%",
                      p: 3,
                      textAlign: "center",
                      transition: "0.3s",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: 8,
                      },
                    }}
                  >
                    <Icon
                      component={item.icon}
                      sx={{
                        fontSize: 60,
                        color: theme.palette.secondary.main,
                        mb: 2,
                      }}
                    />
                    <CardContent>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          {/* </motion.div> */}
        </Box>
      </motion.div>

      {/* Team Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={itemVariants}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{ fontWeight: 600, color: theme.palette.primary.main }}
        >
          Meet Our Teachers
        </Typography>

        {/* <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        > */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: 4 }}>
          {teamMembers.map((member, idx) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              key={idx}
              sx={{ display: "flex" }}
            >
              <motion.div
                variants={itemVariants}
                style={{ flex: 1, display: "flex" }}
              >
                <Card
                  raised
                  sx={{
                    flex: 1,
                    textAlign: "center",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Avatar
                    src={member.avatar}
                    alt={member.name}
                    sx={{
                      width: 100,
                      height: 100,
                      mb: 2,
                      mx: "auto",
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {member.name}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      gutterBottom
                    >
                      {member.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.bio}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        {/* </motion.div> */}
        {/* </Box> */}
      </motion.div>
      {/* CTA Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={itemVariants}
      >
        <Box sx={{ my: { xs: 6, md: 8 }, textAlign: "center" }}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{ fontWeight: 600, color: theme.palette.primary.main }}
          >
            Ready to Begin Your Journey?
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
            <CButton
              label="Explore Courses"
              variant="contained"
              color="secondary"
              size={isMobile ? "small" : "large"}
              href="/courses"
            />
            <CButton
              label="Contact Us"
              variant="outlined"
              href="/contact"
              size={isMobile ? "small" : "large"}
            />
          </Stack>
        </Box>
      </motion.div>
    </Container>
  );
}

export default AboutPage;
