"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

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

const MissionSection = () => {
    return (
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
                    sx={{ fontWeight: 800, color: "text.primary" }}
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
    );
};

export default MissionSection;
