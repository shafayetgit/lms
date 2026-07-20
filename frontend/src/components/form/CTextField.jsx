import { TextField } from "@mui/material";

export default function CTextField({
  fullWidth = true,
  size = "small",
  slotProps = {},
  InputProps = {},
  InputLabelProps = {},
  sx = {},
  ...rest
}) {
  return (
    <TextField
      fullWidth={fullWidth}
      size={size}
      sx={{  ...sx }}
      {...rest}
      slotProps={{
        input: {
          ...InputProps,
          ...slotProps.input,
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
        ...slotProps,
      }}
    />
  );
}
