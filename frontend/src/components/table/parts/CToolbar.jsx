import * as React from 'react';
import {
  Toolbar,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
} from '@mui/x-data-grid';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';

const StyledQuickFilter = styled(QuickFilter)(({ theme }) => ({
  marginLeft: 'auto',
  '& .MuiInputBase-root': {
    borderRadius: 8,
    backgroundColor: alpha(theme.palette.common.white, 0.03),
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.05),
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.background.paper, 1),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
      borderColor: theme.palette.primary.main,
    }
  }
}));

export default function CToolbar() {
  return (
    <Toolbar>
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
    </Toolbar>
  );
}

