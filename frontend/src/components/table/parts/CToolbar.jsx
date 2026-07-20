import * as React from "react"
import { Toolbar, QuickFilter, QuickFilterControl, QuickFilterClear } from "@mui/x-data-grid"
import InputAdornment from "@mui/material/InputAdornment"
import TextField from "@mui/material/TextField"
import CancelIcon from "@mui/icons-material/Cancel"
import SearchIcon from "@mui/icons-material/Search"
import { Box, Typography } from "@mui/material"
import { styled, alpha } from "@mui/material/styles"
import CDelete from "@/components/actions/CDelete"

const StyledQuickFilter = styled(QuickFilter)(({ theme }) => ({
  "& .MuiInputBase-root": {
    borderRadius: 8,
    backgroundColor: alpha(theme.palette.common.white, 0.03),
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.05),
    },
    "&.Mui-focused": {
      backgroundColor: alpha(theme.palette.background.paper, 1),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
      borderColor: theme.palette.primary.main,
    },
  },
}))

import { useGridApiContext } from "@mui/x-data-grid"

export default function CToolbar({ action, selectedRows , deleteData, additionalFilters }) {
  const apiRef = useGridApiContext()

  return (
    <Toolbar
      sx={{
        px: "0 !important",
        mb: 2,
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        borderBottom: "none !important",
        border: "none !important",
      }}
    >
      <Box sx={{ display: "flex", flex: 1, justifyContent: "flex-start", alignItems: "center", gap: 2 }}>
        <StyledQuickFilter expanded>
          <QuickFilterControl
            render={({ ref, ...other }) => (
              <TextField
                {...other}
                sx={{ width: 260 }}
                inputRef={ref}
                aria-label="Search"
                placeholder="Search..."
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: other.value ? (
                      <InputAdornment position="end">
                        <QuickFilterClear
                          edge="end"
                          size="small"
                          aria-label="Clear search"
                          material={{ sx: { marginRight: -0.75 } }}
                        >
                          <CancelIcon fontSize="small" />
                        </QuickFilterClear>
                      </InputAdornment>
                    ) : null,
                    ...other.slotProps?.input,
                  },
                  ...other.slotProps,
                }}
              />
            )}
          />
        </StyledQuickFilter>
        {additionalFilters && <Box>{additionalFilters}</Box>}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        {selectedRows.length > 0 ? (
          <CDelete
            values={{
              model: deleteData?.model,
              filters: [
                {
                  field: deleteData?.field || "public_id",
                  operator: "in",
                  value: selectedRows,
                },
              ],
            }}
            invalidateTag={deleteData?.invalidateTag}
            label={`Delete (${selectedRows.length})`}
            onSuccess={() => {
              if (apiRef?.current) {
                apiRef.current.setRowSelectionModel({ type: "include", ids: new Set() })
              }
            }}
          />
        ) : (
          action
        )}
      </Box>
      {/* {action && <Box sx={{ display: "flex", justifyContent: "flex-end" }}>{action}</Box>} */}
    </Toolbar>
  )
}
