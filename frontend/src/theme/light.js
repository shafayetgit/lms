"use client"

import { createTheme, responsiveFontSizes, alpha } from "@mui/material/styles"

const COLORS = {
  black: "#000000",
  blackLight: "#333333",
  blackDark: "#000000",
  white: "#FFFFFF",
  background: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#4B5563",
}

const UncheckedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="0.75"
      y="0.75"
      width="12.5"
      height="12.5"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
)

const CheckedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="14" height="14" rx="3" fill="currentColor" />
    <path
      d="M4 7L6 9L10 4.5"
      stroke="#FFFFFF"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

let light = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: COLORS.black,
      light: COLORS.blackLight,
      dark: COLORS.blackDark,
      contrastText: COLORS.white,
    },
    secondary: {
      main: COLORS.blackLight,
      light: "#666666",
      dark: COLORS.blackDark,
      contrastText: COLORS.white,
    },
    success: { main: "#16A34A" },
    info: { main: "#2563EB" },
    warning: { main: "#F59E0B" },
    error: { main: "#DC2626" },

    background: {
      default: COLORS.background,
      paper: COLORS.white,
    },
    text: {
      primary: COLORS.textPrimary,
      secondary: COLORS.textSecondary,
    },
    divider: alpha(COLORS.black, 0.08),

    // Custom colors
    custom: {
      brand: {
        black: COLORS.black,
      },
      gradients: {
        primary: "linear-gradient(135deg, #000000 0%, #333333 100%)",
        secondary: "linear-gradient(135deg, #333333 0%, #666666 100%)",
        subtle: "linear-gradient(135deg, #F6F8FB 0%, #FFFFFF 100%)",
      },
      sidebar: {
        bg: COLORS.white,
        activeBg: alpha(COLORS.black, 0.1),
        activeText: COLORS.black,
        hoverBg: alpha(COLORS.black, 0.05),
      },
      card: {
        border: alpha(COLORS.black, 0.08),
        shadow: alpha(COLORS.black, 0.08),
        hoverShadow: alpha(COLORS.black, 0.14),
      },
      table: {
        headBg: "#EEF2FF",
        rowHover: alpha(COLORS.black, 0.03),
      },
    },
  },

  typography: {
    fontFamily: 'var(--font-dm-sans), var(--font-hind-siliguri), "Segoe UI", system-ui, sans-serif',
    fontSize: 13,

    h1: { fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.2, color: COLORS.black },
    h2: { fontWeight: 700, fontSize: "2rem", lineHeight: 1.25, color: COLORS.black },
    h3: { fontWeight: 600, fontSize: "1.5rem", lineHeight: 1.3, color: COLORS.black },
    h4: { fontWeight: 600, fontSize: "1.25rem", color: COLORS.black },
    h5: { fontWeight: 600, fontSize: "1.125rem", color: COLORS.black },
    h6: { fontWeight: 600, fontSize: "1rem", color: COLORS.black },
    subtitle1: { fontWeight: 500, fontSize: "1rem", color: COLORS.black },
    subtitle2: { fontWeight: 500, fontSize: "0.875rem", color: COLORS.blackLight },
    body1: { fontSize: "1rem", lineHeight: 1.7, color: COLORS.textPrimary },
    body2: { fontSize: "0.875rem", lineHeight: 1.6, color: COLORS.textSecondary },
    button: { fontWeight: 600, fontSize: "0.875rem", textTransform: "none" },
    caption: { color: "#6B7280" },
  },

  shape: {
    borderRadius: 10,
  },

  components: {
    MuiCheckbox: {
      defaultProps: {
        icon: <UncheckedIcon />,
        checkedIcon: <CheckedIcon />,
        size: "small",
      },
      styleOverrides: {
        root: {
          padding: 4,
          color: "inherit",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: COLORS.background,
          color: COLORS.textPrimary,
        },
        "::selection": {
          background: alpha(COLORS.black, 0.2),
          color: COLORS.black,
        },
        ".Toastify__toast": {
          minHeight: "44px !important",
          paddingTop: "6px !important",
          paddingBottom: "6px !important",
          paddingLeft: "12px !important",
          paddingRight: "12px !important",
          fontSize: "0.8rem !important",
          fontFamily: "inherit !important",
          backgroundColor: "#FFFFFF !important",
          color: "#111827 !important",
          border: "1px solid rgba(0, 0, 0, 0.08) !important",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08) !important",
        },
        ".Toastify__toast-body": {
          paddingTop: "3px !important",
          paddingBottom: "3px !important",
        },
        ".Toastify__toast-icon": {
          width: "16px !important",
          height: "16px !important",
          marginRight: "6px !important",
        },
        ".Toastify__toast-icon svg": {
          width: "16px !important",
          height: "16px !important",
        },
        ".Toastify__close-button": {
          width: "14px !important",
          height: "14px !important",
          minWidth: "14px !important",
          alignSelf: "center !important",
          color: "#111827 !important",
          opacity: "0.6 !important",
          "&:hover": {
            opacity: "1 !important",
          },
        },
        ".Toastify__close-button svg": {
          width: "10px !important",
          height: "10px !important",
        },
        ".Toastify__progress-bar": {
          height: "2px !important",
        },
        "*::-webkit-scrollbar": {
          width: 6,
          height: 6,
        },
        "*::-webkit-scrollbar-thumb": {
          background: alpha(COLORS.black, 0.2),
          borderRadius: 20,
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          lineHeight: 1.4,
          textTransform: "capitalize",
          transition: "all 0.2s ease",
        },
        sizeSmall: {
          fontSize: "0.78125rem",
          padding: "2.8px 12px",
          minHeight: 30,
        },
        sizeMedium: {
          fontSize: "0.85rem",
          padding: "4px 16px",
          minHeight: 34,
        },
        sizeLarge: {
          fontSize: "0.9375rem",
          padding: "5.6px 20px",
          minHeight: 40,
        },
        containedPrimary: {
          "&:hover": { background: COLORS.blackLight },
        },
        containedSecondary: {
          "&:hover": { background: COLORS.black },
        },
        outlinedPrimary: {
          borderColor: alpha(COLORS.black, 0.4),
          color: COLORS.black,
          "&:hover": {
            borderColor: COLORS.black,
            background: alpha(COLORS.black, 0.05),
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: "0.875rem",
          background: COLORS.white,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(COLORS.black, 0.15),
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(COLORS.black, 0.35),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: COLORS.black,
            borderWidth: 2,
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          color: COLORS.textSecondary,
          "&.Mui-focused": { color: COLORS.black },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${alpha(COLORS.black, 0.08)}`,
          boxShadow: `0 2px 10px ${alpha(COLORS.black, 0.04)}`,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 14,
          border: `1px solid ${alpha(COLORS.black, 0.06)}`,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: COLORS.white,
          color: COLORS.black,
          backgroundImage: "none",
          borderBottom: `1px solid ${alpha(COLORS.black, 0.08)}`,
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&:hover": { background: alpha(COLORS.black, 0.05) },
          "&.Mui-selected": {
            background: alpha(COLORS.black, 0.1),
            color: COLORS.black,
            "&:hover": { background: alpha(COLORS.black, 0.15) },
          },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: {
          background: COLORS.black,
          height: 3,
          borderRadius: "10px 10px 0 0",
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          color: COLORS.textSecondary,
          "&.Mui-selected": {
            color: COLORS.black,
            fontWeight: 600,
          },
        },
      },
    },

    MuiChip: {
      variants: [
        {
          props: { color: "success" },
          style: {
            backgroundColor: "rgba(33, 150, 243, 0.12)",
            color: "#4caf50",
          },
        },
        {
          props: { color: "error" },
          style: {
            backgroundColor: "rgba(211, 47, 47, 0.15)",
            color: "#ef5350",
          },
        },
      ],
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            background: "#F1F5F9",
            color: COLORS.black,
            fontWeight: 600,
          },
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { background: alpha(COLORS.black, 0.03) },
        },
      },
    },

    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: {
          background: COLORS.black,
          color: COLORS.white,
          borderRadius: 8,
          fontSize: "0.75rem",
        },
        arrow: { color: COLORS.black },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          border: `1px solid ${alpha(COLORS.black, 0.08)}`,
          boxShadow: `0 20px 50px ${alpha(COLORS.black, 0.16)}`,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: alpha(COLORS.black, 0.08) },
      },
    },
  },

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
})

light = responsiveFontSizes(light)

export default light
