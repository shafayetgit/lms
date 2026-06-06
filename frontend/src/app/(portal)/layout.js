import Footer from "@/components/layout/Footer";
import Topbar from "@/components/layout/header/Topbar";
import { Box } from "@mui/material";

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



// "use client";
// import RootLayout from "@/components/layout/RootLayout";

// export default function PortalLayout({ children }) {
//     return <RootLayout>{children}</RootLayout>;
// }
