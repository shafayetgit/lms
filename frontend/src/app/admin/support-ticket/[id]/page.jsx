"use client";
import CTextField from "@/components/ui/CTextField";
import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Stack,
    Avatar,
    Divider,
    useTheme,
    Grid,
    IconButton,
    alpha
} from "@mui/material";
import {
    Send,
    AttachFile,
    ArrowBack,
    History,
    MoreVert,
    CheckCircleOutline,
    ScheduleOutlined
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import StudentLayout from "@/app/student/StudentLayout";
import CButton from "@/components/ui/CButton";
import Link from "next/link";
import { useParams } from "next/navigation";
import NeuralPanel from "@/components/ui/NeuralPanel";

const ticketData = {
    id: "TICK-8842",
    subject: "Unable to access the final quiz in Advanced Finance Infrastructure",
    status: "Open",
    category: "Technical Engineering",
    messages: [
        {
            id: 1,
            sender: "Student",
            name: "Nick DuBuque",
            text: "Broadcast: I've validated all modules in the Advanced Financial Analysis course, but the 'Final Quiz' gate remains locked. Requesting immediate status check on my progression tokens.",
            time: "2 hours ago",
            avatar: "https://i.pravatar.cc/150?u=nick"
        },
        {
            id: 2,
            sender: "Support",
            name: "Sarah (Lead Engineer)",
            text: "Acknowledgment received. I've re-initialized your course progression tokens. Please execute a cache flush and verify core access in your terminal.",
            time: "1 hour ago",
            avatar: "https://i.pravatar.cc/150?u=support"
        },
        {
            id: 3,
            sender: "Student",
            name: "Nick DuBuque",
            text: "Negative, status remains unchanged after cache flush. Check if there are unfulfilled prerequisites in the ledger.",
            time: "45 mins ago",
            avatar: "https://i.pravatar.cc/150?u=nick"
        },
    ]
};

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

export default function TicketDetailPage() {
    const params = useParams();
    const theme = useTheme();
    const [reply, setReply] = useState("");

    const ticketId = params.id || ticketData.id;

    return (
        <StudentLayout>
            <Box
                component={motion.div}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                sx={{ width: "100%", pb: 10 }}
            >
                {/* Header with Navigation */}
                <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                            <CButton
                                label=""
                                variant="outlined"
                                color="primary"
                                icon={<ArrowBack />}
                                component={Link}
                                href="/student/support-ticket"
                                sx={{ borderRadius: '12px', minWidth: 48, p: 0, color: 'text.secondary' }}
                            />
                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -0.5 }}>
                                Broadcast #{ticketId}
                            </Typography>
                            <Chip
                                label={ticketData.status}
                                size="small"
                                sx={{ fontWeight: 900, bgcolor: 'secondary.main', color: 'white', borderRadius: '6px', fontSize: '0.65rem' }}
                            />
                        </Stack>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1, color: 'primary.main', mb: 1 }}>{ticketData.subject}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Classification: {ticketData.category}</Typography>
                    </Box>
                    <IconButton sx={{ bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>
                        <MoreVert />
                    </IconButton>
                </Box>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        {/* Conversation Engine */}
                        <Stack spacing={4} sx={{ mb: 6 }}>
                            {ticketData.messages.map((msg) => {
                                const isSupport = msg.sender === "Support";
                                return (
                                    <motion.div key={msg.id} variants={itemVariants}>
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: isSupport ? 'row' : 'row-reverse',
                                            gap: 3,
                                            alignItems: 'flex-start'
                                        }}>
                                            <Avatar
                                                src={msg.avatar}
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    border: '3px solid',
                                                    borderColor: isSupport ? 'secondary.main' : alpha(theme.palette.primary.main, 0.4),
                                                    borderRadius: '16px'
                                                }}
                                            />
                                            <Box sx={{ maxWidth: '85%' }}>
                                                <Stack direction="row" spacing={2} alignItems="center" mb={1} justifyContent={isSupport ? 'flex-start' : 'flex-end'}>
                                                    <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>{msg.name}</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>• {msg.time}</Typography>
                                                </Stack>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 3,
                                                        borderRadius: isSupport ? '0 24px 24px 24px' : '24px 0 24px 24px',
                                                        bgcolor: isSupport ? "rgba(255, 255, 255, 0.8) !important" : 'primary.main',
                                                        color: isSupport ? 'text.primary' : 'white',
                                                        backdropFilter: isSupport ? "blur(10px)" : "none",
                                                        border: isSupport ? '1px solid rgba(0,0,0,0.06)' : 'none',
                                                        boxShadow: isSupport ? '0 10px 30px -10px rgba(0,0,0,0.05)' : `0 20px 40px -15px ${alpha(theme.palette.primary.main, 0.3)}`,
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ lineHeight: 1.8, fontWeight: isSupport ? 600 : 500 }}>{msg.text}</Typography>
                                                </Paper>
                                            </Box>
                                        </Box>
                                    </motion.div>
                                );
                            })}
                        </Stack>

                        {/* Reply Hub */}
                        <motion.div variants={itemVariants}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: '32px',
                                    border: "1px solid rgba(0,0,0,0.1)",
                                    bgcolor: "white",
                                    boxShadow: '0 30px 60px -20px rgba(0,0,0,0.08)'
                                }}
                            >
                                <CTextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    placeholder="Enter your transmission here..."
                                    variant="outlined"
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    sx={{
                                        mb: 3,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '24px',
                                            bgcolor: 'rgba(0,0,0,0.01)',
                                            p: 2
                                        }
                                    }}
                                />
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={1}>
                                        <IconButton sx={{ borderRadius: '12px', bgcolor: alpha(theme.palette.secondary.main, 0.05), color: 'secondary.main' }}>
                                            <AttachFile fontSize="small" />
                                        </IconButton>
                                        <IconButton sx={{ borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.02)' }}>
                                            <CheckCircleOutline fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                    <CButton
                                        label="Broadcast Reply"
                                        variant="contained"
                                        color="secondary"
                                        icon={<Send />}
                                        sx={{ borderRadius: '16px', px: 5, py: 1.5, fontWeight: 900 }}
                                    />
                                </Stack>
                            </Paper>
                        </motion.div>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        {/* Sidebar Info */}
                        <motion.div variants={itemVariants}>
                            <Stack spacing={3}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        borderRadius: '32px',
                                        border: "1px solid rgba(0,0,0,0.06)",
                                        bgcolor: "rgba(255, 255, 255, 0.6) !important",
                                        backdropFilter: "blur(10px)",
                                    }}
                                >
                                    <NeuralPanel particleCount={10} opacity={0.03} />
                                    <Typography variant="body2" sx={{ fontWeight: 900, mb: 3, letterSpacing: 1, textTransform: 'uppercase', color: 'primary.main' }}>Connection Stats</Typography>
                                    <Stack spacing={3}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, textTransform: 'uppercase' }}>Session ID</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>#8A-F882-B2A</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, textTransform: 'uppercase' }}>Last Activity</Typography>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <ScheduleOutlined sx={{ fontSize: 14, color: 'secondary.main' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>45 minutes ago</Typography>
                                            </Stack>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, textTransform: 'uppercase' }}>Support Level</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main' }}>Elite Tier Authorization</Typography>
                                        </Box>
                                    </Stack>
                                    <Divider sx={{ my: 4, opacity: 0.1 }} />
                                    <CButton
                                        label="Close Broadcast"
                                        variant="outlined"
                                        color="primary"
                                        fullWidth
                                        sx={{ borderRadius: '16px', py: 1.5, fontWeight: 900, borderStyle: 'dashed' }}
                                    />
                                </Paper>

                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        borderRadius: '32px',
                                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                        border: '1px solid',
                                        borderColor: alpha(theme.palette.secondary.main, 0.1)
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 900, mb: 1, color: 'secondary.main' }}>Infrastructure Note</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, lineHeight: 1.6 }}>
                                        All transmissions are logged and encrypted. For real-time infrastructure incidents, utilize the Live Operations channel.
                                    </Typography>
                                </Paper>
                            </Stack>
                        </motion.div>
                    </Grid>
                </Grid>
            </Box>
        </StudentLayout>
    );
}

const Chip = ({ label, size, sx }) => {
    return (
        <Box sx={{
            px: 1.5,
            py: 0.5,
            bgcolor: 'secondary.main',
            color: 'white',
            borderRadius: '6px',
            fontSize: '0.65rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 1,
            ...sx
        }}>
            {label}
        </Box>
    )
}
