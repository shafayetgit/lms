"use client";
import CTextField from "@/components/ui/CTextField";
import React, { useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Chip,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Grid,
  alpha,
  useTheme,
  Avatar
} from "@mui/material";
import {
  Download as DownloadIcon,
  ReceiptLong as ReceiptLongIcon,
  FilterList as FilterIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
  SearchOutlined,
  ArrowForward,
  MoreVert
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import StudentLayout from "../StudentLayout";
import CButton from "@/components/ui/CButton";
import NeuralPanel from "@/components/ui/NeuralPanel";

const ordersData = [
  {
    id: "ORD-1001",
    courseTitle: "Advanced Financial Analysis & Investment Banking",
    price: 94.99,
    status: "Completed",
    paymentMethod: "Stripe",
    date: "21 September, 2025",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "ORD-1002",
    courseTitle: "Digital Marketing Masterclass & SEO Foundations",
    price: 79.99,
    status: "Pending",
    paymentMethod: "PayPal",
    date: "01 October, 2025",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "ORD-1003",
    courseTitle: "Machine Learning for Modern Finance & Trading",
    price: 129.99,
    status: "Completed",
    paymentMethod: "Stripe",
    date: "15 August, 2025",
    image: "https://images.unsplash.com/photo-1551288049-bbbda5366391?auto=format&fit=crop&q=80&w=400"
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

export default function MyOrdersPage() {
  const [filter, setFilter] = useState("");
  const theme = useTheme();

  const filteredOrders =
    filter === "" ? ordersData : ordersData.filter((o) => o.status === filter);

  const getStatusChip = (status) => {
    const isCompleted = status === "Completed";
    return (
      <Chip
        label={status}
        size="small"
        sx={{
          fontWeight: 900,
          fontSize: '0.65rem',
          bgcolor: isCompleted ? alpha(theme.palette.secondary.main, 0.1) : alpha('#FFB000', 0.1),
          color: isCompleted ? "secondary.main" : "#FFB000",
          px: 1,
          borderRadius: "6px",
          height: 24,
          textTransform: 'uppercase',
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
        {/* Header & Filter Bar */}
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
              Order Ledger
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: -0.5 }}>
              A high-fidelity record of your academic acquisitions and investments.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
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
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>Search transaction ID...</Typography>
            </Box>
            <CTextField
              select
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.03)', border: 'none' } }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </CTextField>
          </Box>
        </Box>

        {/* Orders List */}
        <Stack spacing={3}>
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => (
              <motion.div key={order.id} variants={itemVariants} layout transition={{ duration: 0.4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 0,
                    borderRadius: '28px',
                    border: "1px solid rgba(0,0,0,0.06)",
                    bgcolor: "rgba(255, 255, 255, 0.6) !important",
                    backdropFilter: "blur(10px)",
                    overflow: 'hidden',
                    position: 'relative',
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: alpha(theme.palette.secondary.main, 0.2),
                      transform: "translateY(-4px)",
                      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.08)"
                    }
                  }}
                >
                  <NeuralPanel particleCount={15} opacity={0.03} />
                  <Grid container spacing={0} alignItems="stretch">
                    {/* Media & Info */}
                    <Grid size={{ xs: 12, md: 7 }}>
                      <Stack direction="row" spacing={4} sx={{ p: 3 }} alignItems="center">
                        <Box sx={{ position: 'relative', width: { xs: 80, sm: 140 }, height: { xs: 60, sm: 100 }, flexShrink: 0 }}>
                          <Box
                            component="img"
                            src={order.image}
                            alt={order.courseTitle}
                            sx={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '16px',
                              objectFit: 'cover',
                              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            }}
                          />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', letterSpacing: 1 }}>
                              #{order.id}
                            </Typography>
                            {getStatusChip(order.status)}
                          </Stack>
                          <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2, color: 'primary.main', mb: 1 }}>
                            {order.courseTitle}
                          </Typography>
                          <Stack direction="row" spacing={3} alignItems="center">
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <EventIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>{order.date}</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <PaymentIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>{order.paymentMethod}</Typography>
                            </Stack>
                          </Stack>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Financials & Actions */}
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Box sx={{
                        height: '100%',
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.02))',
                        borderLeft: { md: '1px solid rgba(0,0,0,0.04)' }
                      }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', display: 'block', mb: 0.5 }}>INVESTMENT</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -1 }}>
                            ${order.price.toFixed(2)}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1.5}>
                          <CButton
                            variant="contained"
                            color="secondary"
                            label="Review Receipt"
                            sx={{ borderRadius: '14px', py: 1.2, fontWeight: 900, px: 3 }}
                          />
                          <IconButton sx={{ bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '14px' }}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredOrders.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Box sx={{
                py: 15,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: 'rgba(0,0,0,0.01)',
                borderRadius: '40px',
                border: '2px dashed rgba(0,0,0,0.05)',
                mt: 4
              }}>
                <Avatar sx={{ width: 100, height: 100, bgcolor: alpha(theme.palette.secondary.main, 0.1), mb: 4 }}>
                  <ReceiptLongIcon sx={{ fontSize: 50, color: 'secondary.main' }} />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: 'primary.main' }}>No Records Found</Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", mb: 5, textAlign: "center", maxWidth: 450 }}>
                  We couldn't find any transaction history matching your criteria. Explore our courses to start your journey.
                </Typography>
                <CButton
                  label="Explore Full Catalog"
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: "50px", px: 6, py: 2 }}
                />
              </Box>
            </motion.div>
          )}
        </Stack>
      </Box>
    </StudentLayout>
  );
}
