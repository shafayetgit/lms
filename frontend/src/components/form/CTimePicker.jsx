import React from "react"
import { FormControl, FormLabel } from "@mui/material"
import { MobileTimePicker, TimePicker } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"

export default function CTimePicker({
  name,
  value,
  label,
  autoFocus,
  error,
  helperText,
  placeholder,
  mobileTimePicker = true,
  onChange = null,
  size = "small",
  // format = "hh:mm:a",
  ...other
}) {
  const [cleared, setCleared] = React.useState(false)

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormControl fullWidth>
        {mobileTimePicker ? (
          <MobileTimePicker
            label={label}
            value={value}
            autoFocus={autoFocus}
            name={name}
            onChange={onChange}
            {...other}
            slotProps={{
              textField: {
                error: error,
                helperText: helperText,
                size: size,
              },
            }}
          />
        ) : (
          <TimePicker
            // views={["hours", "minutes"]}
            label={label}
            value={value}
            autoFocus={autoFocus}
            name={name}
            onChange={onChange}
            // format={format}
            {...other}
            slotProps={{
              textField: {
                error: error,
                helperText: helperText,
                size: size,
                placeholder: placeholder,
              },
              // field: { clearable: true, onClear: () => setCleared(true) },
            }}
          />
        )}
      </FormControl>
    </LocalizationProvider>
  )
}
