"use client"

import { useState } from "react"
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
} from "@mui/material"

export default function CButton({
  label,
  size = "small",
  onClick,
  sx,
  icon,
  tooltip,
  iconButton = false,
  variant = "contained",
  yesNo = false,
  yesNoText = "",
  color = "primary",
  ...other
}) {
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    if (yesNo) {
      setOpen(true)
    } else {
      onClick?.()
    }
  }

  const handleConfirm = () => {
    setOpen(false)
    onClick?.()
  }

  const handleClose = () => {
    setOpen(false)
  }

  const ButtonContent = iconButton ? (
    <IconButton size={size} sx={sx} onClick={handleClick} color={color} {...other}>
      {icon}
    </IconButton>
  ) : (
    <Button
      size={size}
      color={color}
      variant={variant}
      sx={{ fontWeight: "bold", ...sx }}
      onClick={handleClick}
      {...other}
    >
      {label}
    </Button>
  )

  return (
    <>
      {tooltip ? (
        <Tooltip title={tooltip} followCursor>
          <Box component="span">{ButtonContent}</Box>
        </Tooltip>
      ) : (
        <Box component="span">{ButtonContent}</Box>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{yesNoText || `Are you sure you want to ${label}?`}</DialogTitle>
        <DialogContent>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 2 }}
          >
            <CButton label="No" onClick={handleClose} variant="outlined" />
            <CButton label="Yes" onClick={handleConfirm} color="error" autoFocus />
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}
