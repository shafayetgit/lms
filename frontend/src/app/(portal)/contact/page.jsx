"use client";
import React from "react";
import { Container, Grid } from "@mui/material";

// Components
import ContactHero from "./_components/ContactHero";
import ContactDetails from "./_components/ContactDetails";
import ContactForm from "./_components/ContactForm";

function ContactPage() {
    return (
        <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
            <ContactHero />

            <Grid container spacing={6}>
                {/* Contact Information */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <ContactDetails />
                </Grid>

                {/* Contact Form */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <ContactForm />
                </Grid>
            </Grid>
        </Container>
    );
}

export default ContactPage;
