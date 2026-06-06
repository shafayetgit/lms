import { Box, Pagination, PaginationItem, alpha } from "@mui/material"
import { ArrowBack, ArrowForward } from "@mui/icons-material"

export default function CPagination({ meta, onPageChange }) {
  return (
    <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
      <Pagination
        count={Number(meta?.pages) || 1}
        page={Number(meta?.page) || 1}
        onChange={onPageChange}
        color="primary"
        sx={{
          "& .MuiPaginationItem-root": {
            borderRadius: 2,
            transition: "all 0.2s ease",
            "&.Mui-selected": {
              fontWeight: 700,
            },
            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.1),
            },
          },
        }}
        renderItem={(item) => (
          <PaginationItem
            slots={{ previous: ArrowBack, next: ArrowForward }}
            {...item}
          />
        )}
        shape="circular"
        variant="text"
      />
    </Box>
  )
}

