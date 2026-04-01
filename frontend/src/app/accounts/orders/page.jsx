"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Grid
} from "@mui/material";
import {
  Download as DownloadIcon,
  ReceiptLong as ReceiptLongIcon,
  FilterList as FilterIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
  AttachMoney as AmountIcon
} from "@mui/icons-material";
import AccountsLayout from "../AccountsLayout";
import CButton from "@/components/CButton";

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
    courseTitle: "Digital Marketing Masterclass & SEO",
    price: 79.99,
    status: "Pending",
    paymentMethod: "PayPal",
    date: "01 October, 2025",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "ORD-1003",
    courseTitle: "Machine Learning for Modern Finance",
    price: 129.99,
    status: "Completed",
    paymentMethod: "Stripe",
    date: "15 August, 2025",
    image: "https://images.unsplash.com/photo-1551288049-bbbda5366391?auto=format&fit=crop&q=80&w=400"
  },
];

export default function MyOrdersPage() {
  const [filter, setFilter] = useState("");

  const filteredOrders =
    filter === "" ? ordersData : ordersData.filter((o) => o.status === filter);

  const getStatusChip = (status) => {
    const isCompleted = status === "Completed";
    return (
      <Chip
        label={status}
        size="small"
        sx={{
          fontWeight: 800,
          fontSize: '0.7rem',
          bgcolor: isCompleted ? "secondary.main" : "rgba(255, 176, 0, 0.1)",
          color: isCompleted ? "white" : "#FFB000",
          px: 1,
          borderRadius: "6px",
          height: 24,
          textTransform: 'uppercase'
        }}
      />
    );
  };

  return (
    <AccountsLayout
      pageTitle="Purchase History"
      actionButton={
        <TextField
          select
          label="Filter Status"
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
          InputProps={{
            startAdornment: <FilterIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
          }}
        >
          <MenuItem value="">All Purchases</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
        </TextField>
      }
    >
      <Stack spacing={3}>
        {filteredOrders.map((order) => (
          <Paper
            key={order.id}
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 6,
              border: "1px solid",
              borderColor: "rgba(0,0,0,0.06)",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "primary.main",
                transform: "translateY(-4px)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.04)"
              }
            }}
          >
            <Grid container spacing={3} alignItems="center">
              {/* Product Info */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Box
                    component="img"
                    src={order.image}
                    alt={order.courseTitle}
                    sx={{
                      width: { xs: 80, sm: 100 },
                      height: { xs: 60, sm: 75 },
                      borderRadius: 3,
                      objectFit: 'cover',
                      display: { xs: 'none', sm: 'block' }
                    }}
                  />
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', opacity: 0.6 }}>
                        #{order.id}
                      </Typography>
                      {getStatusChip(order.status)}
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      {order.courseTitle}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Purchase Details */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={3}
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.02)',
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 4
                  }}
                >
                  <Stack spacing={0.5} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                      <EventIcon fontSize="inherit" /> {order.date}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                      <PaymentIcon fontSize="inherit" /> {order.paymentMethod}
                    </Typography>
                  </Stack>

                  <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}>
                      ${order.price.toFixed(2)}
                    </Typography>
                    <CButton
                      variant="outlined"
                      size="small"
                      label="Invoice"
                      startIcon={<DownloadIcon />}
                      sx={{ borderRadius: '50px', py: 0.5 }}
                    />
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        ))}

        {filteredOrders.length === 0 && (
          <Stack spacing={2} py={12} alignItems="center">
            <ReceiptLongIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.15 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={700}>
              No purchase records found.
            </Typography>
            <CButton
              label="Browse Courses"
              variant="contained"
              sx={{ borderRadius: '50px', mt: 2 }}
            />
          </Stack>
        )}
      </Stack>
    </AccountsLayout>
  );
}
