import { Search } from "@mui/icons-material";
import { IconButton, InputAdornment, OutlinedInput } from "@mui/material";

export default function CSearchField({ onChange = () => { }, sx = {}, ...other }) {
  return (
    <OutlinedInput
      fullWidth
      placeholder="Search..."
      onChange={onChange}
      size="small"
      sx={{
        borderRadius: "10px",
        ...sx,
      }}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            edge="end"
            sx={{
              color: "text.secondary",
              transition: "color 0.2s ease",
              "&:hover": { color: "text.primary" }
            }}
          >
            <Search />
          </IconButton>
        </InputAdornment>
      }
      {...other}
    />
  );
}
