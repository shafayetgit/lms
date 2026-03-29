"use client"

import React, { useState } from "react"
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
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import DeleteIcon from "@mui/icons-material/Delete"

import { useDispatch, useSelector } from "react-redux"
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} from "@/app/store/product/_features/productCartSlice" // adjust path if needed
import CButton from "@/components/CButton"
import Link from "next/link"

export default function CartDrawer() {
  const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()
  const cart_items = useSelector(state => state.store_product_cart_slice.cart_items)
  const total_quantity = useSelector(state => state.store_product_cart_slice.total_quantity)
  const totalAmount = useSelector(state => state.store_product_cart_slice.totalAmount)

  const toggleDrawer = state => () => setOpen(state)

  const handleQuantityChange = (id, delta) => {
    if (delta === 1) dispatch(increaseQuantity({ id }))
    else dispatch(decreaseQuantity({ id }))
  }

  const handleRemoveItem = id => {
    dispatch(removeFromCart({ id }))
  }

  const handleClearCart = () => {
    dispatch(clearCart())
  }

  return (
    <>
      <IconButton color="primary" onClick={toggleDrawer(true)}>
        <Badge badgeContent={total_quantity} color="primary">
          <ShoppingCartOutlinedIcon color="action" fontSize="large" />
        </Badge>
      </IconButton>

      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)} sx={{ zIndex: 1300 }}>
        <Box
          sx={{
            width: { xs: "100vw", sm: 400 },
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Header */}
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

          {/* Cart Items */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            {cart_items.length > 0 ? (
              cart_items.map(item => (
                <Box
                  key={item.id}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  py={2}
                  px={1}
                  sx={{
                    borderBottom: "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  <Avatar
                    src={`${APP_BASE_URL}/${item.thumbnail || item.images[0]}`}
                    variant="rounded"
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: "grey.100",
                    }}
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
                        onClick={() => handleQuantityChange(item.id, -1)}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          p: 0.5,
                        }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>

                      <Typography fontWeight={500}>{item.quantity}</Typography>

                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          p: 0.5,
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => handleRemoveItem(item.id)}
                    sx={{ color: "text.disabled" }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))
            ) : (
              <Box
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                textAlign="center"
                sx={{ color: "text.secondary", opacity: 0.8 }}
              >
                <ShoppingCartOutlinedIcon sx={{ fontSize: 64, mb: 1, color: "text.disabled" }} />
                <Typography variant="h6" fontWeight="medium">
                  Your cart is empty
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Add some items to get started
                </Typography>
              </Box>
            )}
          </Box>

          {cart_items.length !== 0 && (
            <>
              <Divider />

              {/* Footer */}
              <Box sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total:
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    ${totalAmount.toFixed(2)}
                  </Typography>
                </Stack>

                <Stack spacing={1} mt={2}>
                  <CButton
                    label="Clear Cart"
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={handleClearCart}
                    disabled={cart_items.length === 0}
                  />

                  <Button
                    label="View Cart"
                    component={Link}
                    href="/store/product/cart"
                    fullWidth
                    variant="outlined"
                    color="primary"
                    disabled={cart_items.length === 0}
                    onClick={() => setOpen(false)}
                  >
                    View Cart
                  </Button>
                  <CButton
                    label="Checkout"
                    component={Link}
                    href="/store/product/checkout"
                    onClick={() => setOpen(false)}
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={cart_items.length === 0}
                  />
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </>
  )
}
