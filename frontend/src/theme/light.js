"use client";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { Inter } from "next/font/google";

const inter = Inter({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});

let light = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1E2D44", // Navy Blue from logo
      light: "#2C3E50",
      dark: "#15202B",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#76B82A", // Vibrant Green from logo
      light: "#8ED045",
      dark: "#5E9321",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    custom: {
      light: "#FFFFFF",
      glass: "rgba(255, 255, 255, 0.7)",
      border: "rgba(0, 0, 0, 0.1)",
      navy: "#1E2D44",
      green: "#76B82A",
      rating: "#FFB000",
    },
    text: {
      primary: "#1A222B", // Darker Navy-tinted black
      secondary: "#5A6A7E", // Slate blue-gray
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: {
      fontWeight: 900,
      fontSize: "2.25rem",
      letterSpacing: "-0.04em",
      background: "linear-gradient(135deg, #1E2D44 10%, #76B82A 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      "@media (max-width:600px)": {
        fontSize: "1.6rem",
      },
      "@media (min-width:1200px)": {
        fontSize: "3rem",
      },
    },
    h2: {
      fontWeight: 800,
      fontSize: "1.75rem",
      letterSpacing: "-0.04em",
      background: "linear-gradient(135deg, #1E2D44 10%, #76B82A 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      "@media (max-width:600px)": {
        fontSize: "1.35rem",
      },
      "@media (min-width:1200px)": {
        fontSize: "2.4rem",
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
      "@media (max-width:600px)": {
        fontSize: "1.15rem",
      },
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.3rem",
      "@media (max-width:600px)": {
        fontSize: "1rem",
      },
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.1rem",
      "@media (max-width:600px)": {
        fontSize: "0.95rem",
      },
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      "@media (max-width:600px)": {
        fontSize: "0.9rem",
      },
    },
    body1: {
      fontWeight: 400,
      fontSize: "1rem",
      "@media (max-width:600px)": {
        fontSize: "0.9rem",
      },
    },
    body2: {
      fontWeight: 400,
      fontSize: "0.9rem",
      "@media (max-width:600px)": {
        fontSize: "0.8rem",
      },
    },
    caption: {
      fontWeight: 400,
      fontSize: "0.8rem",
      "@media (max-width:600px)": {
        fontSize: "0.7rem",
      },
    },
    overline: {
      fontWeight: 400,
      fontSize: "0.7rem",
      "@media (max-width:600px)": {
        fontSize: "0.65rem",
      },
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: "1rem",
      "@media (max-width:600px)": {
        fontSize: "0.9rem",
      },
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: "0.9rem",
      "@media (max-width:600px)": {
        fontSize: "0.8rem",
      },
    },
    button: {
      fontWeight: 600,
      fontSize: "0.9rem",
      textTransform: "uppercase",
    },
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: "0.9rem",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.85rem",
        },
        asterisk: {
          color: "red",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent", // your desired card background
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)", // optional shadow
          borderRadius: "12px", // optional radius
        },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent", // like Card background
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)", // subtle shadow
          borderRadius: "12px", // rounded corners
          // marginBottom: "12px", // spacing between accordions
          "&:before": {
            display: "none", // removes default divider line
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(0,0,0,0.08)", // subtle separator
          minHeight: "56px",
          "&.Mui-expanded": {
            minHeight: "56px",
          },
        },
        content: {
          margin: "12px 0",
          "&.Mui-expanded": {
            margin: "12px 0",
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: "16px",
          backgroundColor: "rgba(0,0,0,0.02)", // light background for details
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        iconFilled: {
          color: "#FFB000",
        },
        iconHover: {
          color: "#E69E00",
        },
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
