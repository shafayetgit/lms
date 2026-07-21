import { Checkbox, FormControlLabel, Typography, Box } from "@mui/material"

export default function CCheckbox({
  name,
  label,
  checked,
  onChange,
  required = false,
  size = "small",
  sx = {},
  ...other
}) {
  return (
    <FormControlLabel
      required={false}
      control={
        <Checkbox
          name={name}
          checked={checked}
          onChange={onChange}
          required={required}
          size={size}
          sx={{
            p: 0.5,
            mr: 1,
            color: "text.secondary",
            "&.Mui-checked": {
              color: "primary.main",
            },
          }}
          {...other}
        />
      }
      label={
        <Typography
          component="span"
          variant="body2"
          sx={{ fontWeight: 500, color: "text.primary" }}
        >
          {label}
          {required && (
            <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
              *
            </Box>
          )}
        </Typography>
      }
      sx={{
        userSelect: "none",
        ml: 0,
        mr: 2,
        alignItems: "center",
        ...sx,
      }}
    />
  )
}
