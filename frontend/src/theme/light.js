"use client";
import { createTheme, alpha } from "@mui/material/styles";

// ─── Brand Tokens (extracted from logo) ───────────────────────────────────────
// Navy blue  : shield border, laurels, mortarboard, open book
// Forest green: shield gradient top / dark green fills
// Leaf green : shield gradient bottom / bar-chart bars
// White      : plant & leaf highlights

const brand = {
    navy: {
        50: "#E8EAF2",
        100: "#C6CBDF",
        200: "#A0A9CA",
        300: "#7A87B5",
        400: "#5E6FA6",
        500: "#435898",
        600: "#3B508C",
        700: "#31457D",
        800: "#273A6E",
        900: "#1A2757", // ← exact logo navy
    },
    green: {
        50: "#E6F4EA",
        100: "#C2E3CA",
        200: "#9AD1A8",
        300: "#70BE84",
        400: "#51AF68",
        500: "#2EB82E", // ← exact logo leaf-green
        600: "#279E28",
        700: "#1F8721",
        800: "#1A6E1C",
        900: "#1A5C2A", // ← exact logo forest-green
    },
    white: "#FFFFFF",
    offWhite: "#F5F7F2",
};

// ─── Semantic colour map ───────────────────────────────────────────────────────
const palette = {
    primary: {
        lightest: brand.navy[50],
        lighter: brand.navy[100],
        light: brand.navy[300],
        main: brand.navy[900],   // #1A2757
        dark: brand.navy[800],
        darker: "#0F1A44",
        contrastText: brand.white,
    },
    secondary: {
        lightest: brand.green[50],
        lighter: brand.green[100],
        light: brand.green[400],
        main: brand.green[700],  // #1A6E1C
        dark: brand.green[900],  // #1A5C2A
        darker: "#0E3A19",
        contrastText: brand.white,
    },
    success: {
        light: brand.green[300],
        main: brand.green[600],
        dark: brand.green[900],
        contrastText: brand.white,
    },
    info: {
        light: brand.navy[200],
        main: brand.navy[600],
        dark: brand.navy[900],
        contrastText: brand.white,
    },
    warning: {
        light: "#FFF3CD",
        main: "#F59E0B",
        dark: "#B45309",
        contrastText: "#1A1A1A",
    },
    error: {
        light: "#FEE2E2",
        main: "#DC2626",
        dark: "#991B1B",
        contrastText: brand.white,
    },
    grey: {
        50: "#FAFAFA",
        100: "#F4F4F5",
        200: "#E4E4E7",
        300: "#D1D5DB",
        400: "#9CA3AF",
        500: "#6B7280",
        600: "#4B5563",
        700: "#374151",
        800: "#1F2937",
        900: "#111827",
    },
    background: {
        default: brand.offWhite,         // #F5F7F2 — warm off-white
        paper: brand.white,
        subtle: "#EEF2F0",              // section bg tint
        overlay: alpha(brand.navy[900], 0.04),
    },
    text: {
        primary: brand.navy[900],      // #1A2757
        secondary: brand.navy[700],
        disabled: brand.navy[300],
        hint: brand.navy[200],
        onDark: brand.white,
    },
    divider: alpha(brand.navy[900], 0.10),
};

// ─── Typography scale ──────────────────────────────────────────────────────────
const typography = {
    fontFamily: [
        'var(--font-dm-sans)',
        '"Segoe UI"',
        'system-ui',
        '-apple-system',
        'sans-serif',
    ].join(", "),
    fontFamilyMono: ['var(--font-jetbrains-mono)', '"Fira Code"', 'monospace'].join(", "),

    h1: { fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", color: brand.navy[900] },
    h2: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.015em", color: brand.navy[900] },
    h3: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.01em", color: brand.navy[900] },
    h4: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4, letterSpacing: "-0.005em", color: brand.navy[900] },
    h5: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.4, color: brand.navy[900] },
    h6: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.5, color: brand.navy[900] },
    subtitle1: { fontSize: "1rem", fontWeight: 500, lineHeight: 1.6, color: brand.navy[700] },
    subtitle2: { fontSize: "0.875rem", fontWeight: 500, lineHeight: 1.6, color: brand.navy[600] },
    body1: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.7, color: brand.navy[800] },
    body2: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.6, color: brand.navy[700] },
    caption: { fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.5, color: brand.navy[500] },
    overline: { fontSize: "0.6875rem", fontWeight: 600, lineHeight: 2.5, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.green[700] },
    button: { fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.025em", textTransform: "none" },
};

// ─── Shape ────────────────────────────────────────────────────────────────────
const shape = { borderRadius: 10 };

// ─── Shadows  (navy-tinted instead of generic grey) ───────────────────────────
const navyShadow = (a, blur, spread = 0) =>
    `0 ${blur / 4}px ${blur}px ${spread}px ${alpha(brand.navy[900], a)}`;

const shadows = [
    "none",
    navyShadow(0.06, 4),
    navyShadow(0.08, 8),
    navyShadow(0.09, 12),
    navyShadow(0.10, 16),
    navyShadow(0.11, 20),
    navyShadow(0.12, 24),
    navyShadow(0.12, 28),
    navyShadow(0.12, 32),
    navyShadow(0.13, 36),
    navyShadow(0.13, 40),
    navyShadow(0.14, 44),
    navyShadow(0.14, 48),
    navyShadow(0.14, 52),
    navyShadow(0.14, 56),
    navyShadow(0.15, 60),
    navyShadow(0.15, 64),
    navyShadow(0.15, 68),
    navyShadow(0.16, 72),
    navyShadow(0.16, 76),
    navyShadow(0.16, 80),
    navyShadow(0.17, 84),
    navyShadow(0.17, 88),
    navyShadow(0.18, 92),
    navyShadow(0.18, 96),
];

// ─── Theme ────────────────────────────────────────────────────────────────────
const light = createTheme({
    palette: {
        mode: "light",
        primary: {
            ...brand.navy,
            lightest: palette.primary.lightest,
            lighter: palette.primary.lighter,
            light: palette.primary.light,
            main: palette.primary.main,
            dark: palette.primary.dark,
            darker: palette.primary.darker,
            contrastText: palette.primary.contrastText,
        },
        secondary: {
            ...brand.green,
            lightest: palette.secondary.lightest,
            lighter: palette.secondary.lighter,
            light: palette.secondary.light,
            main: palette.secondary.dark,
            dark: palette.secondary.dark,
            darker: palette.secondary.darker,
            contrastText: palette.secondary.contrastText,
        },
        success: palette.success,
        info: palette.info,
        warning: palette.warning,
        error: palette.error,
        grey: palette.grey,
        text: {
            primary: palette.text.primary,
            secondary: palette.text.secondary,
            disabled: palette.text.disabled,
        },
        background: {
            default: palette.background.default,
            paper: palette.background.paper,
        },
        divider: palette.divider,
        // Custom tokens accessible via theme.palette
        brand,
        custom: palette,
    },

    typography,
    shape,
    shadows,

    // ─── Component overrides ────────────────────────────────────────────────────
    components: {

        // ── CssBaseline ──────────────────────────────────────────────────────────
        MuiCssBaseline: {
            styleOverrides: `
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { background-color: ${palette.background.default}; }
        ::selection { background: ${alpha(brand.green[500], 0.25)}; color: ${brand.navy[900]}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${brand.navy[50]}; }
        ::-webkit-scrollbar-thumb { background: ${brand.navy[200]}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${brand.navy[400]}; }
      `,
        },

        // ── Button ────────────────────────────────────────────────────────────────
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    transition: "all 0.18s ease",
                    padding: "8px 20px",
                    "&:active": { transform: "scale(0.98)" },
                },
                contained: {
                    "&:hover": { boxShadow: navyShadow(0.18, 12, 0) },
                },
                containedPrimary: {
                    background: palette.primary.main,
                    "&:hover": { background: palette.primary.dark },
                },
                containedSecondary: {
                    background: palette.secondary.main,
                    "&:hover": { background: palette.secondary.dark },
                },
                outlinedPrimary: {
                    borderColor: alpha(palette.primary.main, 0.4),
                    color: palette.primary.main,
                    "&:hover": {
                        borderColor: palette.primary.main,
                        background: alpha(palette.primary.main, 0.04),
                    },
                },
                outlinedSecondary: {
                    borderColor: alpha(palette.secondary.main, 0.5),
                    color: palette.secondary.dark,
                    "&:hover": {
                        borderColor: palette.secondary.dark,
                        background: alpha(palette.secondary.main, 0.06),
                    },
                },
                textPrimary: {
                    color: palette.primary.main,
                    "&:hover": { background: alpha(palette.primary.main, 0.05) },
                },
                sizeLarge: { padding: "10px 28px", fontSize: "0.9375rem" },
                sizeSmall: { padding: "5px 14px", fontSize: "0.8125rem", borderRadius: 6 },
            },
        },

        // ── IconButton ────────────────────────────────────────────────────────────
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    transition: "all 0.15s ease",
                    "&:hover": { background: alpha(palette.primary.main, 0.06) },
                    "&:active": { transform: "scale(0.93)" },
                },
            },
        },

        // ── TextField / Input ─────────────────────────────────────────────────────
        MuiTextField: { defaultProps: { variant: "outlined" } },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    background: brand.white,
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(brand.navy[900], 0.18),
                        transition: "border-color 0.18s ease",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(brand.navy[900], 0.4),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: brand.green[500],
                        borderWidth: 2,
                    },
                    "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                        borderColor: palette.error.main,
                    },
                },
                // input: {
                //     "&::placeholder": { color: brand.navy[300], opacity: 1 },
                // },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: palette.text.secondary,
                    "&.Mui-focused": { color: palette.secondary.dark },
                },
            },
        },

        // ── Select ────────────────────────────────────────────────────────────────
        MuiSelect: {
            styleOverrides: {
                icon: { color: brand.navy[500] },
            },
        },

        // ── Card ──────────────────────────────────────────────────────────────────
        MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    borderRadius: 14,
                    border: `1px solid ${alpha(brand.navy[900], 0.08)}`,
                    background: brand.white,
                    transition: "box-shadow 0.2s ease, transform 0.2s ease",
                    "&:hover": {
                        boxShadow: navyShadow(0.10, 20),
                        transform: "translateY(-1px)",
                    },
                },
            },
        },
        MuiCardHeader: {
            styleOverrides: {
                title: { fontWeight: 600, color: brand.navy[900], fontSize: "1rem" },
                subheader: { color: brand.navy[500], fontSize: "0.8125rem" },
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    "&:last-child": { paddingBottom: 16 },
                },
            },
        },

        // ── Paper ─────────────────────────────────────────────────────────────────
        MuiPaper: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                    border: `1px solid ${alpha(brand.navy[900], 0.07)}`,
                    borderRadius: 12,
                },
                elevation1: { boxShadow: navyShadow(0.07, 8) },
                elevation2: { boxShadow: navyShadow(0.09, 16) },
                elevation3: { boxShadow: navyShadow(0.11, 24) },
            },
        },

        // ── AppBar ────────────────────────────────────────────────────────────────
        MuiAppBar: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                    borderBottom: `1px solid ${alpha(brand.navy[900], 0.10)}`,
                },
                colorPrimary: {
                    background: brand.white,
                    color: brand.navy[900],
                },
                colorDefault: {
                    background: brand.white,
                    color: brand.navy[900],
                },
            },
        },

        // ── Toolbar ───────────────────────────────────────────────────────────────
        MuiToolbar: {
            styleOverrides: {
                root: { minHeight: "60px !important" },
            },
        },

        // ── Drawer ────────────────────────────────────────────────────────────────
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: `1px solid ${alpha(brand.navy[900], 0.08)}`,
                    background: brand.white,
                },
            },
        },

        // ── ListItem / ListItemButton ─────────────────────────────────────────────
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: "1px 8px",
                    width: "calc(100% - 16px)",
                    padding: "8px 12px",
                    transition: "all 0.15s ease",
                    "&:hover": {
                        background: alpha(brand.navy[900], 0.05),
                    },
                    "&.Mui-selected": {
                        background: alpha(brand.green[500], 0.10),
                        color: brand.green[900],
                        "& .MuiListItemIcon-root": { color: brand.green[700] },
                        "&:hover": { background: alpha(brand.green[500], 0.15) },
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 3,
                            height: "60%",
                            borderRadius: "0 3px 3px 0",
                            background: brand.green[500],
                        },
                    },
                    position: "relative",
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: { minWidth: 36, color: brand.navy[500] },
            },
        },
        MuiListItemText: {
            styleOverrides: {
                primary: { fontSize: "0.875rem", fontWeight: 500 },
                secondary: { fontSize: "0.75rem", color: brand.navy[400] },
            },
        },

        // ── Tabs ──────────────────────────────────────────────────────────────────
        MuiTabs: {
            styleOverrides: {
                root: { borderBottom: `1px solid ${alpha(brand.navy[900], 0.10)}` },
                indicator: { background: brand.green[500], height: 2, borderRadius: "2px 2px 0 0" },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    color: brand.navy[500],
                    textTransform: "none",
                    padding: "10px 20px",
                    minHeight: 44,
                    transition: "color 0.15s ease",
                    "&.Mui-selected": { color: brand.navy[900], fontWeight: 600 },
                    "&:hover": { color: brand.navy[700] },
                },
            },
        },

        // ── Chip ──────────────────────────────────────────────────────────────────
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    transition: "all 0.15s ease",
                    height: 26,
                },
                filledPrimary: {
                    background: palette.primary.main,
                    color: brand.white,
                    "&:hover": { background: palette.primary.dark },
                },
                filledSecondary: {
                    background: alpha(palette.secondary.main, 0.15),
                    color: palette.secondary.dark,
                },
                outlinedPrimary: {
                    borderColor: alpha(palette.primary.main, 0.3),
                    color: palette.primary.dark,
                },
                outlinedSecondary: {
                    borderColor: alpha(palette.secondary.main, 0.4),
                    color: palette.secondary.dark,
                },
                deleteIcon: {
                    color: "currentColor",
                    opacity: 0.6,
                    "&:hover": { opacity: 1 },
                },
            },
        },

        // ── Badge ─────────────────────────────────────────────────────────────────
        MuiBadge: {
            styleOverrides: {
                badge: {
                    fontWeight: 600,
                    fontSize: "0.6875rem",
                },
                colorPrimary: { background: brand.navy[900] },
                colorSecondary: { background: brand.green[500] },
                colorError: { background: palette.error.main },
            },
        },

        // ── Avatar ────────────────────────────────────────────────────────────────
        MuiAvatar: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    fontSize: "0.875rem",
                },
                colorDefault: {
                    background: brand.navy[100],
                    color: brand.navy[800],
                },
            },
        },

        // ── Switch ────────────────────────────────────────────────────────────────
        MuiSwitch: {
            styleOverrides: {
                root: { padding: 6 },
                track: {
                    borderRadius: 20,
                    background: brand.navy[200],
                    opacity: 1,
                },
                thumb: { boxShadow: navyShadow(0.12, 4) },
                switchBase: {
                    "&.Mui-checked": {
                        color: brand.white,
                        "+ .MuiSwitch-track": {
                            background: palette.secondary.main,
                            opacity: 1,
                        },
                    },
                },
            },
        },

        // ── Checkbox ──────────────────────────────────────────────────────────────
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: brand.navy[300],
                    "&.Mui-checked": { color: palette.secondary.main },
                    "&:hover": { background: alpha(palette.secondary.main, 0.06) },
                },
            },
        },

        // ── Radio ─────────────────────────────────────────────────────────────────
        MuiRadio: {
            styleOverrides: {
                root: {
                    color: brand.navy[300],
                    "&.Mui-checked": { color: palette.secondary.main },
                    "&:hover": { background: alpha(palette.secondary.main, 0.06) },
                },
            },
        },

        // ── Slider ────────────────────────────────────────────────────────────────
        MuiSlider: {
            styleOverrides: {
                rail: { background: brand.navy[100], opacity: 1 },
                track: { background: palette.secondary.main },
                thumb: {
                    background: brand.white,
                    border: `2px solid ${palette.secondary.main}`,
                    boxShadow: navyShadow(0.12, 6),
                    "&:hover": { boxShadow: `0 0 0 6px ${alpha(palette.secondary.main, 0.16)}` },
                    "&.Mui-active": { boxShadow: `0 0 0 8px ${alpha(palette.secondary.main, 0.22)}` },
                },
                valueLabel: {
                    background: brand.navy[900],
                    borderRadius: 6,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                },
                mark: { background: brand.navy[200] },
                markActive: { background: brand.green[400] },
            },
        },

        // ── Linear Progress ───────────────────────────────────────────────────────
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 99,
                    height: 6,
                    background: brand.navy[100],
                },
                bar: { borderRadius: 99 },
                barColorPrimary: { background: palette.primary.main },
                barColorSecondary: { background: palette.secondary.main },
            },
        },

        // ── Circular Progress ─────────────────────────────────────────────────────
        MuiCircularProgress: {
            styleOverrides: {
                colorPrimary: { color: brand.navy[900] },
                colorSecondary: { color: brand.green[500] },
            },
        },

        // ── Tooltip ───────────────────────────────────────────────────────────────
        MuiTooltip: {
            defaultProps: { arrow: true },
            styleOverrides: {
                tooltip: {
                    background: brand.navy[900],
                    color: brand.white,
                    borderRadius: 6,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    padding: "6px 10px",
                },
                arrow: { color: brand.navy[900] },
            },
        },

        // ── Snackbar / Alert ──────────────────────────────────────────────────────
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    border: "1px solid",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    alignItems: "center",
                },
                standardSuccess: {
                    background: brand.green[50],
                    borderColor: brand.green[200],
                    color: brand.green[900],
                    "& .MuiAlert-icon": { color: brand.green[600] },
                },
                standardInfo: {
                    background: brand.navy[50],
                    borderColor: brand.navy[200],
                    color: brand.navy[900],
                    "& .MuiAlert-icon": { color: brand.navy[600] },
                },
                standardWarning: {
                    background: "#FFFBEB",
                    borderColor: "#FDE68A",
                    color: "#78350F",
                    "& .MuiAlert-icon": { color: "#D97706" },
                },
                standardError: {
                    background: palette.error.light,
                    borderColor: "#FECACA",
                    color: palette.error.dark,
                    "& .MuiAlert-icon": { color: palette.error.main },
                },
            },
        },

        // ── Table ─────────────────────────────────────────────────────────────────
        MuiTableHead: {
            styleOverrides: {
                root: {
                    "& .MuiTableCell-head": {
                        background: brand.navy[50],
                        color: brand.navy[700],
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        padding: "12px 16px",
                        borderBottom: `2px solid ${alpha(palette.primary.main, 0.10)}`,
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    "&:last-child .MuiTableCell-body": { border: 0 },
                    "&:hover .MuiTableCell-body": {
                        background: alpha(palette.secondary.main, 0.04),
                    },
                    transition: "background 0.12s ease",
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    padding: "12px 16px",
                    fontSize: "0.875rem",
                    color: brand.navy[800],
                    borderBottom: `1px solid ${alpha(palette.primary.main, 0.07)}`,
                },
            },
        },

        // ── Dialog ────────────────────────────────────────────────────────────────
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    border: `1px solid ${alpha(palette.primary.main, 0.08)}`,
                    boxShadow: navyShadow(0.2, 48),
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: palette.primary.main,
                    paddingBottom: 8,
                },
            },
        },

        // ── Menu ──────────────────────────────────────────────────────────────────
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 10,
                    boxShadow: navyShadow(0.14, 20),
                    border: `1px solid ${alpha(palette.primary.main, 0.08)}`,
                    padding: "4px",
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    padding: "8px 12px",
                    color: brand.navy[800],
                    transition: "all 0.12s ease",
                    "&:hover": {
                        background: alpha(palette.primary.main, 0.05),
                        color: palette.primary.main,
                    },
                },
            },
        },

        // ── Breadcrumbs ───────────────────────────────────────────────────────────
        MuiBreadcrumbs: {
            styleOverrides: {
                root: { fontSize: "0.8125rem" },
                separator: { color: brand.navy[300] },
                li: {
                    "& a": {
                        color: brand.navy[600],
                        textDecoration: "none",
                        fontWeight: 500,
                        "&:hover": { color: palette.primary.main, textDecoration: "underline" },
                    },
                },
            },
        },

        // ── Divider ───────────────────────────────────────────────────────────────
        MuiDivider: {
            styleOverrides: {
                root: { borderColor: alpha(palette.primary.main, 0.08) },
            },
        },

        // ── Skeleton ──────────────────────────────────────────────────────────────
        MuiSkeleton: {
            styleOverrides: {
                root: {
                    background: alpha(palette.primary.main, 0.07),
                    borderRadius: 6,
                },
            },
        },

        // ── Pagination ────────────────────────────────────────────────────────────
        MuiPaginationItem: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                    color: brand.navy[700],
                    border: `1px solid transparent`,
                    transition: "all 0.15s ease",
                    "&:hover": {
                        background: alpha(palette.primary.main, 0.05),
                        border: `1px solid ${alpha(palette.primary.main, 0.15)}`,
                    },
                    "&.Mui-selected": {
                        background: palette.primary.main,
                        color: brand.white,
                        fontWeight: 600,
                        "&:hover": { background: palette.primary.dark },
                    },
                },
            },
        },

        // ── Accordion ─────────────────────────────────────────────────────────────
        MuiAccordion: {
            defaultProps: { disableGutters: true, elevation: 0 },
            styleOverrides: {
                root: {
                    border: `1px solid ${alpha(palette.primary.main, 0.09)}`,
                    borderRadius: "10px !important",
                    marginBottom: 8,
                    "&::before": { display: "none" },
                },
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    fontWeight: 600,
                    color: brand.navy[900],
                    "&.Mui-expanded": {
                        borderBottom: `1px solid ${alpha(brand.navy[900], 0.08)}`,
                        borderRadius: "10px 10px 0 0",
                    },
                },
                expandIconWrapper: {
                    color: brand.navy[500],
                    "&.Mui-expanded": { color: brand.green[600] },
                },
            },
        },

        // ── Stepper ───────────────────────────────────────────────────────────────
        MuiStepIcon: {
            styleOverrides: {
                root: {
                    color: brand.navy[200],
                    "&.Mui-active": { color: brand.navy[900] },
                    "&.Mui-completed": { color: brand.green[500] },
                },
                text: { fontWeight: 600, fill: brand.white },
            },
        },
        MuiStepLabel: {
            styleOverrides: {
                label: {
                    fontWeight: 500,
                    "&.Mui-active": { fontWeight: 600, color: brand.navy[900] },
                    "&.Mui-completed": { color: brand.green[700] },
                },
            },
        },
        MuiStepConnector: {
            styleOverrides: {
                line: { borderColor: brand.navy[100] },
            },
        },
    },
});

export default light;
