"use client";

import React, { useMemo, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useSelector } from "react-redux";
import lightTheme from "@/theme/light";
import darkTheme from "@/theme/dark";
import { useGetMeQuery } from "@/features/user/userAPI";
import { getCookie } from "@/utils/shared";
import { setAuthCookie } from "@/lib/auth/cookie";

function AuthLoader() {
  const hasToken = typeof window !== "undefined" && !!getCookie("accessToken");
  const { data: response } = useGetMeQuery(undefined, { skip: !hasToken });

  useEffect(() => {
    if (response?.success && response.data) {
      setAuthCookie({ user: response.data });
    }
  }, [response]);

  return null;
}

export default function ThemeProvider({ children }) {
  const mode = useSelector((state) => state.app?.mode || "light");

  const theme = useMemo(() => (mode === "light" ? lightTheme : darkTheme), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthLoader />
      {children}
    </MuiThemeProvider>
  );
}
