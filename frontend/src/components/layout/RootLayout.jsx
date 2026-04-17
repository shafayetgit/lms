"use client";
import { Box } from "@mui/material";
import Link from "next/link";
import Topbar from "./header/Topbar";
import useScrollBackgroundColor from "@/hooks/useScrollBackgroundColor";
import Footer from "./Footer";
export default function RootLayout({ children }) {
  // const dynamicColor = useScrollBackgroundColor();

  return (
    <>
      {/* Navbar */}
      {/* <Topbar dynamicColor={dynamicColor} /> */}
      <Topbar />

      {/* Main Content */}
      <Box component="main" mt={4}>
        {children}
      </Box>

      {/* Footer */}
      <Footer />
    </>
  );
}
