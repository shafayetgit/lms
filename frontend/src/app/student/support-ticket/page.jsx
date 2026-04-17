"use client";
import CTextField from "@/components/ui/CTextField";
import React, { useState } from "react";
import {
    Box,
    Grid,
    Typography,
    Paper,
    Stack,
    Chip,
    IconButton,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    alpha,
    useTheme,
    Avatar
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
    PriorityHigh,
    SearchOutlined,
    HeadsetMicOutlined,
    HistoryEduOutlined
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import StudentLayout from "../StudentLayout";
import CButton from "@/components/ui/CButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NeuralPanel from "@/components/ui/NeuralPanel";

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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function SupportTicketPage() {
    const [filter, setFilter] = useState("");
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const router = useRouter();
    const theme = useTheme();

    const stats = [
        { label: "Active Support", count: 12, icon: <HeadsetMicOutlined />, color: 'primary.main' },
        { label: "Open Issues", count: 2, icon: <HistoryEduOutlined />, color: 'secondary.main' },
        { label: "Archived", count: 10, icon: <CheckCircleOutline />, color: '#10b981' },
    ];

    const getStatusChip = (status) => {
        const isResolved = status === "Resolved";
        const isPending = status === "In Progress";

        const resolvedColor = status === "Open" ? theme.palette.secondary.main : (status === "Resolved" ? "#10b981" : "#FFB000");

        return (
            <Chip
                label={status}
                size="small"
                sx={{
                    fontWeight: 900,
                    bgcolor: alpha(resolvedColor, 0.1),
                    color: resolvedColor,
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    borderRadius: '6px',
                    letterSpacing: 1
                }}
            />
        );
    };

    return (
        <StudentLayout>
            <Box
                component={motion.div}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                sx={{ width: "100%", pb: 10 }}
            >
                {/* Header Section */}
                <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3 }}>
                    <Box>
                        <Typography
                            variant="h3"
                            fontWeight="900"
                            sx={{
                                letterSpacing: "-0.04em",
                                color: 'primary.main',
                                mb: 1
                            }}
                        >
                            Support Terminal
                        </Typography>
                        <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: -0.5 }}>
                            24/7 high-fidelity assistance for your academic infrastructure.
                        </Typography>
                    </Box>

                    <CButton
                        label="Deploy New Ticket"
                        variant="contained"
                        color="secondary"
                        icon={<Add />}
                        onClick={() => setOpenCreateModal(true)}
                        sx={{ borderRadius: '16px', px: 4, py: 1.5, fontWeight: 900 }}
                    />
                </Box>

                {/* Quick Network Stats */}
                <Grid container spacing={4} sx={{ mb: 8 }}>
                    {stats.map((stat, idx) => {
                        const resolvedColor = stat.color === 'primary.main' ? theme.palette.primary.main : (stat.color === 'secondary.main' ? theme.palette.secondary.main : stat.color);
                        return (
                            <Grid size={{ xs: 12, sm: 4 }} key={idx}>
                                <motion.div variants={itemVariants}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: '24px',
                                            border: "1px solid rgba(0,0,0,0.06)",
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2.5,
                                            bgcolor: "rgba(255, 255, 255, 0.6) !important",
                                            backdropFilter: "blur(10px)",
                                            transition: 'all 0.3s ease',
                                            "&:hover": {
                                                transform: 'translateY(-4px)',
                                                borderColor: alpha(resolvedColor, 0.2)
                                            }
                                        }}
                                    >
                                        <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(resolvedColor, 0.1), color: resolvedColor, borderRadius: '14px' }}>
                                            {stat.icon}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -1 }}>{stat.count}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</Typography>
                                        </Box>
                                    </Paper>
                                </motion.div>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* Main Content Area */}
                <Stack spacing={4}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -0.5 }}>Communication History</Typography>
                        <Stack direction="row" spacing={2}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: 'rgba(0,0,0,0.03)',
                                borderRadius: '12px',
                                px: 2,
                                py: 0.5,
                                width: 240,
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <SearchOutlined sx={{ fontSize: 20, color: 'text.disabled', mr: 1 }} />
                                <Typography variant="body2" sx={{ color: 'text.disabled' }}>Search logs...</Typography>
                            </Box>
                            <CTextField
                                select
                                size="small"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.03)', border: 'none' } }}
                            >
                                <MenuItem value="">All Priority</MenuItem>
                                <MenuItem value="High">High Priority</MenuItem>
                                <MenuItem value="Resolved">Archives</MenuItem>
                            </CTextField>
                        </Stack>
                    </Box>

                    <AnimatePresence mode="popLayout">
                        <Stack spacing={2.5}>
                            {ticketsData.map((ticket) => (
                                <motion.div
                                    key={ticket.id}
                                    variants={itemVariants}
                                    layout
                                    transition={{ duration: 0.4 }}
                                >
                                    <Paper
                                        elevation={0}
                                        onClick={() => router.push(`/student/support-ticket/${ticket.id}`)}
                                        sx={{
                                            p: 3,
                                            borderRadius: '24px',
                                            border: "1px solid rgba(0,0,0,0.06)",
                                            bgcolor: "rgba(255, 255, 255, 0.6) !important",
                                            backdropFilter: "blur(10px)",
                                            transition: 'all 0.4s cubic-bezier(0.2, 1, 0.3, 1)',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            "&:hover": {
                                                borderColor: 'secondary.main',
                                                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)',
                                                transform: 'translateX(8px)'
                                            }
                                        }}
                                    >
                                        <NeuralPanel particleCount={15} opacity={0.03} color={theme.palette.secondary.main} />
                                        <Grid container spacing={4} alignItems="center">
                                            <Grid size={{ xs: 12, md: 8 }}>
                                                <Stack direction="row" spacing={3} alignItems="flex-start">
                                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), color: theme.palette.primary.main, width: 44, height: 44, borderRadius: '12px' }}>
                                                        <ChatBubbleOutline fontSize="small" />
                                                    </Avatar>
                                                    <Box>
                                                        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                                                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', letterSpacing: 1 }}>
                                                                #{ticket.id}
                                                            </Typography>
                                                            <Chip
                                                                label={ticket.category}
                                                                size="small"
                                                                sx={{ fontWeight: 800, fontSize: '0.6rem', bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}
                                                            />
                                                        </Stack>
                                                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: 'primary.main', fontSize: '1.1rem' }}>
                                                            {ticket.subject}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700 }}>
                                                            <Schedule sx={{ fontSize: 14 }} /> UPDATED {ticket.lastUpdate}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <Stack direction="row" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center" spacing={4}>
                                                    <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 900, color: ticket.priority === 'High' ? 'error.main' : 'text.disabled', display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                            <PriorityHigh fontSize="inherit" /> {ticket.priority} Priority
                                                        </Typography>
                                                    </Box>
                                                    {getStatusChip(ticket.status)}
                                                    <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main', borderRadius: '10px' }}>
                                                        <ArrowForwardIos sx={{ fontSize: 12 }} />
                                                    </IconButton>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </motion.div>
                            ))}
                        </Stack>
                    </AnimatePresence>

                    {/* Support Hotline Banner */}
                    <motion.div variants={itemVariants}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 5,
                                mt: 6,
                                borderRadius: '32px',
                                bgcolor: 'primary.main',
                                color: 'white',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: `0 30px 60px -15px ${alpha(theme.palette.primary.main, 0.4)}`
                            }}
                        >
                            <NeuralPanel particleCount={40} opacity={0.15} color="white" />
                            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5, position: 'relative', zIndex: 1, letterSpacing: -1 }}>Direct Channel Support</Typography>
                            <Typography variant="body1" sx={{ opacity: 0.8, mb: 4, maxWidth: 550, mx: 'auto', position: 'relative', zIndex: 1, fontWeight: 500 }}>
                                Need immediate infrastructure assistance? Our engineering support team is available for real-time resolution protocols.
                            </Typography>
                            <CButton
                                label="Review Service Agreement"
                                variant="outlined"
                                color="inherit"
                                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', borderRadius: '16px', px: 5, py: 1.5, fontWeight: 900, position: 'relative', zIndex: 1 }}
                            />
                        </Paper>
                    </motion.div>
                </Stack>
            </Box>

            {/* Create Ticket Modal */}
            <Dialog
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '28px', p: 2, backdropFilter: 'blur(20px)', bgcolor: 'rgba(255,255,255,0.9)' }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'primary.main' }}>
                    Deploy Support Ticket
                    <IconButton onClick={() => setOpenCreateModal(false)} size="small">
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary', fontWeight: 600 }}>
                        Frame your query with high fidelity. Our protocols ensure a response within 120 minutes.
                    </Typography>
                    <Stack spacing={3}>
                        <CTextField
                            fullWidth
                            label="Broadcast Subject"
                            placeholder="e.g., Critical access protocol failure"
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                            <InputLabel>Classification</InputLabel>
                            <Select label="Classification" defaultValue="technical">
                                <MenuItem value="technical">Technical Infrastructure</MenuItem>
                                <MenuItem value="billing">Financial & Ledger</MenuItem>
                                <MenuItem value="general">Standard Query</MenuItem>
                            </Select>
                        </FormControl>
                        <CTextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Detailed Specification"
                            placeholder="Describe the incident parameters..."
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 4 }}>
                    <CButton label="Abort" onClick={() => setOpenCreateModal(false)} sx={{ color: 'text.secondary', fontWeight: 800 }} />
                    <CButton label="Initialize Broadcast" variant="contained" color="secondary" sx={{ borderRadius: '14px', px: 5, py: 1.5, fontWeight: 900 }} />
                </DialogActions>
            </Dialog>
        </StudentLayout>
    );
}
