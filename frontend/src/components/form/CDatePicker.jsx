"use client"
import React from "react"
import { FormControl, FormLabel, TextField, Typography } from "@mui/material"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"

export default function CDatePicker({
  error,
  helperText,
  fullWidth = true,
  size = "small",
  required = false,
  format = "YYYY-MM-DD",
  views = ["year", "month", "day"],
  // views=['year-mm-dd'],
  ...rest
}) {
  const [cleared, setCleared] = React.useState(false)

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormControl fullWidth={fullWidth}>
        <DatePicker
          format={format}
          views={views}
          closeOnSelect
          {...rest}
          slotProps={{
            textField: {
              error: error,
              helperText: helperText,
              size: size,
              required: required,
            },
            field: { clearable: true, onClear: () => setCleared(true) },
          }}
        />
      </FormControl>
    </LocalizationProvider>
  )
}
