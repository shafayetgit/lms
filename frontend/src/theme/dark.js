"use client"

import { createTheme, responsiveFontSizes, alpha } from "@mui/material/styles"

const COLORS = {
  navy: "#FFFFFF", // Primary color is pure white
  navyLight: "#E5E5E5", // Light gray
  navyDark: "#A3A3A3", // Darker gray
  white: "#000000", // Pure black
  background: "#000000", // Pure black
  textPrimary: "#FFFFFF", // Pure white text
  textSecondary: "#A3A3A3", // Neutral gray
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
      stroke="#000000"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

let dark = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: COLORS.navy,
      light: COLORS.navyLight,
      dark: COLORS.navyDark,
      contrastText: "#000000", // Black text on white buttons
    },
    secondary: {
      main: COLORS.navyLight,
      light: "#F5F5F5",
      dark: COLORS.navyDark,
      contrastText: "#000000",
    },
    success: { main: "#22C55E", light: "#4caf50", contrastText: "#000000" },
    info: { main: "#3B82F6", contrastText: "#FFFFFF" },
    warning: { main: "#F59E0B", contrastText: "#000000" },
    error: { main: "#EF4444", contrastText: "#FFFFFF" },

    background: {
      default: COLORS.background,
      paper: COLORS.white,
    },
    text: {
      primary: COLORS.textPrimary,
      secondary: COLORS.textSecondary,
    },
    divider: alpha(COLORS.textPrimary, 0.15),

    // Custom colors
    custom: {
      brand: {
        navy: COLORS.navy,
      },
      gradients: {
        primary: `linear-gradient(135deg, ${COLORS.navyDark} 0%, ${COLORS.navy} 100%)`,
        secondary: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyLight} 100%)`,
        subtle: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.white} 100%)`,
      },
      sidebar: {
        bg: COLORS.white,
        activeBg: alpha(COLORS.navy, 0.15),
        activeText: COLORS.navy,
        hoverBg: alpha(COLORS.navy, 0.1),
      },
      card: {
        border: alpha(COLORS.navy, 0.15),
        shadow: alpha("#000000", 0.5),
        hoverShadow: alpha("#000000", 0.8),
      },
      table: {
        headBg: alpha(COLORS.textPrimary, 0.05),
        rowHover: alpha(COLORS.navy, 0.08),
      },
    },
  },

  typography: {
    fontFamily: 'var(--font-dm-sans), var(--font-hind-siliguri), "Segoe UI", system-ui, sans-serif',
    fontSize: 13,

    h1: { fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.2, color: COLORS.navy },
    h2: { fontWeight: 700, fontSize: "2rem", lineHeight: 1.25, color: COLORS.navy },
    h3: { fontWeight: 600, fontSize: "1.5rem", lineHeight: 1.3, color: COLORS.navy },
    h4: { fontWeight: 600, fontSize: "1.25rem", color: COLORS.navy },
    h5: { fontWeight: 600, fontSize: "1.125rem", color: COLORS.navy },
    h6: { fontWeight: 600, fontSize: "1rem", color: COLORS.navy },
    subtitle1: { fontWeight: 500, fontSize: "1rem", color: COLORS.navy },
    subtitle2: { fontWeight: 500, fontSize: "0.875rem", color: COLORS.navyLight },
    body1: { fontSize: "1rem", lineHeight: 1.7, color: COLORS.textPrimary },
    body2: { fontSize: "0.875rem", lineHeight: 1.6, color: COLORS.textSecondary },
    button: { fontWeight: 600, fontSize: "0.875rem", textTransform: "none" },
    caption: { color: COLORS.textSecondary },
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
          background: alpha(COLORS.navy, 0.3),
          color: COLORS.textPrimary,
        },
        ".Toastify__toast": {
          minHeight: "44px !important",
          paddingTop: "6px !important",
          paddingBottom: "6px !important",
          paddingLeft: "12px !important",
          paddingRight: "12px !important",
          fontSize: "0.8rem !important",
          fontFamily: "inherit !important",
          backgroundColor: "#000000 !important",
          color: "#FFFFFF !important",
          border: "1px solid rgba(255, 255, 255, 0.15) !important",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5) !important",
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
          color: "#FFFFFF !important",
          opacity: "0.7 !important",
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
          background: alpha(COLORS.navy, 0.3),
          borderRadius: 20,
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
          "&:hover": { background: COLORS.navyDark },
        },
        containedSecondary: {
          "&:hover": { background: COLORS.navy },
        },
        outlinedPrimary: {
          borderColor: alpha(COLORS.navy, 0.5),
          color: COLORS.navy,
          "&:hover": {
            borderColor: COLORS.navyLight,
            background: alpha(COLORS.navy, 0.1),
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
            borderColor: alpha(COLORS.textPrimary, 0.15),
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(COLORS.textPrimary, 0.3),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: COLORS.navy,
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
          "&.Mui-focused": { color: COLORS.navy },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${alpha(COLORS.textPrimary, 0.1)}`,
          boxShadow: `0 2px 10px ${alpha("#000000", 0.2)}`,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 14,
          border: `1px solid ${alpha(COLORS.textPrimary, 0.1)}`,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: COLORS.white,
          color: COLORS.navy,
          backgroundImage: "none",
          borderBottom: `1px solid ${alpha(COLORS.textPrimary, 0.1)}`,
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&:hover": { background: alpha(COLORS.navy, 0.1) },
          "&.Mui-selected": {
            background: alpha(COLORS.navy, 0.15),
            color: COLORS.navy,
            "&:hover": { background: alpha(COLORS.navy, 0.2) },
          },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: {
          background: COLORS.navy,
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
            color: COLORS.navy,
            fontWeight: 600,
          },
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            background: "transparent",
            color: COLORS.textSecondary,
            fontWeight: 700,
            textTransform: "uppercase",
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
          },
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { background: alpha(COLORS.navy, 0.05) },
        },
      },
    },

    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: {
          background: COLORS.white,
          color: COLORS.textPrimary,
          borderRadius: 8,
          fontSize: "0.75rem",
          border: `1px solid ${alpha(COLORS.textPrimary, 0.1)}`,
        },
        arrow: { color: COLORS.white },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          border: `1px solid ${alpha(COLORS.textPrimary, 0.1)}`,
          boxShadow: `0 20px 50px ${alpha("#000000", 0.5)}`,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: alpha(COLORS.textPrimary, 0.1) },
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

dark = responsiveFontSizes(dark)

export default dark
