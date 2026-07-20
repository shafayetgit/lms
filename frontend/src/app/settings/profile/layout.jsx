"use client";
import React from "react";
import { PersonOutlineOutlined, SecurityOutlined } from "@mui/icons-material";
import CModuleLayout from "@/components/ui/CModuleLayout";

import { usePathname } from "next/navigation";
import { PROFILE_TIPS } from "@/choices/helpTips/profile";

export default function ProfileLayout({ children }) {
  const pathname = usePathname();

  const navigators = [
    {
      label: "General Info",
      href: `/settings/profile`,
      icon: <PersonOutlineOutlined fontSize="small" />,
    },
    {
      label: "Security",
      href: `/settings/profile/security`,
      icon: <SecurityOutlined fontSize="small" />,
    },
  ];

  const segments = pathname.split("/");
  const lastSegment = segments[segments.length - 1];
  let activeTips = PROFILE_TIPS.general;
  if (lastSegment === "security") activeTips = PROFILE_TIPS.security;

  return (
    <CModuleLayout navigators={navigators} helpTips={activeTips}>
      {children}
    </CModuleLayout>
  );
}
