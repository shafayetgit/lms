"use client";
import React from "react";
import { Typography, Grid, Card, CardContent, Avatar } from "@mui/material";
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

const TeamSection = () => {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={itemVariants}
        >
            <Typography
                variant="h3"
                gutterBottom
                sx={{ fontWeight: 800, color: "text.primary", textAlign: "center" }}
            >
                Meet Our Teachers
            </Typography>

            <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: 4 }}>
                {teamMembers.map((member, idx) => (
                    <Grid
                        size={{ xs: 12, sm: 6, md: 3 }}
                        key={idx}
                        sx={{ display: "flex" }}
                    >
                        <Card
                            sx={{
                                flex: 1,
                                textAlign: "center",
                                p: 4,
                                display: "flex",
                                flexDirection: "column",
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
                            <Avatar
                                src={member.avatar}
                                alt={member.name}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    mb: 2,
                                    mx: "auto",
                                    border: "4px solid rgba(0,0,0,0.04)"
                                }}
                            />
                            <CardContent sx={{ flexGrow: 1, p: 0 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {member.name}
                                </Typography>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                    sx={{ fontWeight: 600, mb: 1, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.75rem" }}
                                >
                                    {member.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {member.bio}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </motion.div>
    );
};

export default TeamSection;
