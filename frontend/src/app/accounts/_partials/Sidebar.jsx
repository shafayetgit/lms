"use client";
import React from "react";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  ListItemButton,
  useTheme,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaymentIcon from "@mui/icons-material/Payment";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReceiptLong, School, AutoStories } from "@mui/icons-material";

const menuSections = [
  {
    subheader: "Dashboard",
    items: [
      { label: "Courses", url: "/accounts/courses", icon: <School /> },
      { label: "E-Books", url: "/accounts/ebooks", icon: <AutoStories /> },
      { label: "Orders", url: "/accounts/orders", icon: <ReceiptLong /> },
      {
        label: "Wishlist",
        url: "/accounts/wishlist",
        icon: <FavoriteBorderIcon />,
      },
      {
        label: "Support Tickets",
        url: "/accounts/support-ticket",
        icon: <SupportAgentIcon />,
      },
    ],
  },
  {
    subheader: "Account Settings",
    items: [
      { label: "Profile", url: "/accounts/profile", icon: <PersonIcon /> },
      {
        label: "Payment Methods",
        url: "/accounts/payment-method",
        icon: <PaymentIcon />,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const theme = useTheme();

  return (
    <Box>
      <Box p={2}>
        {menuSections.map((section, sectionIndex) => (
          <React.Fragment key={section.subheader}>
            <List
              subheader={
                <ListSubheader
                  component="div"
                  disableSticky
                  sx={{
                    pl: 1,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: 0.5,
                    color: "text.secondary",
                    mb: 1,
                  }}
                >
                  {section.subheader}
                </ListSubheader>
              }
              disablePadding
            >
              {section.items.map((item) => {
                // Ensure active state matches exactly or matches sub-routes (e.g., /courses/1)
                const isActive =
                  pathname === item.url || pathname?.startsWith(`${item.url}/`);

                return (
                  <ListItem disablePadding key={item.label} sx={{ mb: 0.5 }}>
                    <ListItemButton
                      component={Link}
                      href={item.url}
                      selected={isActive}
                      sx={{
                        borderRadius: 2,
                        py: 1.25,
                        px: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: theme.palette.action.hover,
                          transform: "translateX(4px)",
                        },
                        "&.Mui-selected": {
                          bgcolor: theme.palette.primary.main + "15", // 15% opacity primary color
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          "&:hover": {
                            bgcolor: theme.palette.primary.main + "25",
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: isActive ? "primary.main" : "text.secondary",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 500,
                          fontSize: "0.95rem",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
            {sectionIndex < menuSections.length - 1 && (
              <Divider sx={{ my: 2, mx: 1 }} />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}
