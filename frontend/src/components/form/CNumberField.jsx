import React from "react"
import { NumberField } from "@base-ui/react/number-field"
import { TextField, InputAdornment, IconButton } from "@mui/material"
import { Add, Remove, Height } from "@mui/icons-material"

const CustomInput = React.forwardRef(function CustomInput(props, ref) {
  // Discard value and onChange to let Base UI's NumberField.Root manage state via context
  const { ownerState, value, onChange, ...other } = props
  return <NumberField.Input {...other} ref={ref} />
})

function CursorGrowIcon(props) {
  return (
    <svg
      width="26"
      height="14"
      viewBox="0 0 24 14"
      fill="black"
      stroke="white"
      {...props}
      style={{ display: "block", ...props.style }}
    >
      <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
    </svg>
  )
}

const CNumberField = React.forwardRef(function CNumberField(
  {
    label,
    error,
    helperText,
    value,
    onChange,
    onBlur,
    name,
    min,
    max,
    step = 1,
    fullWidth = true,
    size = "small",
    slotProps = {},
    InputProps = {},
    InputLabelProps = {},
    sx = {},
    allowOutOfRange = false,
    format,
    allowWheelScrub = false,
    snapOnStep = false,
    id,
    disabled = false,
    readOnly = false,
    required = false,
    ...rest
  },
  ref
) {
  const uniqueId = React.useId()
  const inputId = id || uniqueId

  const rootValue = value === "" || value === null || isNaN(value) ? null : Number(value)

  return (
    <NumberField.Root
      id={inputId}
      value={rootValue}
      onValueChange={val => {
        if (onChange) {
          onChange({
            target: {
              name: name,
              value: val,
            },
          })
        }
      }}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      allowOutOfRange={allowOutOfRange}
      format={format}
      allowWheelScrub={allowWheelScrub}
      snapOnStep={snapOnStep}
    >
      <TextField
        ref={ref}
        fullWidth={fullWidth}
        size={size}
        error={error}
        helperText={helperText}
        label={label}
        name={name}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        value={value ?? ""}
        sx={{
          "& .MuiInputBase-input": {
            textAlign: "center",
            paddingLeft: "4px !important",
            paddingRight: "4px !important",
          },
          ...sx,
        }}
        {...rest}
        slotProps={{
          ...slotProps,
          input: {
            inputComponent: CustomInput,
            ...InputProps,
            ...slotProps.input,
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ ml: -0.75, mr: 0, display: "flex", alignItems: "center", gap: 0.25 }}
              >
                <NumberField.Decrement
                  render={
                    <IconButton
                      size="small"
                      edge="start"
                      disabled={disabled || readOnly}
                      sx={{
                        color: "text.secondary",
                        p: 0.25,
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                  }
                />
                {InputProps?.startAdornment || slotProps.input?.startAdornment}
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment
                position="end"
                sx={{ ml: 0, mr: -0.75, display: "flex", alignItems: "center", gap: 0.25 }}
              >
                {InputProps?.endAdornment || slotProps.input?.endAdornment}
                <NumberField.ScrubArea>
                  <IconButton
                    size="small"
                    component="span"
                    disabled={disabled || readOnly}
                    sx={{
                      color: "text.secondary",
                      cursor: "ew-resize",
                      opacity: 0.6,
                      p: 0.25,
                      "&:hover": { opacity: 1, color: "primary.main" },
                    }}
                  >
                    <Height sx={{ fontSize: 18, transform: "rotate(90deg)" }} />
                  </IconButton>
                  <NumberField.ScrubAreaCursor>
                    <CursorGrowIcon style={{ width: 24, height: 14 }} />
                  </NumberField.ScrubAreaCursor>
                </NumberField.ScrubArea>
                <NumberField.Increment
                  render={
                    <IconButton
                      size="small"
                      edge="end"
                      disabled={disabled || readOnly}
                      sx={{
                        color: "text.secondary",
                        p: 0.25,
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  }
                />
              </InputAdornment>
            ),
          },
          inputLabel: {
            ...InputLabelProps,
            ...slotProps.inputLabel,
            sx: {
              "& .MuiInputLabel-asterisk": {
                color: "error.main",
              },
              ...InputLabelProps?.sx,
              ...slotProps.inputLabel?.sx,
            },
          },
        }}
      />
    </NumberField.Root>
  )
})

export default CNumberField
