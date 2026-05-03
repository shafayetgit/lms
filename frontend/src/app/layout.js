import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import light from "@/theme/light";
import StoreProvider from "@/redux/storeProvider";
import CToaster from "@/components/ui/CToaster";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  title: "Elite LMS - Premium Software Training",
  description: "Advanced engineering and architecture training for the modern elite.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function Layout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth"  suppressHydrationWarning>
      <body className={`${dmSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <StoreProvider>
          <CToaster />
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <ThemeProvider theme={light}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
