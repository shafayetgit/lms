"use client";
import React from "react";
import { Box, Typography, Stack, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut",
        },
    },
};

const ContactDetails = () => {
    const theme = useTheme();

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={itemVariants}
        >
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, color: theme.palette.primary.dark }}>
                Contact Information
            </Typography>

            <Stack spacing={4}>
                {/* Location */}
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: theme.palette.primary.main + "15",
                            mr: 2,
                            display: "flex",
                        }}
                    >
                        <LocationOnIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Our Location
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            123 Finance Avenue, Suite 400<br />
                            New York, NY 10004
                        </Typography>
                    </Box>
                </Box>

                {/* Phone */}
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: theme.palette.primary.main + "15",
                            mr: 2,
                            display: "flex",
                        }}
                    >
                        <PhoneIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Call Us
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            +1 (555) 123-4567<br />
                            Mon-Fri, 9am - 6pm EST
                        </Typography>
                    </Box>
                </Box>

                {/* Email */}
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: theme.palette.primary.main + "15",
                            mr: 2,
                            display: "flex",
                        }}
                    >
                        <EmailIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Email Us
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            support@e-courses.com<br />
                            info@e-courses.com
                        </Typography>
                    </Box>
                </Box>
            </Stack>

            {/* Map */}
            <Box mt={5} sx={{ overflow: "hidden", borderRadius: 4, boxShadow: theme.shadows[4] }}>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sbd!4v1689083584852!5m2!1sen!2sbd"
                    width="100%"
                    height="250"
                    style={{ border: 0, display: "block" }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </Box>
        </motion.div>
    );
};

export default ContactDetails;
