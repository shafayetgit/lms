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

export default function CDialog({
  children,
  btnProps,
  title,
  dialogSx = {},
  open,
  handleCDialogClose,
  handleCDialogOpen,
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <>
      <CButton onClick={handleCDialogOpen} {...btnProps} />

      <Dialog
        fullScreen={isMobile}
        // maxWidth="lg"
        fullWidth
        open={open}
        onClose={handleCDialogClose}
        sx={{
          // "& .MuiDialog-container": {
          //   alignItems: isMobile ? "flex-end" : "center",
          // },
          // "& .MuiPaper-root": {
          //   borderRadius: isMobile ? "20px 20px 0 0" : 3,
          //   margin: isMobile ? 0 : 2,
          //   maxHeight: isMobile ? "90vh" : "calc(100% - 64px)",
          //   transition: "all 0.3s ease-in-out",
          // },
          ...dialogSx,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
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
