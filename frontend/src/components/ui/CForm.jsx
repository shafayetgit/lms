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
        // width: isSmallScreen ? "100%" : width,
        maxWidth: "100%",
        ...(!dialog && {
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 0, sm: 3 },
          boxShadow: isSmallScreen
            ? 0
            : theme.palette.patient?.generic?.shadow ||
              "0 8px 32px rgba(0,0,0,0.1)",
          bgcolor: "background.paper",
          mx: "auto",
          border: isSmallScreen ? "none" : "1px solid",
          borderColor: "divider",
        }),
        ...sx,
      }}
      encType="multipart/form-data"
    >
      <Stack spacing={isSmallScreen ? 2.5 : 4}>
        {title && (
          <Box textAlign="center" mb={{ xs: 2, sm: 4 }}>
            <Typography
              variant={isSmallScreen ? "h6" : "h5"}
              color="primary"
              sx={{
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 2,
                position: "relative",
                display: "inline-block",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: "20%",
                  right: "20%",
                  height: "3px",
                  bgcolor: "primary.main",
                  borderRadius: "2px",
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
