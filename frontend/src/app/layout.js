import { DM_Sans, JetBrains_Mono, Hind_Siliguri } from "next/font/google";
import { CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import ThemeProvider from "@/providers/ThemeProvider";
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

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
  display: "swap",
  variable: "--font-hind-siliguri",
});

export const metadata = {
  title: "Elite LMS - Premium Software Training",
  description: "Advanced engineering and architecture training for the modern elite.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function Layout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head />
      <body className={`${dmSans.variable} ${jetbrainsMono.variable} ${hindSiliguri.variable}`} suppressHydrationWarning>
        <StoreProvider>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <ThemeProvider>
              <CToaster />
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
