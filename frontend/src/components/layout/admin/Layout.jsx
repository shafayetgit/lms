"use client";

import { useState, useEffect } from "react";
import { Box, alpha } from "@mui/material";
import { usePathname } from "next/navigation";
import Sidebar from "./parts/Sidebar";
import Topbar from "./parts/Topbar";

const drawerWidth = 280;

export default function Layout({
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Mesh Accent Pulse 1 (Top Left) */}
      <Box
        sx={{
          position: "fixed",
          top: "-10%",
          left: "-5%",
          width: "50%",
          height: "50%",
          background: (theme) =>
            `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 70%)`,
          filter: "blur(100px)",
          zIndex: -1,
          animation: "mesh-float 15s infinite alternate ease-in-out",
          "@keyframes mesh-float": {
            "0%": { transform: "translate(0, 0) scale(1)" },
            "100%": { transform: "translate(10%, 15%) scale(1.1)" },
          },
        }}
      />

      {/* Mesh Accent Pulse 2 (Bottom Right) */}
      <Box
        sx={{
          position: "fixed",
          bottom: "-5%",
          right: "-2%",
          width: "40%",
          height: "40%",
          background: (theme) =>
            `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
          filter: "blur(80px)",
          zIndex: -1,
          animation:
            "mesh-float-alt 20s infinite alternate-reverse ease-in-out",
          "@keyframes mesh-float-alt": {
            "0%": { transform: "translate(0, 0) scale(1.1)" },
            "100%": { transform: "translate(-15%, -10%) scale(0.9)" },
          },
        }}
      />

      <Box sx={{ display: "flex", minHeight: "100vh", position: "relative" }}>
        <Sidebar
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          drawerWidth={drawerWidth}
        />
        <Topbar
          handleDrawerToggle={handleDrawerToggle}
          drawerWidth={drawerWidth}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: {
              xs: "calc(100% - 32px)",
              md: `calc(100% - ${drawerWidth + 72}px)`,
            },
            maxWidth: "100%",
            mt: { xs: "96px", md: "118px" },
            ml: { xs: "16px", md: "48px" },
            mr: { xs: "16px", md: "24px" },
            minHeight: "100vh",
            position: "relative",
            zIndex: 1,
          }}
        >
          {children}
        </Box>


      </Box>

    </Box>
  );
}


