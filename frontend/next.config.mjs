/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/x-date-pickers",
      "@mui/x-charts",
      "@mui/x-data-grid",
      "@base-ui/react",
      "framer-motion",
      "@tiptap/react",
      "@tiptap/pm",
      "@tiptap/starter-kit",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "react-hook-form",
      "@reduxjs/toolkit",
      "zod",
      "yup",
    ],
    optimizeCss: true,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "cdn.example.com",
      },
    ],
  },
}

export default nextConfig
