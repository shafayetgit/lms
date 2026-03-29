"use client";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
} from "@mui/material";
import Link from "next/link";
import BottomHeader from "./header/BottomHeader";
import useScrollBackgroundColor from "@/hooks/useScrollBackgroundColor";
import Footer from "./Footer";
export default function RootLayout({ children }) {
  const dynamicColor = useScrollBackgroundColor();

  return (
    <>
      {/* Navbar */}
      <BottomHeader dynamicColor={dynamicColor} />

      {/* Main Content */}
      <Box component="main" mt={4}>
        {children}
      </Box>

      {/* Footer */}
      <Footer />
    </>
  );
}
