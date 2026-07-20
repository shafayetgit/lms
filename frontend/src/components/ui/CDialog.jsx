import {
  Dialog,
  DialogContent,
  useMediaQuery,
  IconButton,
  Box,
  Divider,
  Stack,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import CloseIcon from "@mui/icons-material/Close"
import CButton from "./CButton"
import { usePermissions } from "@/hooks/usePermissions"

export default function CDialog({
  children,
  btnProps,
  title,
  dialogSx = {},
  maxWidth = "sm",
  open,
  handleCDialogClose,
  handleCDialogOpen,
  resource,
  action = "create",
}) {
  const { can } = usePermissions()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))

  if (resource && !can(resource, action)) return null

  return (
    <>
      {btnProps && <CButton onClick={handleCDialogOpen} {...btnProps} />}

      <Dialog
        fullScreen={isMobile}
        maxWidth={maxWidth}
        fullWidth
        open={open}
        onClose={handleCDialogClose}
        sx={{
          ...dialogSx,
        }}
        PaperProps={{
          sx: { borderRadius: 1 }
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, sm: 3 },
            py: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <IconButton onClick={handleCDialogClose} sx={{ color: "text.secondary" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent
          sx={{
            // p: { xs: 2, sm: 4 },
            bgcolor: "background.default",
          }}
        >
          {children}
        </DialogContent>
      </Dialog>
    </>
  )
}
