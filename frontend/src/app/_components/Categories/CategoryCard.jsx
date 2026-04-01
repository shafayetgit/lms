"use client";
import React from "react";
import { Box, Card, CardContent, Typography, CardActionArea } from "@mui/material";
import { motion } from "framer-motion";

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
                visible: { opacity: 1, scale: 1, transition: { delay: index * 0.05 } }
            }}
        >
            <motion.div initial="rest" whileHover="hover" animate="rest">
                <Card
                    component={CardActionArea}
                    sx={{
                        borderRadius: 4,
                        overflow: "hidden",
                        height: "100%",
                        border: "1px solid rgba(0,0,0,0.08)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                            borderColor: "rgba(0,0,0,0.2)",
                            boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
                            transform: "translateY(-6px)",
                            "& .hover-arrow": {
                                opacity: 1,
                                transform: "translateX(0)",
                            }
                        },
                    }}
                >
                    {/* Image */}
                    <Box
                        sx={{
                            aspectRatio: "1 / 1",
                            overflow: "hidden",
                            position: "relative",
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
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4) 100%)",
                            }}
                        />
                    </Box>

                    {/* Content */}
                    <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {category.title}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="caption" sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: "50px",
                                bgcolor: "rgba(0,0,0,0.04)",
                                fontWeight: 600,
                                color: "text.secondary"
                            }}>
                                {category.courseCount} Courses
                            </Typography>
                            <Typography
                                className="hover-arrow"
                                variant="body2"
                                sx={{
                                    fontWeight: 700,
                                    opacity: 0,
                                    transform: "translateX(-8px)",
                                    transition: "all 0.3s ease",
                                    color: "primary.main"
                                }}
                            >
                                Explore →
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default CategoryCard;
