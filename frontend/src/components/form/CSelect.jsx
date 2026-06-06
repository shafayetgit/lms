import { MenuItem, TextField } from "@mui/material";

export default function CSelect({ placeholder, size = "small", options = [], ...rest }) {
  return (
    <>
      <TextField
        select
        size={size}
        fullWidth
        // sx={{
        //   mt: 1,
        //   "& .MuiSelect-select .notranslate::after": placeholder
        //     ? {
        //         content: `"${placeholder}"`,
        //         opacity: 0.42,
        //       }
        //     : {},
        // }}
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
