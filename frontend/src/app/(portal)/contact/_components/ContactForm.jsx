"use client";
import React from "react";
import { Grid, Card, CardContent, Typography, TextField, Button, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import SendIcon from "@mui/icons-material/Send";

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

const ContactForm = () => {
    const theme = useTheme();

    return (
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
    );
};

export default ContactForm;
