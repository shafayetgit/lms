"use client";

import React, { useState } from "react";

import {
  Box,
  Typography,
  InputAdornment,
  IconButton,
  LinearProgress,
  Stack,
  Grid,
  TextField,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import {
  checkPasswordRequirements,
  checkPasswordStrength,
} from "@/utils/password";

const CPasswordField = ({
  value = "",
  fullWidth = true,
  size = "large",
  showStrengthIndicator = false,
  showRequirements = false,
  requirementsTitle = "Password must contain:",
  strengthLabel = "Password Strength:",
  sx = {},
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Calculate password strength and requirements
  const passwordStrength = checkPasswordStrength(value);
  const passwordRequirements = checkPasswordRequirements(value);

  return (
    <>
      <TextField
        type={showPassword ? "text" : "password"}
        value={value}
        fullWidth={fullWidth}
        size={size}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                  tabIndex={-1}
                  size="small"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
          inputLabel: {
            sx: {
              "& .MuiInputLabel-asterisk": {
                color: "error.main",
              },
            },
          },
        }}
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 }, ...sx }}
        {...rest}
      />

      {showStrengthIndicator && value && (
        <Box sx={{ mt: 1, mb: showRequirements ? 1 : 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              {strengthLabel}
            </Typography>
            <Typography
              variant="caption"
              fontWeight="bold"
              color={`${passwordStrength.color}.main`}
            >
              {passwordStrength.label}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={passwordStrength.percentage}
            color={passwordStrength.color}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.1),
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
              },
            }}
          />
        </Box>
      )}

      {showRequirements && (isFocused || value) && (
        <Box
          sx={{
            mt: 1,
            p: 1.5,
            // bgcolor: (theme) =>
            //   theme.palette.mode === "dark"
            //     ? alpha(theme.palette.text.primary, 0.04)
            //     : "grey.50",
            borderRadius: 1,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mb: 1 }}
          >
            {requirementsTitle}
          </Typography>
          <Grid container spacing={1}>
            <Grid size={6}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {passwordRequirements.minLength ? (
                  <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                ) : (
                  <CancelIcon color="error" sx={{ fontSize: 16 }} />
                )}
                <Typography
                  variant="caption"
                  color={
                    passwordRequirements.minLength
                      ? "success.main"
                      : "error.main"
                  }
                >
                  At least 8 characters
                </Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {passwordRequirements.hasLowercase ? (
                  <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                ) : (
                  <CancelIcon color="error" sx={{ fontSize: 16 }} />
                )}
                <Typography
                  variant="caption"
                  color={
                    passwordRequirements.hasLowercase
                      ? "success.main"
                      : "error.main"
                  }
                >
                  One lowercase letter
                </Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {passwordRequirements.hasUppercase ? (
                  <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                ) : (
                  <CancelIcon color="error" sx={{ fontSize: 16 }} />
                )}
                <Typography
                  variant="caption"
                  color={
                    passwordRequirements.hasUppercase
                      ? "success.main"
                      : "error.main"
                  }
                >
                  One uppercase letter
                </Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {passwordRequirements.hasNumber ? (
                  <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                ) : (
                  <CancelIcon color="error" sx={{ fontSize: 16 }} />
                )}
                <Typography
                  variant="caption"
                  color={
                    passwordRequirements.hasNumber
                      ? "success.main"
                      : "error.main"
                  }
                >
                  One number
                </Typography>
              </Stack>
            </Grid>
            <Grid size={12}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {passwordRequirements.hasSpecial ? (
                  <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                ) : (
                  <CancelIcon color="error" sx={{ fontSize: 16 }} />
                )}
                <Typography
                  variant="caption"
                  color={
                    passwordRequirements.hasSpecial
                      ? "success.main"
                      : "error.main"
                  }
                >
                  One special character (!@#$%^&*)
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  );
};

CPasswordField.displayName = "CPasswordField";

export default CPasswordField;
