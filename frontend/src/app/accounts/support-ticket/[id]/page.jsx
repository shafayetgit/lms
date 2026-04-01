"use client";
import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Stack,
    Avatar,
    TextField,
    Divider,
    useTheme,
    Grid,
    IconButton
} from "@mui/material";
import {
    Send,
    AttachFile,
    ArrowBack,
    History,
    MoreVert
} from "@mui/icons-material";
import AccountsLayout from "../../AccountsLayout";
import CButton from "@/components/CButton";
import Link from "next/link";
import { useParams } from "next/navigation";

const ticketData = {
    id: "TICK-8842",
    subject: "Unable to access the final quiz in Advanced Finance",
    status: "Open",
    category: "Technical Issue",
    messages: [
        {
            id: 1,
            sender: "Student",
            name: "Nick DuBuque",
            text: "Hello, I've completed all the lessons in the Advanced Financial Analysis course, but the 'Final Quiz' button remains locked. Can you please check my progress?",
            time: "2 hours ago",
            avatar: "https://i.pravatar.cc/150?u=nick"
        },
        {
            id: 2,
            sender: "Support",
            name: "Sarah (Support Expert)",
            text: "Hi Nick! I'm sorry to hear you're having trouble. I've just refreshed your course tokens. Could you please try clearing your browser cache and logging back in?",
            time: "1 hour ago",
            avatar: "https://i.pravatar.cc/150?u=support"
        },
        {
            id: 3,
            sender: "Student",
            name: "Nick DuBuque",
            text: "Thanks Sarah, I tried that but it's still locked. Is there anything else I need to complete?",
            time: "45 mins ago",
            avatar: "https://i.pravatar.cc/150?u=nick"
        },
    ]
};

export default function TicketDetailPage() {
    const params = useParams();
    const theme = useTheme();
    const [reply, setReply] = useState("");

    const ticketId = params.id || ticketData.id;

    return (
        <AccountsLayout
            pageTitle={`Support Ticket #${ticketId}`}
            actionButton={
                <CButton
                    label="Back to Tickets"
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    component={Link}
                    href="/accounts/support-ticket"
                    sx={{ borderRadius: '50px' }}
                />
            }
        >
            <Stack spacing={3}>
                {/* Ticket Header Card */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 6,
                        border: "1px solid",
                        borderColor: "rgba(0,0,0,0.06)",
                        bgcolor: 'rgba(0,0,0,0.01)'
                    }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{ticketData.subject}</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="caption" sx={{ px: 1.5, py: 0.5, bgcolor: 'secondary.main', color: 'white', borderRadius: 2, fontWeight: 800 }}>
                                    {ticketData.status}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <History fontSize="inherit" /> Last active 45 mins ago
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>Category</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{ticketData.category}</Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Message Thread */}
                <Box sx={{ minHeight: '400px' }}>
                    <Stack spacing={3}>
                        {ticketData.messages.map((msg) => {
                            const isSupport = msg.sender === "Support";
                            return (
                                <Box
                                    key={msg.id}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: isSupport ? 'row' : 'row-reverse',
                                        gap: 2,
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    <Avatar
                                        src={msg.avatar}
                                        sx={{ width: 40, height: 40, border: '2px solid', borderColor: isSupport ? 'secondary.main' : 'primary.main' }}
                                    />
                                    <Box sx={{ maxWidth: '80%' }}>
                                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5} justifyContent={isSupport ? 'flex-start' : 'flex-end'}>
                                            <Typography variant="caption" sx={{ fontWeight: 800 }}>{msg.name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>• {msg.time}</Typography>
                                        </Stack>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: isSupport ? '0 20px 20px 20px' : '20px 0 20px 20px',
                                                bgcolor: isSupport ? 'white' : 'primary.main',
                                                color: isSupport ? 'text.primary' : 'white',
                                                border: isSupport ? '1px solid' : 'none',
                                                borderColor: 'rgba(0,0,0,0.06)',
                                                boxShadow: isSupport ? '0 4px 12px rgba(0,0,0,0.03)' : '0 8px 20px rgba(30, 45, 68, 0.15)'
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{msg.text}</Typography>
                                        </Paper>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>

                {/* Reply Box */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 6,
                        border: "1px solid",
                        borderColor: "rgba(0,0,0,0.08)",
                        bgcolor: 'white',
                        position: 'sticky',
                        bottom: 24,
                        boxShadow: '0 -10px 40px rgba(0,0,0,0.04)'
                    }}
                >
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Type your message here..."
                        variant="outlined"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 4,
                                bgcolor: 'rgba(0,0,0,0.01)'
                            }
                        }}
                    />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1}>
                            <IconButton color="primary" sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                <AttachFile fontSize="small" />
                            </IconButton>
                            <IconButton color="primary" sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                <MoreVert fontSize="small" />
                            </IconButton>
                        </Stack>
                        <CButton
                            label="Send Message"
                            variant="contained"
                            color="secondary"
                            endIcon={<Send />}
                            sx={{ borderRadius: '50px', px: 4 }}
                        />
                    </Stack>
                </Paper>
            </Stack>
        </AccountsLayout>
    );
}
