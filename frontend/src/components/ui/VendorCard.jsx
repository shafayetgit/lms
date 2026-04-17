"use client"
import React from "react"
import { Box, Card, CardMedia, Avatar, Typography, Rating } from "@mui/material"
import CButton from "@/components/ui/CButton" // Adjust path as needed
import Link from "next/link"

export default function VendorCard({ vendor, onVisitStore }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "none",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Banner Image */}
      <Box sx={{ position: "relative", aspectRatio: "3 / 1" }}>
        <CardMedia
          component="img"
          image={vendor.banner}
          alt={`${vendor.name} banner`}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
            "&:hover": { transform: "scale(1.02)" },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
          }}
        />
      </Box>

      {/* Store Info */}
      <Box sx={{ px: { xs: 2, md: 4 }, pb: 3, position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "row", sm: "row" },
            alignItems: { xs: "center", sm: "flex-start" },
            gap: 3,
            mt: -4,
            textAlign: { xs: "left", sm: "left" },
          }}
        >
          <Box sx={{ position: "relative", width: { xs: 80, sm: 100 } }}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                aspectRatio: "1 / 1",
              }}
            >
              <Avatar
                src={vendor.logo}
                alt="Store Logo"
                sx={{
                  width: "100%",
                  height: "100%",
                  border: "4px solid",
                  borderColor: "background.paper",
                  boxShadow: 3,
                  backgroundColor: "background.paper",
                }}
              />
            </Box>

            {/* Verified badge */}
            <Box
              sx={{
                position: "absolute",
                bottom: 4,
                right: 4,
                bgcolor: "primary.main",
                color: "white",
                borderRadius: "50%",
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: "bold",
                border: "2px solid",
                borderColor: "background.paper",
              }}
            >
              ✔
            </Box>
          </Box>

          <Box
            mt={{ xs: 5, sm: 5, md: 5 }}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <Box>
              <Typography variant="h5">{vendor.name}</Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "center", sm: "flex-start" },
                  mt: 0.5,
                }}
              >
                <Rating value={vendor.rating} precision={0.1} readOnly size="small" />
              </Box>
            </Box>
            <CButton
              label="Visit Store"
              variant="outlined"
              component={Link}
              href={`/vendor/${vendor.id}`}
            />
          </Box>
        </Box>
      </Box>
    </Card>
  )
}
