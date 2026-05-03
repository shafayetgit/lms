import { MenuItem, TextField } from "@mui/material";

export default function CSelect({ placeholder, size = "small", options = [], ...rest }) {
  return (
    <>
      <TextField
        select
        size={size}
        fullWidth
        {...rest}
        slotProps={{
          inputLabel: {
            sx: {
              "& .MuiInputLabel-asterisk": {
                color: "error.main",
              },
            },
          },
        }}
      >
        {options.map((option, index) => (
          <MenuItem key={index} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
}
