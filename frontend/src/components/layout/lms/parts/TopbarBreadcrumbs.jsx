"use client";

import React from "react";
import Link from "next/link";
import { Box, Breadcrumbs, Typography } from "@mui/material";
import { useSelector } from "react-redux";

const isIdSegment = (segment) => {
  if (!segment) return false;
  if (/^\d+$/.test(segment)) return true;
  if (/^[0-9a-fA-F-]{20,}$/.test(segment)) return true;
  if (/^[0-9a-fA-F]{24,}$/.test(segment)) return true;
  return false;
};

export default function TopbarBreadcrumbs({ pathname }) {
  const breadcrumbLabels = useSelector((state) => state.app?.breadcrumbLabels || {});

  const allSegments = pathname?.split("/").filter((x) => x) || [];
  const breadcrumbItems = [];
  let currentPath = "";
  
  for (let i = 0; i < allSegments.length; i++) {
    const segment = allSegments[i];
    currentPath += `/${segment}`;
    
    const customLabel = breadcrumbLabels[currentPath] || breadcrumbLabels[segment];
    
    if (["lms", "academy", "core", "settings", "details"].includes(segment)) {
      continue;
    }
    
    if (segment === "dashboard" && i > 1) {
      continue;
    }
    
    if (!customLabel && isIdSegment(segment)) {
      continue;
    }
    
    breadcrumbItems.push({
      path: currentPath,
      label: customLabel || (segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")),
    });
  }

  if (breadcrumbItems.length === 0) return null;

  return (
    <Box sx={{ display: { xs: "none", md: "block" } }}>
      <Breadcrumbs 
        separator="›" 
        aria-label="breadcrumb"
        sx={{ '& .MuiBreadcrumbs-separator': { color: 'text.disabled', mx: 0.5 } }}
      >
        {breadcrumbItems.map((item, index) => {
          const last = index === breadcrumbItems.length - 1;
          return last ? (
            <Typography 
              color="text.primary" 
              key={item.path} 
              variant="body2" 
              sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}
            >
              {item.label}
            </Typography>
          ) : (
            <Link href={item.path} key={item.path} style={{ textDecoration: 'none' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary', 
                  '&:hover': { color: 'primary.main' }, 
                  fontWeight: 500,
                  transition: 'color 0.2s',
                }}
              >
                {item.label}
              </Typography>
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
