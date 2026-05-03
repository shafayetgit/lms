"use client";
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";
import { CATEGORY_DEFAULT_IMAGE, PAGES } from "@/lib/constants";
import Link from "next/link";
import { CldImage } from "next-cloudinary";

const imageHover = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.4 } },
};

const CategoryCard = ({ category, index }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { delay: index * 0.05 } },
      }}
    >
      <motion.div initial="rest" whileHover="hover" animate="rest">
        <Link href={`${PAGES.PORTAL.COURSES.path}?category=${category.slug}`}>
          <Card
            component={CardActionArea}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              height: "100%",
              border: (theme) =>
                `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
              boxShadow: (theme) =>
                `0 4px 12px ${alpha(theme.palette.text.primary, 0.02)}`,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                borderColor: (theme) => alpha(theme.palette.text.primary, 0.2),
                boxShadow: (theme) =>
                  `0 15px 35px ${alpha(theme.palette.text.primary, 0.08)}`,
                transform: "translateY(-6px)",
                "& .hover-arrow": {
                  opacity: 1,
                  transform: "translateX(0)",
                },
              },
            }}
          >
            {/* Image */}
            {/* <Box
              sx={{
                aspectRatio: "1 / 1",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <motion.img
                src={category.image_url || CATEGORY_DEFAULT_IMAGE}
                alt={category.name}
                variants={imageHover}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: (theme) =>
                    `linear-gradient(to bottom, transparent 60%, ${alpha(theme.palette.common.black, 0.4)} 100%)`,
                }}
              />
            </Box> */}

            <Box
              sx={{
                aspectRatio: "1 / 1",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <CldImage
                src={category.image_url || "start-up-business-meeting_bbw3sj"}
                alt={category.name}
                fill
                aspectRatio="1:1"
                // crop="fill"
                // gravity="auto"
                // style={{
                //   objectFit: "cover",
                // }}
              />

              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: (theme) =>
                    `linear-gradient(to bottom, transparent 60%, ${alpha(
                      theme.palette.common.black,
                      0.4,
                    )} 100%)`,
                }}
              />
            </Box>

            {/* Content */}
            <CardContent
              sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, lineHeight: 1.2 }}
              >
                {category.name}
              </Typography>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default CategoryCard;
