'use client';
import { Stack } from "@mui/material";
import CButton from "@/components/CButton";
import Link from "next/link";

const Navigation = () => {
  const navItems = [
    { label: "Home", url: "/" },
    { label: "Courses", url: "/courses" },
    { label: "About", url: "/about" },
  ];

  return (
    <>
      <Stack
        direction="row"
        justifyContent="center"
        component="nav"
        spacing={1}
      >
        {navItems.map((item, index) => (
          <CButton
            key={index}
            label={item.label}
            variant="text"
            component={Link}
            href={item.url}
            // sx={{ fontWeight: "bold" }}
          />
        ))}
      </Stack>
    </>
  );
};

export default Navigation;
