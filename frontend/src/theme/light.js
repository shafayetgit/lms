"use client";

import { createTheme, responsiveFontSizes, alpha } from "@mui/material/styles";

const COLORS = {
    navy: "#1A2757",
    navyLight: "#31457D",
    navyDark: "#101A3D",
    white: "#FFFFFF",
    background: "#F6F8FB",
    textPrimary: "#111827",
    textSecondary: "#4B5563",
};

let light = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: COLORS.navy,
            light: COLORS.navyLight,
            dark: COLORS.navyDark,
            contrastText: COLORS.white,
        },
        secondary: {
            main: COLORS.navyLight,
            light: "#4A6BA8",
            dark: COLORS.navyDark,
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
        divider: alpha(COLORS.navy, 0.08),

        // Custom colors
        custom: {
            brand: {
                navy: COLORS.navy,
            },
            gradients: {
                primary: "linear-gradient(135deg, #1A2757 0%, #31457D 100%)",
                secondary: "linear-gradient(135deg, #31457D 0%, #4A6BA8 100%)",
                subtle: "linear-gradient(135deg, #F6F8FB 0%, #FFFFFF 100%)",
            },
            sidebar: {
                bg: COLORS.white,
                activeBg: alpha(COLORS.navy, 0.10),
                activeText: COLORS.navy,
                hoverBg: alpha(COLORS.navy, 0.05),
            },
            card: {
                border: alpha(COLORS.navy, 0.08),
                shadow: alpha(COLORS.navy, 0.08),
                hoverShadow: alpha(COLORS.navy, 0.14),
            },
            table: {
                headBg: "#EEF2FF",
                rowHover: alpha(COLORS.navy, 0.03),
            },
        },
    },

    typography: {
        fontFamily: 'var(--font-dm-sans), "Segoe UI", system-ui, sans-serif',
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
        caption: { color: "#6B7280" },
    },

    shape: {
        borderRadius: 10,
    },

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: COLORS.background,
                    color: COLORS.textPrimary,
                },
                "::selection": {
                    background: alpha(COLORS.navy, 0.2),
                    color: COLORS.navy,
                },
                "*::-webkit-scrollbar": {
                    width: 6,
                    height: 6,
                },
                "*::-webkit-scrollbar-thumb": {
                    background: alpha(COLORS.navy, 0.2),
                    borderRadius: 20,
                },
            },
        },

        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    fontWeight: 600,
                    padding: "8px 20px",
                    transition: "all 0.2s ease",
                },
                containedPrimary: {
                    "&:hover": { background: COLORS.navyDark },
                },
                containedSecondary: {
                    "&:hover": { background: COLORS.navy },
                },
                outlinedPrimary: {
                    borderColor: alpha(COLORS.navy, 0.4),
                    color: COLORS.navy,
                    "&:hover": {
                        borderColor: COLORS.navy,
                        background: alpha(COLORS.navy, 0.05),
                    },
                },
            },
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    background: COLORS.white,
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(COLORS.navy, 0.15),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(COLORS.navy, 0.35),
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
                    color: COLORS.textSecondary,
                    "&.Mui-focused": { color: COLORS.navy },
                },
            },
        },

        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: `1px solid ${alpha(COLORS.navy, 0.08)}`,
                    boxShadow: `0 2px 10px ${alpha(COLORS.navy, 0.04)}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                        boxShadow: `0 12px 30px ${alpha(COLORS.navy, 0.10)}`,
                        transform: "translateY(-2px)",
                    },
                },
            },
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                    borderRadius: 14,
                    border: `1px solid ${alpha(COLORS.navy, 0.06)}`,
                },
            },
        },

        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: COLORS.white,
                    color: COLORS.navy,
                    backgroundImage: "none",
                    borderBottom: `1px solid ${alpha(COLORS.navy, 0.08)}`,
                },
            },
        },

        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    "&:hover": { background: alpha(COLORS.navy, 0.05) },
                    "&.Mui-selected": {
                        background: alpha(COLORS.navy, 0.10),
                        color: COLORS.navy,
                        "&:hover": { background: alpha(COLORS.navy, 0.15) },
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

        MuiChip: {
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
                        color: COLORS.navy,
                        fontWeight: 600,
                    },
                },
            },
        },

        MuiTableRow: {
            styleOverrides: {
                root: {
                    "&:hover": { background: alpha(COLORS.navy, 0.03) },
                },
            },
        },

        MuiTooltip: {
            defaultProps: { arrow: true },
            styleOverrides: {
                tooltip: {
                    background: COLORS.navy,
                    color: COLORS.white,
                    borderRadius: 8,
                    fontSize: "0.75rem",
                },
                arrow: { color: COLORS.navy },
            },
        },

        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 18,
                    border: `1px solid ${alpha(COLORS.navy, 0.08)}`,
                    boxShadow: `0 20px 50px ${alpha(COLORS.navy, 0.16)}`,
                },
            },
        },

        MuiDivider: {
            styleOverrides: {
                root: { borderColor: alpha(COLORS.navy, 0.08) },
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
});

light = responsiveFontSizes(light);

export default light;