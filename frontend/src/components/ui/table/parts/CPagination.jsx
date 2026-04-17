import { Box, Pagination, PaginationItem, alpha } from "@mui/material"
import { ArrowBack, ArrowForward } from "@mui/icons-material"

export default function CPagination({ data, onPageChange }) {
  return (
    <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
      <Pagination
        count={Number(data?.last_page) || 1}
        page={Number(data?.current_page) || 1}
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
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
            }
          }
        }}
        renderItem={item => (
          <PaginationItem slots={{ previous: ArrowBack, next: ArrowForward }} {...item} />
        )}
        shape="circular"
        variant="text"
      />
    </Box>
  )
}
