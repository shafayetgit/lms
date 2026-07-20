import Footer from "@/components/layout/portal/Footer";
import Topbar from "@/components/layout/portal/header/Topbar";
import { Box } from "@mui/material";

export default function RootLayout({ children }) {
  // const dynamicColor = useScrollBackgroundColor();

  return (
    <>
      {/* Navbar */}
      {/* <Topbar dynamicColor={dynamicColor} /> */}
      <Topbar />

      {/* Main Content */}
      <Box component="main" sx={{ mt: 4, minHeight: "100vh" }}>
        {children}
      </Box>

      {/* Footer */}
      <Footer />
    </>
  );
}
