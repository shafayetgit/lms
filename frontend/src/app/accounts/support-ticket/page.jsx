"use client";
import React, { useState } from "react";
import {
    Box,
    Grid,
    Typography,
    Paper,
    Stack,
    Chip,
    IconButton,
    Tooltip,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select
} from "@mui/material";
import {
    SupportAgent,
    Add,
    ChatBubbleOutline,
    CheckCircleOutline,
    HourglassEmpty,
    Schedule,
    ArrowForwardIos,
    Close,
    PriorityHigh
} from "@mui/icons-material";
import AccountsLayout from "../AccountsLayout";
import CButton from "@/components/CButton";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ticketsData = [
    {
        id: "TICK-8842",
        subject: "Unable to access the final quiz in Advanced Finance",
        status: "Open",
        priority: "High",
        lastUpdate: "2 hours ago",
        category: "Technical Issue"
    },
    {
        id: "TICK-8821",
        subject: "Question about the Investment Banking certification",
        status: "In Progress",
        priority: "Medium",
        lastUpdate: "1 day ago",
        category: "General Inquiry"
    },
    {
        id: "TICK-8790",
        subject: "Refund request for the Digital Marketing course",
        status: "Resolved",
        priority: "Low",
        lastUpdate: "3 days ago",
        category: "Billing"
    },
];

export default function SupportTicketPage() {
    const [filter, setFilter] = useState("");
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const router = useRouter();

    const stats = [
        { label: "Total Tickets", count: 12, icon: <SupportAgent />, color: 'primary.main' },
        { label: "Open", count: 2, icon: <HourglassEmpty />, color: 'secondary.main' },
        { label: "Resolved", count: 10, icon: <CheckCircleOutline />, color: '#4CAF50' },
    ];

    const getStatusChip = (status) => {
        const statusMap = {
            "Open": { color: "secondary.main", bg: "rgba(118, 184, 42, 0.12)" },
            "In Progress": { color: "#FFB000", bg: "rgba(255, 176, 0, 0.12)" },
            "Resolved": { color: "#4CAF50", bg: "rgba(76, 175, 80, 0.12)" },
        };
        const config = statusMap[status] || statusMap["Open"];

        return (
            <Chip
                label={status}
                size="small"
                sx={{
                    fontWeight: 800,
                    bgcolor: config.bg,
                    color: config.color,
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    borderRadius: 2
                }}
            />
        );
    };

    return (
        <AccountsLayout
            pageTitle="Support Center"
            actionButton={
                <CButton
                    label="Create New Ticket"
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenCreateModal(true)}
                    sx={{ borderRadius: '50px', px: 3 }}
                />
            }
        >
            <Stack spacing={4}>
                {/* Quick Stats */}
                <Grid container spacing={3}>
                    {stats.map((stat, idx) => (
                        <Grid size={{ xs: 12, sm: 4 }} key={idx}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 6,
                                    border: "1px solid",
                                    borderColor: "rgba(0,0,0,0.06)",
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    background: `linear-gradient(135deg, white 0%, ${stat.color}05 100%)`,
                                }}
                            >
                                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${stat.color}15`, color: stat.color, display: 'flex' }}>
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{stat.count}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{stat.label}</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* Ticket List Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Your Active Tickets</Typography>
                    <TextField
                        select
                        size="small"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
                        label="Sort by Status"
                    >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="Open">Open</MenuItem>
                        <MenuItem value="Resolved">Resolved</MenuItem>
                    </TextField>
                </Box>

                {/* Ticket Feed */}
                <Stack spacing={2}>
                    {ticketsData.map((ticket) => (
                        <Paper
                            key={ticket.id}
                            elevation={0}
                            onClick={() => router.push(`/accounts/support-ticket/${ticket.id}`)}
                            sx={{
                                p: 3,
                                borderRadius: 6,
                                border: "1px solid",
                                borderColor: "rgba(0,0,0,0.06)",
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                "&:hover": {
                                    borderColor: 'primary.main',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.04)',
                                    transform: 'translateY(-4px)'
                                }
                            }}
                        >
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.02)', color: 'text.secondary' }}>
                                            <ChatBubbleOutline fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', opacity: 0.6 }}>
                                                    {ticket.id}
                                                </Typography>
                                                <Typography variant="caption" sx={{ px: 1, py: 0.2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, fontWeight: 700 }}>
                                                    {ticket.category}
                                                </Typography>
                                            </Stack>
                                            <Typography variant="body1" sx={{ fontWeight: 800, mb: 1 }}>
                                                {ticket.subject}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: { sm: 'none' } }}>
                                                Updated {ticket.lastUpdate}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Stack direction="row" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center" spacing={3}>
                                        <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                                                <Schedule fontSize="inherit" /> Updated {ticket.lastUpdate}
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: ticket.priority === 'High' ? 'error.main' : 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                                                <PriorityHigh fontSize="inherit" /> {ticket.priority} Priority
                                            </Typography>
                                        </Box>
                                        {getStatusChip(ticket.status)}
                                        <IconButton size="small" sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}>
                                            <ArrowForwardIos fontSize="inherit" />
                                        </IconButton>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Stack>

                {/* 24/7 Hotline Banner */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        mt: 4,
                        borderRadius: 6,
                        bgcolor: 'primary.main',
                        color: 'white',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(30, 45, 68, 0.15)'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            opacity: 0.1,
                            transform: 'rotate(-20deg)',
                            display: { xs: 'none', md: 'block' }
                        }}
                    >
                        <SupportAgent sx={{ fontSize: 160 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Still Need Help?</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 3, maxWidth: 500, mx: 'auto' }}>
                        Our dedicated support team is available 24/7 to resolve any issues you might encounter.
                    </Typography>
                    <CButton
                        label="Live Training Schedule"
                        variant="outlined"
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', borderRadius: '50px', px: 4 }}
                    />
                </Paper>
            </Stack>

            {/* Create Ticket Modal */}
            <Dialog
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 6, p: 2 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Open Support Ticket
                    <IconButton onClick={() => setOpenCreateModal(false)} size="small">
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Please provide detailed information about your issue. Our team usually responds within 2 hours.
                    </Typography>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Subject"
                            placeholder="e.g., Unable to access course content"
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                            <InputLabel>Category</InputLabel>
                            <Select label="Category" defaultValue="technical">
                                <MenuItem value="technical">Technical Issue</MenuItem>
                                <MenuItem value="billing">Billing & Refund</MenuItem>
                                <MenuItem value="general">General Inquiry</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Detailed Description"
                            placeholder="Describe your issue here..."
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <CButton label="Cancel" onClick={() => setOpenCreateModal(false)} sx={{ color: 'text.secondary' }} />
                    <CButton label="Submit Ticket" variant="contained" color="secondary" sx={{ borderRadius: '50px', px: 4 }} />
                </DialogActions>
            </Dialog>
        </AccountsLayout>
    );
}
