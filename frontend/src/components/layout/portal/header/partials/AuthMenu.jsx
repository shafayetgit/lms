"use client"

import React from "react"
import Link from "next/link"
import { Menu, MenuItem, Divider } from "@mui/material"
import { Login, PersonAdd, LightModeOutlined, DarkModeOutlined } from "@mui/icons-material"
import { useDispatch, useSelector } from "react-redux"
import { toggleTheme } from "@/features/app/appSlice"

export default function AuthMenu({ anchorElAuth, authMenuOpen, handleAuthMenuClose }) {
  const dispatch = useDispatch()
  const mode = useSelector(state => state.app?.mode || "light")

  return (
    <Menu
      anchorEl={anchorElAuth}
      open={authMenuOpen}
      onClose={handleAuthMenuClose}
      onClick={handleAuthMenuClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            overflow: "visible",
            boxShadow: "none",
            mt: 1.5,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
              borderLeft: "1px solid",
              borderTop: "1px solid",
              borderColor: "divider",
            },
          },
        },
      }}
    >
      <MenuItem
        onClick={handleAuthMenuClose}
        component={Link}
        href="/auth/sign-in"
        sx={{ py: 1, px: 2, fontWeight: 700, fontSize: "0.875rem", mx: 0.5, borderRadius: 1 }}
      >
        <Login
          sx={{
            mr: 1.5,
            fontSize: "1.2rem",
            color: "text.secondary",
          }}
        />{" "}
        Sign In
      </MenuItem>
      <Divider sx={{ my: 0.5, mx: 1, opacity: 0.5 }} />
      <MenuItem
        onClick={handleAuthMenuClose}
        component={Link}
        href="/auth/sign-up"
        sx={{ py: 1, px: 2, fontWeight: 700, fontSize: "0.875rem", mx: 0.5, borderRadius: 1 }}
      >
        <PersonAdd
          sx={{
            mr: 1.5,
            fontSize: "1.2rem",
            color: "text.secondary",
          }}
        />{" "}
        Sign Up
      </MenuItem>
      <Divider sx={{ my: 0.5, mx: 1, opacity: 0.5 }} />
      <MenuItem
        onClick={() => {
          dispatch(toggleTheme())
          handleAuthMenuClose()
        }}
        sx={{ py: 1, px: 2, fontWeight: 700, fontSize: "0.875rem", mx: 0.5, borderRadius: 1 }}
      >
        {mode === "dark" ? (
          <LightModeOutlined
            sx={{
              mr: 1.5,
              fontSize: "1.2rem",
              color: "text.secondary",
            }}
          />
        ) : (
          <DarkModeOutlined
            sx={{
              mr: 1.5,
              fontSize: "1.2rem",
              color: "text.secondary",
            }}
          />
        )}
        {mode === "dark" ? "Light Mode" : "Dark Mode"}
      </MenuItem>
    </Menu>
  )
}
