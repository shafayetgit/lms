"use client";
import React from "react";
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    Button,
    Icon,
    useTheme,
    useMediaQuery,
    Stack,
} from "@mui/material";
import { motion } from "framer-motion";

// Icons
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";

// Simplified animation variants
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

function ContactPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Container maxWidth="lg" >
            {/* Page Header */}
            {/* <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={itemVariants}
            >
                <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
                    <Typography variant="h1" gutterBottom sx={{ fontWeight: 700 }}>
                        Get In Touch
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{ maxWidth: 700, mx: "auto", color: "text.secondary", fontWeight: 400 }}
                    >
                        Have questions about our courses or need assistance? Our team is here to help you every step of the way.
                    </Typography>

                </Box>
            </motion.div> */}

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={itemVariants}
            >
                <Box
                    sx={{
                        py: { xs: 8, md: 12 },
                        mb: { xs: 6, md: 8 },
                        textAlign: "center",
                        color: theme.palette.primary.contrastText,
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.main} 90%)`,
                        borderRadius: 4,
                        boxShadow: theme.shadows[8],
                    }}
                >
                    <Typography variant="h1" gutterBottom sx={{ fontWeight: 700 }}>
                        Get In Touch
                    </Typography>
                    <Typography
                        variant={isMobile ? "h6" : "h5"}
                        sx={{ maxWidth: 800, mx: "auto", opacity: 0.9 }}
                    >
                        Have questions about our courses or need assistance? Our team is here to help you every step of the way.
                    </Typography>
                </Box>
            </motion.div>

            <Grid container spacing={6}>
                {/* Contact Information */}
                <Grid size={{ xs: 12, md: 5 }}>
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
                                        bgcolor: theme.palette.primary.main + "15", // 15% opacity
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

                        {/* Map Placeholder */}
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
                </Grid>

                {/* Contact Form */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={itemVariants}
                    >
                        <Card
                            raised
                            sx={{
                                p: { xs: 2, md: 4 },
                                borderRadius: 4,
                                // boxShadow: theme.shadows[8],
                                height: "100%",
                            }}
                        >
                            <CardContent>
                                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.dark }}>
                                    Send a Message
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                    Fill out the form below and we'll get back to you as soon as possible.
                                </Typography>

                                <form noValidate autoComplete="off">
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="First Name"
                                                variant="outlined"
                                                required
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Last Name"
                                                variant="outlined"
                                                required
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                label="Email Address"
                                                variant="outlined"
                                                type="email"
                                                required
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                label="Subject"
                                                variant="outlined"
                                                required
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                label="Message"
                                                variant="outlined"
                                                multiline
                                                rows={5}
                                                required
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                fullWidth
                                                endIcon={<SendIcon />}
                                                sx={{
                                                    py: 1.5,
                                                    fontSize: "1.1rem",
                                                    fontWeight: 600,
                                                    borderRadius: 2,
                                                    textTransform: "none",
                                                }}
                                            >
                                                Send Message
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
            </Grid>
        </Container>
    );
}

export default ContactPage;
