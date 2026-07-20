"use client"
import React, { useState, useRef } from "react"
import {
  Box,
  Stack,
  useMediaQuery,
  useTheme,
  Card,
  Typography,
  Divider,
  TextField,
  InputAdornment,
  alpha,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import CToolbar from "./parts/CToolbar"
import CPagination from "./parts/CPagination"
import RowCard from "./parts/RowCard"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { DataGrid, useGridApiRef } from "@mui/x-data-grid"
import StripedDataGrid from "./parts/StripedDataGrid"
export default function CDataTable(props) {
  const {
    rows = [],
    meta,
    columns,
    loading: isLoading,
    filterMode = "server",
    CustomToolbar,
    hideFooter,
    getRowId = (row) => row?.public_id || row?.id,
    getRowHeight,
    hasFilter = true,
    tableHeight = 820,
    action,
    deleteInfo = null,
    checkboxSelection = true,
    onRowSelectionModelChange,
    deleteData = props.deleteData || props.bulkDelete || null,
    additionalFilters,
  } = props

  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedRows, setSelectedRows] = useState([])

  const handleSelectionChange = newSelection => {
    let finalIds = []
    if (newSelection?.type === "include") {
      finalIds = [...newSelection.ids]
    } else if (newSelection?.type === "exclude") {
      const allRowIds = rows.map((row, idx) => (getRowId ? getRowId(row) : (row?.public_id ?? idx)))
      finalIds = allRowIds.filter(id => !newSelection.ids.has(id))
    } else if (Array.isArray(newSelection)) {
      finalIds = newSelection
    }

    setSelectedRows(finalIds)
    if (onRowSelectionModelChange) onRowSelectionModelChange(finalIds)
  }

  const params = new URLSearchParams(searchParams)
  const theme = useTheme()
  const isLgScreen = useMediaQuery(theme.breakpoints.down("lg"))

  const handleFilterModelChange = useDebouncedCallback(filterModel => {
    const quickFilterValue = filterModel.quickFilterValues?.join(" ") || ""

    params.set("term", quickFilterValue)
    params.set("page", 1)

    router.push(`?${params.toString()}`)
  }, 500)

  const handlePageChange = (_, value) => {
    params.set("page", value)
    router.push(`?${params.toString()}`)
  }

  return (
    <Box
      sx={{
        height: "auto",
        width: "100%",
        borderRadius: 1,
        bgcolor: "transparent",
        border: "none",
        boxShadow: "none",
        overflow: "hidden",
        "& .MuiDataGrid-root": {
          border: "none",
          backgroundColor: "transparent",
          borderRadius: 1,
          overflow: "hidden",
          "--DataGrid-rowBorderColor": alpha(theme.palette.divider, 0.06),
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: `${theme.palette.mode === "light" ? "#F8F9FA" : (theme.palette.custom?.table?.headBg || "transparent")} !important`,
          borderBottom: "none !important",
          borderTop: "none !important",
          borderRadius: "8px !important",
          overflow: "hidden !important",
        },
        "& .MuiDataGrid-columnHeader": {
          backgroundColor: `${theme.palette.mode === "light" ? "#F8F9FA" : (theme.palette.custom?.table?.headBg || "transparent")} !important`,
        },
        "& .MuiDataGrid-columnHeader:first-of-type": {
          borderTopLeftRadius: "8px !important",
          borderBottomLeftRadius: "8px !important",
        },
        "& .MuiDataGrid-columnHeader:last-of-type": {
          borderTopRightRadius: "8px !important",
          borderBottomRightRadius: "8px !important",
        },
        "& .MuiDataGrid-toolbarContainer, & .MuiDataGrid-toolbar": {
          border: "none !important",
          borderBottom: "none !important",
          borderTop: "none !important",
          boxShadow: "none !important",
          outline: "none !important",
        },
        "& .MuiDataGrid-main": {
          border: "none !important",
          borderTop: "none !important",
          outline: "none !important",
        },
        "& .MuiDataGrid-withBorderColor": {
          borderColor: "transparent !important",
        },
        "& .MuiDataGrid-columnHeaderTitle": {
          color: "text.secondary",
          textTransform: "capitalize",
          fontSize: "13px",
          fontWeight: 800,
          letterSpacing: "0.05em",
        },
        "& .MuiDataGrid-cell": {
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.04)}`,
        },
        "& .MuiDataGrid-cell:last-child, & .MuiDataGrid-columnHeader:last-child, & .MuiDataGrid-filler":
        {
          borderRight: "none !important",
        },
        "& .MuiDataGrid-columnHeader:last-child .MuiDataGrid-columnSeparator": {
          display: "none !important",
        },
        "& .MuiDataGrid-columnSeparator": {
          visibility: "hidden", // This hides the header dividers unless hovered (MUI default behavior often leaves them visible)
        },
        "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
          outline: "none !important",
        },
        "& .MuiDataGrid-row:focus, & .MuiDataGrid-row:focus-within": {
          outline: "none !important",
        },
        "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
          outline: "none !important",
        },
      }}
    >
      {isLgScreen ? (
        <Stack spacing={2} sx={{ overflowY: "auto", maxHeight: tableHeight }}>
          {hasFilter && (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", width: "100%", flexWrap: "wrap" }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search..."
                defaultValue={searchParams.get("term") || ""}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleFilterModelChange({
                      quickFilterValues: [e.target.value],
                    })
                  }
                }}
                onChange={e => handleFilterModelChange({ quickFilterValues: [e.target.value] })}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  flex: 1,
                  minWidth: 150,
                  "& .MuiInputBase-root": {
                    bgcolor: theme => alpha(theme.palette.background.paper, 0.4),
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      bgcolor: theme => alpha(theme.palette.background.paper, 0.8),
                    },
                    "&.Mui-focused": {
                      bgcolor: "background.paper",
                      boxShadow: theme => `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`,
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme => alpha(theme.palette.divider, 0.15),
                  },
                  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                    borderWidth: "1px",
                  },
                }}
              />

              {additionalFilters && <Box sx={{ display: "flex", alignItems: "center" }}>{additionalFilters}</Box>}
              {action && <Box>{action}</Box>}
            </Box>
          )}

          {isLoading && rows.length === 0 ? (
            <Box
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* <CCircularProgress size={30} /> */}
              <Typography variant="body2" color="text.secondary">
                Loading records...
              </Typography>
            </Box>
          ) : rows.length > 0 ? (
            <Stack>
              {rows.map((row, rIdx) => {
                const key = getRowId ? getRowId(row) : (row?.public_id ?? rIdx)

                return <RowCard key={key} row={row} columns={columns} />
              })}
            </Stack>
          ) : (
            <Box
              sx={{
                p: 8,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SearchIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1, opacity: 0.5 }} />
              <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
                No records found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We couldn&apos;t find any data matching your current filters or search term.
              </Typography>
            </Box>
          )}

          {hasFilter && meta && rows.length > 0 && (
            <CPagination meta={meta} onPageChange={handlePageChange} />
          )}
        </Stack>
      ) : (
        <StripedDataGrid
          autoHeight
          columnHeaderHeight={40}
          density="standard"
          rows={rows}
          columns={columns}
          loading={isLoading}
          showCellVerticalBorder
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          disableColumnMenu
          checkboxSelection={checkboxSelection}
          onRowSelectionModelChange={handleSelectionChange}
          disableRowSelectionOnClick
          disableExporting={true}
          // hideFooterPagination={true}
          hideFooter={hideFooter || false}
          slots={{
            pagination: () =>
              hasFilter && <CPagination meta={meta} onPageChange={handlePageChange} />,
            toolbar: CustomToolbar || CToolbar,
          }}
          slotProps={{
            toolbar: { action, selectedRows, deleteData, additionalFilters },
          }}
          showToolbar={hasFilter}
          filterMode={filterMode || "client"}
          onFilterModelChange={handleFilterModelChange}
          getRowId={getRowId}
          getRowHeight={params => {
            return getRowHeight
          }}
        // getRowClassName={params => (params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd")}
        />
      )}
    </Box>
  )
}

// {
//   field: 'patient',
//   headerName: 'Patient',
//   flex: 1,
//   renderCell: ({ value }) => <Box sx={{
//     whiteSpace: 'normal',
//     wordBreak: 'break-word',
//   }}>{value}</Box>,
// },
