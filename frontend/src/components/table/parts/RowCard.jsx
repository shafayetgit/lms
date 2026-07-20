import React from "react"
import { Box, Stack, useTheme, Card, Typography, alpha } from "@mui/material"

const RowCard = ({ row, columns }) => {
  const theme = useTheme()
  const gridParams = {
    row,
    id: row.public_id,
    rowId: row.public_id,
    columns,
  }

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 0,
        background: "transparent",
        border: "1px solid",
        borderColor: theme.palette.divider,
        boxShadow: "none",
        mb: 1.5,
      }}
    >
      <Stack spacing={1.2}>
        {columns.map((col, index) => {
          const field = col.field
          let value = row[field]

          const cellParams = {
            ...gridParams,
            value,
            field,
            formattedValue: value,
          }

          if (col.valueGetter) {
            try {
              value = col.valueGetter(cellParams)
              cellParams.value = value
              cellParams.formattedValue = value
            } catch (e) {
              console.warn(`Error in valueGetter for ${field}:`, e)
            }
          }

          const cellValue = col.renderCell ? col.renderCell(cellParams) : value?.toString() || "-"

          return (
            <Stack
              key={`${field || "col"}-${index}`}
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                py: 0.5,
                borderBottom:
                  index !== columns.length - 1
                    ? `1px dashed ${alpha(theme.palette.divider, 0.08)}`
                    : "none",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "0.65rem",
                  letterSpacing: "0.05em",
                  maxWidth: "40%",
                }}
              >
                {col.headerName || field || "---"}
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  textAlign: "right",
                  color: "text.primary",
                  overflow: "hidden",
                  pl: 2,
                }}
              >
                {typeof cellValue === "string" || typeof cellValue === "number" ? (
                  <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: "break-word" }}>
                    {cellValue}
                  </Typography>
                ) : (
                  <Box
                    sx={{ display: "inline-flex", justifyContent: "flex-end", maxWidth: "100%" }}
                  >
                    {cellValue}
                  </Box>
                )}
              </Box>
            </Stack>
          )
        })}
      </Stack>
    </Card>
  )
}

export default RowCard
