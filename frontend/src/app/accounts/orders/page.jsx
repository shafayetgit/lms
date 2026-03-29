"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TablePagination,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DownloadIcon from "@mui/icons-material/Download";
import AccountsLayout from "../AccountsLayout";

const ordersData = [
  {
    id: "ORD-1001",
    courseTitle: "Advanced Financial Analysis & Investment Banking",
    price: 94.99,
    status: "Completed",
    paymentMethod: "Stripe",
    date: "2025-09-21",
  },
  {
    id: "ORD-1002",
    courseTitle: "Digital Marketing Masterclass",
    price: 79.99,
    status: "Pending",
    paymentMethod: "PayPal",
    date: "2025-10-01",
  },
  {
    id: "ORD-1003",
    courseTitle: "Machine Learning for Finance",
    price: 129.99,
    status: "Completed",
    paymentMethod: "Stripe",
    date: "2025-08-15",
  },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function MyOrdersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [filter, setFilter] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("date");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredOrders =
    filter === "" ? ordersData : ordersData.filter((o) => o.status === filter);

  const sortedOrders = [...filteredOrders].sort(getComparator(order, orderBy));

  const paginatedOrders = sortedOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <AccountsLayout
      pageTitle="My Orders"
      actionButton={
        <Box >
          <TextField
            select
            label="Filter by Status"
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </TextField>
        </Box>
      }
    >
      {!isMobile ? (
        <TableContainer sx={{ borderRadius: 3, boxShadow: 1 }}>
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
              <TableRow>
                {[
                  { id: "id", label: "Order ID" },
                  { id: "courseTitle", label: "Course Title" },
                  { id: "date", label: "Date" },
                  { id: "status", label: "Status" },
                  { id: "price", label: "Amount" },
                  { id: "paymentMethod", label: "Payment" },
                ].map((col) => (
                  <TableCell key={col.id}>
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => handleSort(col.id)}
                    >
                      <strong>{col.label}</strong>
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="right">
                  <strong>Action</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.courseTitle}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={
                        order.status === "Completed" ? "success" : "warning"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>${order.price}</TableCell>
                  <TableCell>{order.paymentMethod}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                    >
                      Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {paginatedOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" py={2}>
                      No orders found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={filteredOrders.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      ) : (
        <Box>
          {paginatedOrders.map((order) => (
            <Paper
              key={order.id}
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 3,
                boxShadow: 1,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {order.id}
              </Typography>
              <Typography variant="h6" mt={1}>
                {order.courseTitle}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Date: {order.date}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payment: {order.paymentMethod}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Amount: ${order.price}
              </Typography>
              <Box
                mt={1}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Chip
                  label={order.status}
                  color={
                    order.status === "Completed" ? "success" : "warning"
                  }
                  size="small"
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                >
                  Invoice
                </Button>
              </Box>
            </Paper>
          ))}

          {paginatedOrders.length === 0 && (
            <Typography align="center" color="text.secondary" py={2}>
              No orders found.
            </Typography>
          )}

          <TablePagination
            component="div"
            count={filteredOrders.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Box>
      )}
    </AccountsLayout>
  );
}
