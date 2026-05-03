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
import {
  Add,
  Edit,
  Delete,
  Save,
  Print,
  Send,
  Email,
  Visibility,
  VisibilityOff,
  Download,
  Upload,
  Search,
  Refresh,
  Check,
  Close,
  Cancel,
  ArrowBack,
  ArrowForward,
  Settings,
  Info,
  Warning,
  FileCopy,
  List,
  Lock,
  // Unlock,
  CloudUpload,
  CloudDownload,
  LockOpen,
  TrackChanges,
  Article,
  RequestQuote,
  CurrencyExchange,
  Login,
  Logout,
  LocalShipping,
  HowToReg,
} from "@mui/icons-material"

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
  action = null,
  ...other
}) {
  const [open, setOpen] = useState(false)

  // 🔹 Map actions to icons
  const getActionIcon = () => {
    switch (action?.toLowerCase()) {
      // CRUD
      case "add":
      case "create":
      case "new":
        return <Add />
      case "edit":
      case "update":
        return <Edit />
      case "delete":
      case "remove":
      case "destroy":
        return <Delete />
      case "save":
        return <Save />
      case "track":
      case "tracking":
        return <LocalShipping />
      case "log":
      case "logs":
      case "report":
        return <Article />
      case "invoice":
      case "billing":
      case "bill":
        return <RequestQuote />
      case "refund":
      case "return":
        return <CurrencyExchange />
      case "login":
      case "sign-in":
      case "signin":
        return <Login />
      case "logout":
      case "sign-out":
      case "signout":
        return <Logout />
      case "sign-up":
        return <HowToReg />
      case "submit":
        return <ArrowForward />
        
      // File / Print / Upload / Download
      case "print":
        return <Print />
      case "upload":
        return <Upload />
      case "cloud-upload":
        return <CloudUpload />
      case "download":
        return <Download />
      case "cloud-download":
        return <CloudDownload />
      case "copy":
      case "duplicate":
        return <FileCopy />

      // Communication
      case "send":
      case "email":
      case "mail":
        return <Send />
      case "message":
        return <Email />

      // Navigation
      case "back":
        return <ArrowBack />
      case "next":
      case "forward":
        return <ArrowForward />

      // State / Action
      case "view":
      case "show":
        return <Visibility />
      case "hide":
        return <VisibilityOff />
      case "search":
        return <Search />
      case "refresh":
      case "reload":
        return <Refresh />
      case "confirm":
      case "approve":
      case "ok":
        return <Check />
      case "cancel":
      case "close":
        return <Cancel />
      case "lock":
        return <Lock />
      case "unlock":
        return <LockOpen />
      case "list":
      case "all":
        return <List />

      // Settings / Info / Warning
      case "settings":
      case "config":
        return <Settings />
      case "info":
        return <Info />
      case "warn":
      case "warning":
        return <Warning />

      default:
        return null
    }
  }

  const startIcon = icon || getActionIcon()

  const handleClick = event => {
    if (yesNo) setOpen(true)
    else onClick?.(event)
  }

  const handleConfirm = () => {
    setOpen(false)
    onClick?.()
  }

  const handleClose = () => setOpen(false)

  const ButtonContent = iconButton ? (
    <IconButton size={size} sx={sx} onClick={handleClick} {...other}>
      {startIcon}
    </IconButton>
  ) : (
    <Button
      size={size}
      variant={variant}
      sx={{ fontWeight: "bold", textTransform: "capitalize", ...sx }}
      onClick={handleClick}
      startIcon={startIcon}
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
