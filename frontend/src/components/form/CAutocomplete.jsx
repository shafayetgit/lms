import React from "react"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"

export default function CAutocomplete({
  label,
  name,
  required,
  multiple,
  value,
  options,
  getOptionLabel,
  onChange,
  isOptionEqualToValue,
  error,
  helperText,
  autoFocus,
  className,
  autoComplete,
  placeholder,
  variant,
  size = "small",
  disabled,
  ...rest
}) {
  return (
    <>
      <Autocomplete
        multiple={multiple}
        value={value}
        options={options}
        getOptionLabel={getOptionLabel}
        onChange={onChange}
        isOptionEqualToValue={isOptionEqualToValue}
        size={size}
        fullWidth
        disabled={disabled}
        renderInput={params => (
          <TextField
            label={label}
            error={error}
            helperText={helperText}
            autoFocus={autoFocus}
            className={className}
            autoComplete={autoComplete}
            placeholder={placeholder}
            variant={variant}
            required={required}
            {...params}
          />
        )}
        {...rest}
      />
    </>
  )
}
