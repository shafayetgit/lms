"use client";
import React from "react";
import { Box, Typography, Grid, Card, CardContent, Icon } from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

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

const items = [
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
];

const WhyChooseUs = () => {
    return (
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
                    sx={{ fontWeight: 800, color: "text.primary" }}
                >
                    Why Choose E-Courses?
                </Typography>

                <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: 4 }}>
                    {items.map((item, idx) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                            <Card
                                sx={{
                                    height: "100%",
                                    p: 3,
                                    textAlign: "center",
                                    borderRadius: 4,
                                    bgcolor: "background.paper",
                                    border: "1px solid rgba(0,0,0,0.08)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    "&:hover": {
                                        transform: "translateY(-6px)",
                                        borderColor: "rgba(0,0,0,0.2)",
                                        boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
                                    },
                                }}
                            >
                                <Icon
                                    component={item.icon}
                                    sx={{
                                        fontSize: 50,
                                        color: "text.primary",
                                        mb: 2,
                                    }}
                                />
                                <CardContent sx={{ p: 0 }}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{ fontWeight: 700 }}
                                    >
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.text}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </motion.div>
    );
};

export default WhyChooseUs;
