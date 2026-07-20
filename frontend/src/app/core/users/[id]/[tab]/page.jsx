"use client"
import React from "react"
import { useParams } from "next/navigation"
import { Box, Typography, Paper } from "@mui/material"

import DetailsTab from "../../_parts/DetailsTab"
import RolesTab from "../../_parts/RolesTab"
import SettingsTab from "../../_parts/SettingsTab"
import FeatureFlagsTab from "../../_parts/FeatureFlagsTab"

export default function UserTabContentPage() {
  const { id, tab } = useParams()

  if (tab === "details") {
    return <DetailsTab userId={id} />
  }

  if (tab === "roles") {
    return <RolesTab userId={id} />
  }

  if (tab === "feature-flags") {
    return <FeatureFlagsTab userId={id} />
  }

  if (tab === "settings") {
    return <SettingsTab userId={id} />
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        minHeight: "400px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box textAlign="center">
        <Typography variant="h5" color="text.secondary" sx={{ textTransform: "capitalize", mb: 1 }}>
          {tab}
        </Typography>
        <Typography variant="body2" color="text.disabled">
          This is a dedicated page for {tab}. It will fetch and display {tab}-related data for User
          ID: {id}.
        </Typography>
      </Box>
    </Paper>
  )
}
