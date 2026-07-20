import { IconButton, Tooltip, alpha, useTheme } from "@mui/material"

// Toolbar button with active-state highlight
export default function ToolBtn({ icon, title, onClick, isActive = false, disabled = false }) {
  const theme = useTheme()
  return (
    <Tooltip title={title} arrow>
      <span>
        <IconButton
          type="button"
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{
            borderRadius: 1,
            color: isActive ? "primary.main" : "text.secondary",
            bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : "transparent",
            "&:hover": {
              bgcolor: isActive
                ? alpha(theme.palette.primary.main, 0.15)
                : alpha(theme.palette.text.primary, 0.06),
            },
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  )
}
