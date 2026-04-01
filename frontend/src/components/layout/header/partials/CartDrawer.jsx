"use client";

import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Button,
  Avatar,
  Badge,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useDispatch, useSelector } from "react-redux";
// import {
//   increaseQuantity,
//   decreaseQuantity,
//   removeFromCart,
//   clearCart,
// } from "@/app/store/cart/_features/cartSlice"
import CButton from "@/components/CButton";
import Link from "next/link";

export default function CartDrawer() {
  const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL;
  const [open, setOpen] = useState(false);
  // const dispatch = useDispatch()

  // const { cart_items, subtotal, total_quantity } = useSelector(
  //   state => state.store_cart_slice
  // )
  const cart_items = [];
  const subtotal = 0;
  const total_quantity = 0;
  const toggleDrawer = (state) => () => setOpen(state);

  const handleQuantityChange = (vendorId, id, delta) => {
    if (delta === 1) dispatch(increaseQuantity({ vendor_id: vendorId, id }));
    else dispatch(decreaseQuantity({ vendor_id: vendorId, id }));
  };

  const handleRemoveItem = (vendorId, id) => {
    dispatch(removeFromCart({ vendor_id: vendorId, id }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const renderCartItems = () => {
    if (!cart_items || cart_items.length === 0) {
      return (
        <Box
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          textAlign="center"
          sx={{ color: "text.secondary", opacity: 0.8 }}
        >
          <ShoppingCartOutlinedIcon
            sx={{ fontSize: 64, mb: 1, color: "text.disabled" }}
          />
          <Typography variant="h6" fontWeight="medium">
            Your cart is empty
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Add some items to get started
          </Typography>
        </Box>
      );
    }

    return cart_items.map(({ vendor, items }, p_index) => (
      <Box key={p_index} mb={2}>
        <Typography variant="subtitle2" fontWeight="bold">
          Vendor: {vendor.store_name}
        </Typography>
        <Typography variant="caption" fontWeight="bold" mb={1}>
          Shipping Method: {vendor.shipping_method.name} | Charge: $
          {vendor.shipping_method.price}
        </Typography>
        {items.map((item, index) => (
          <Box
            key={index}
            display="flex"
            alignItems="center"
            gap={2}
            py={2}
            px={1}
            sx={{ borderBottom: "1px dashed", borderColor: "divider" }}
          >
            <Avatar
              src={
                item.thumbnail || item.images?.[0]
                  ? `${APP_BASE_URL}/${item.thumbnail || item.images[0]}`
                  : ""
              }
              variant="rounded"
              sx={{ width: 64, height: 64, bgcolor: "grey.100" }}
            />
            <Box flex={1} overflow="hidden">
              <Typography fontWeight={600} fontSize="0.95rem" noWrap>
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.3}>
                ${item.current_price} × {item.quantity}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(vendor.id, item.id, -1)}
                  sx={{ border: "1px solid", borderColor: "divider", p: 0.5 }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography fontWeight={500}>{item.quantity}</Typography>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(vendor.id, item.id, 1)}
                  sx={{ border: "1px solid", borderColor: "divider", p: 0.5 }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
            <IconButton
              size="small"
              onClick={() => handleRemoveItem(vendor.id, item.id)}
              sx={{ color: "text.disabled" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    ));
  };

  return (
    <>
      <IconButton
        onClick={toggleDrawer(true)}
        sx={{
          transition: "all 0.2s ease",
          "&:hover": { transform: "translateY(-2px)", color: "secondary.main" }
        }}
      >
        <Badge
          badgeContent={total_quantity}
          color="secondary"
          sx={{
            "& .MuiBadge-badge": {
              fontWeight: 800,
              fontSize: "0.7rem"
            }
          }}
        >
          <ShoppingCartOutlinedIcon sx={{ fontSize: 26 }} />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        sx={{ zIndex: 1300 }}
      >
        <Box
          sx={{
            width: { xs: "100vw", sm: 400 },
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Your Cart
            </Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            {renderCartItems()}
          </Box>

          {total_quantity > 0 && (
            <>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total:
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    ${(subtotal || 0).toFixed(2)}
                  </Typography>
                </Stack>

                <Stack spacing={1} mt={2}>
                  <CButton
                    label="Clear Cart"
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={handleClearCart}
                  />

                  <Button
                    component={Link}
                    href="/store/cart"
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => setOpen(false)}
                  >
                    View Cart
                  </Button>

                  <CButton
                    label="Checkout"
                    component={Link}
                    href="/store/cart/checkout"
                    onClick={() => setOpen(false)}
                    fullWidth
                    variant="contained"
                    color="primary"
                  />
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}
