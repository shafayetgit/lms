"use client";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let light = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000000",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#000000",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    // background: {
    //   default: "#F9FAFB",
    //   paper: "#FFFFFF",
    // },
    custom: {
      light: "#FFFFFF",
    },
    text: {
      primary: "#1A1A1A",
      secondary: "#666666",
    },
  },
  typography: {
    // fontFamily: "dejavu sans, sans-serif",
    // fontSize: 13,
    // allVariants: {
    //   fontFamily: "dejavu sans, sans-serif",
    // },
    h1: {
      fontWeight: 700,
      fontSize: "2.25rem",
      "@media (max-width:600px)": {
        fontSize: "1.6rem",
      },
      "@media (min-width:1200px)": {
        fontSize: "3rem",
      },
    },
    h2: {
      fontWeight: 700,
      fontSize: "1.75rem",
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
