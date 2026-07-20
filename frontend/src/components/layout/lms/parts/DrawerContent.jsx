"use client";

import React from "react";
import { Box } from "@mui/material";
import ModuleSwitcher from "./ModuleSwitcher";
import NavigationList from "./NavigationList";
import CollapseButton from "./CollapseButton";

export default function DrawerContent({ isMini, pathname, theme, setIsMini, isMobile }) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "transparent",
      }}
    >
      {/* Sidebar Header / Module Switcher */}
      <ModuleSwitcher
        isMini={isMini}
        isMobile={isMobile}
        pathname={pathname}
        theme={theme}
      />

      {/* Navigation Links */}
      <NavigationList
        isMini={isMini}
        isMobile={isMobile}
        pathname={pathname}
        theme={theme}
      />

      {/* Collapse Button */}
      <CollapseButton
        isMini={isMini}
        setIsMini={setIsMini}
        isMobile={isMobile}
        theme={theme}
      />
    </Box>
  );
}
