'use client';
import { Stack } from "@mui/material";
import CButton from "@/components/CButton";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigation = () => {
  const pathname = usePathname();
  const navItems = [
    { label: "Home", url: "/" },
    { label: "Courses", url: "/courses" },
    { label: "E-Books", url: "/ebooks" },
    { label: "About", url: "/about" },
    { label: "Contact", url: "/contact" },
  ];

  return (
    <>
      <Stack
        direction="row"
        justifyContent="center"
        component="nav"
        spacing={1}
      >
        {navItems.map((item, index) => {
          const isActive = pathname === item.url;
          return (
            <CButton
              key={index}
              label={item.label}
              variant={isActive ? "contained" : "text"}
              component={Link}
              href={item.url}
              sx={{
                fontWeight: isActive ? 800 : 600,
                color: isActive ? "white" : "text.primary",
                bgcolor: isActive ? "primary.main" : "transparent",
                px: 2.5,
                borderRadius: "50px",
                "&:hover": {
                  bgcolor: isActive ? "primary.dark" : "rgba(0,0,0,0.04)",
                }
              }}
            />
          );
        })}
      </Stack>
    </>
  );
};

export default Navigation;
