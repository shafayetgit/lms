import { TextField } from "@mui/material";

export default function CTextField({
  fullWidth = true,
  size = "large",
  slotProps = {},
  sx = {},
  ...rest
}) {
  return (
    <TextField
      fullWidth={fullWidth}
      size={size}
      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 }, ...sx }}
      {...rest}
      slotProps={{
        inputLabel: {
          sx: {
            "& .MuiInputLabel-asterisk": {
              color: "error.main",
            },
          },
        },

        ...slotProps,
      }}
    />
  );
}
