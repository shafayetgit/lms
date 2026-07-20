"use client";

import { useState, useEffect } from "react";
import { Box, alpha } from "@mui/material";
import { usePathname } from "next/navigation";

const drawerWidth = 280;
const miniDrawerWidth = 88;

function BaseLayout({ children, sidebar: Sidebar, topbar: Topbar }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const pathname = usePathname();

  const currentDrawerWidth = isMini ? miniDrawerWidth : drawerWidth;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMobileOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "background.default",
        position: "relative",
        display: "flex",
        overflowX: "clip",
      }}
    >
      {Sidebar && (
        <Sidebar
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          drawerWidth={currentDrawerWidth}
          isMini={isMini}
          setIsMini={setIsMini}
        />
      )}

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: { xs: "100%", md: `calc(100% - ${currentDrawerWidth}px)` },
          transition: "width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1)",
          ml: { md: `${currentDrawerWidth}px` },
        }}
      >
        {Topbar && (
          <Topbar
            handleDrawerToggle={handleDrawerToggle}
            drawerWidth={currentDrawerWidth}
            isMini={isMini}
          />
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            px: { xs: 1, md: 2 },
            pt: { xs: "60px", md: "68px" }, // Reduced space below Topbar (56+4=60, 64+4=68)
            pb: 2,
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default BaseLayout;
