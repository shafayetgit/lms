"use client";
import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CardActionArea,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";

// Motion variants
const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -6, scale: 1.02, transition: { duration: 0.3 } },
};

const imageHover = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.4 } },
};

const CategoriesSection = () => {
  const theme = useTheme();

  const categories = [
    { id: 1, title: "Web Development", image: "https://picsum.photos/400/400?1", courseCount: 128 },
    { id: 2, title: "Data Science", image: "https://picsum.photos/400/400?2", courseCount: 96 },
    { id: 3, title: "Graphic Design", image: "https://picsum.photos/400/400?3", courseCount: 78 },
    { id: 4, title: "Languages", image: "https://picsum.photos/400/400?4", courseCount: 65 },
    { id: 5, title: "Business", image: "https://picsum.photos/400/400?5", courseCount: 112 },
    { id: 6, title: "Photography", image: "https://picsum.photos/400/400?6", courseCount: 54 },
    { id: 7, title: "Music", image: "https://picsum.photos/400/400?7", courseCount: 47 },
    { id: 8, title: "Health & Fitness", image: "https://picsum.photos/400/400?8", courseCount: 83 },
  ];

  return (
    <Box id="categories" sx={{ py: { xs: 6, md: 7 } }}>
      <Container maxWidth="lg">
        {/* Section Heading */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <Typography variant="h3" align="center" fontWeight={700} gutterBottom>
            Explore Categories
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto", mb: 6 }}
          >
            Discover courses across various categories to enhance your skills and knowledge.
          </Typography>
        </motion.div>

        {/* Categories Grid */}
        <Grid container spacing={3} justifyContent="center">
          {categories.map((category) => (
            <Grid key={category.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <motion.div initial="rest" whileHover="hover" animate="rest" variants={cardHover}>
                <Card
                  component={CardActionArea}
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    height: "100%",
                    boxShadow: theme.shadows[3],
                  }}
                >
                  {/* Image */}
                  <Box
                    sx={{
                      aspectRatio: "4 / 3", // Square ratio
                      overflow: "hidden",
                      bgcolor: "grey.100",
                    }}
                  >
                    <motion.img
                      src={category.image}
                      alt={category.title}
                      variants={imageHover}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>

                  {/* Content */}
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {category.title}
                    </Typography>
                    <Chip
                      label={`${category.courseCount} Courses`}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        borderColor: theme.palette.divider,
                      }}
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default CategoriesSection;
