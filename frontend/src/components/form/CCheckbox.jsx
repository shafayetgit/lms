import { Checkbox, FormControlLabel, Typography } from "@mui/material"

export default function CCheckbox({ name, label, checked, onChange, required = false, ...other }) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          name={name}
          checked={checked}
          onChange={onChange}
          required={required}
          {...other}
        />
      }
      label={<Typography component="span">{label}</Typography>}
      sx={{
        "& .MuiFormControlLabel-asterisk": {
          color: "red",
        },
      }}
    />
  )
}
