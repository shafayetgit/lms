"use client";
import { motion } from "framer-motion";
import { Save } from "@mui/icons-material";
import { Fab } from "@mui/material";
import {
  Box,
  Stack,
  Paper,
  useTheme,
  useMediaQuery,
  Typography,
  alpha,
} from "@mui/material";
import CButton from "./CButton";

export default function CForm({
  children,
  onSubmit,
  width = "40rem",
  title = "",
  btnProps,
  alignBtn = "end",
  floatingButton = false,
  sx = {},
  dialog = false,
}) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { loading, ...fabProps } = btnProps || {};

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        width: isSmallScreen ? "100%" : dialog ? "100%": width,
        maxWidth: "100%",
        overflowX: "hidden",
        ...(!dialog && {
          borderRadius: 0,
          boxShadow: "none",
          bgcolor: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: "blur(20px)",
          borderColor: alpha(theme.palette.divider, 0.08),
        }),
        pt: 1,
        ...sx,
      }}
      encType="multipart/form-data"
    >
      <Stack spacing={isSmallScreen ? 3 : 5}>
        {title && (
          <Box textAlign="center" mb={{ xs: 2, md: 3 }}>
            <Typography
              variant={isSmallScreen ? "h6" : "h5"}
              color="text.primary"
              sx={{
                fontWeight: 800,
                letterSpacing: 1,
                position: "relative",
                display: "inline-block",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: 0,
                  right: 0,
                  height: "4px",
                  bgcolor: "primary.main",
                  borderRadius: "4px",
                },
              }}
            >
              {title}
            </Typography>
          </Box>
        )}

        {children}
      </Stack>

      {/* Normal button (hidden if floating) */}
      {!floatingButton && onSubmit && (
        <Stack
          mt={4}
          direction="row"
          justifyContent={
            alignBtn === "end"
              ? "flex-end"
              : alignBtn === "center"
                ? "center"
                : "flex-start"
          }
        >
          <CButton
            type="submit"
            label={btnProps?.label || "Save"}
            action="save"
            fullWidth={isSmallScreen}
            {...btnProps}
          />
        </Stack>
      )}

      {/* Floating sticky button */}
      {floatingButton && (
        <motion.div
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: "fixed",
            bottom: isSmallScreen ? 20 : 32,
            right: isSmallScreen ? 20 : 32,
            zIndex: 1100,
          }}
        >
          <Fab
            type="submit"
            color="primary"
            disabled={loading}
            sx={{
              boxShadow: (theme) =>
                `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
              width: isSmallScreen ? 56 : 64,
              height: isSmallScreen ? 56 : 64,
            }}
            {...fabProps}
          >
            <Save fontSize={isSmallScreen ? "medium" : "large"} />
          </Fab>
        </motion.div>
      )}
    </Box>
  );
}
