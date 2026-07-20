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

// Initial sample items
const initialCartItems = [
  {
    id: 1,
    name: "Classic Black T-Shirt Cla  ",
    price: 29.99,
    quantity: 2,
    image: "/images/tshirt-black.jpg",
  },
  {
    id: 2,
    name: "Eco Leather Backpack",
    price: 69.5,
    quantity: 1,
    image: "/images/backpack.jpg",
  },
  {
    id: 3,
    name: "White Sneakers",
    price: 89.0,
    quantity: 1,
    image: "/images/sneakers.jpg",
  },
]

export default function CartDrawer() {
  const [open, setOpen] = useState(false)
  const [cart_items, setCartItems] = useState(initialCartItems)

  const toggleDrawer = state => () => setOpen(state)

  const handleQuantityChange = (id, delta) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    )
  }

  const handleRemoveItem = id => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const handleClearCart = () => {
    setCartItems([])
  }

  const total = cart_items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <>
      <IconButton color="primary" onClick={toggleDrawer(true)}>
        <Badge badgeContent={4} color="primary">
          <ShoppingCartOutlinedIcon color="action" fontSize="large" />
        </Badge>
      </IconButton>

      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)} sx={{ zIndex: 1300 }}>
        <Box
          sx={{
            width: {xs: "100vw", sm: 400},
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

          {/* <Divider /> */}

          {/* Cart Items */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            {cart_items.length > 0 ? (
              cart_items.map(item => (
                <Box
                  key={item.id}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  mb={2}
                  p={1.5}
                  borderRadius={2}
                  bgcolor="background.paper"
                  boxShadow={1}
                >
                  <Avatar src={item.image} variant="rounded" sx={{ width: 56, height: 56 }} />
                  <Box flex={1}>
                    <Typography fontWeight="medium">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${item.price.toFixed(2)}
                    </Typography>
                    <Stack direction="row" alignItems="center" mt={1} spacing={1}>
                      <IconButton size="small" onClick={() => handleQuantityChange(item.id, -1)}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => handleQuantityChange(item.id, 1)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                  <IconButton color="error" size="small" onClick={() => handleRemoveItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">Your cart is empty.</Typography>
            )}
          </Box>

          <Divider />

          {/* Footer */}
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                ${total.toFixed(2)}
              </Typography>
            </Stack>

            <Stack spacing={1} mt={2}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={handleClearCart}
                disabled={cart_items.length === 0}
              >
                Clear Cart
              </Button>
              <Button fullWidth variant="outlined" color="primary">
                View Cart
              </Button>
              <Button fullWidth variant="contained" color="primary">
                Checkout
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}
