"use client";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CToolbar from "./parts/CToolbar";
import CPagination from "./parts/CPagination";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import StripedDataGrid from "./parts/StripedDataGrid";

const RowCard = ({ row, columns }) => {
  const theme = useTheme();
  const gridParams = {
    row,
    id: row.id,
    rowId: row.id,
    columns,
  };

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        background: alpha(theme.palette.common.white, 0.03),
        backdropFilter: "blur(12px)",
        border: "1px solid",
        borderColor: theme.palette.divider,
        boxShadow: "none",
        mb: 1.5,
      }}
    >
      <Stack spacing={1.2}>
        {columns.map((col, index) => {
          const field = col.field;
          let value = row[field];

          const cellParams = {
            ...gridParams,
            value,
            field,
            formattedValue: value,
          };

          if (col.valueGetter) {
            try {
              value = col.valueGetter(cellParams);
              cellParams.value = value;
              cellParams.formattedValue = value;
            } catch (e) {
              console.warn(`Error in valueGetter for ${field}:`, e);
            }
          }

          const cellValue = col.renderCell
            ? col.renderCell(cellParams)
            : value?.toString() || "-";

          return (
            <Stack
              key={`${field || "col"}-${index}`}
              direction="column"
              // sx={{
              //   display: "flex",
              //   justifyContent: "space-between",
              //   alignItems: "flex-start",
              //   gap: 2,
              // }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  fontSize: 9,
                  minWidth: 90,
                  pt: 0.5,
                  letterSpacing: 0.5,
                }}
              >
                {col.headerName || field || "---"}
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  textAlign: "right",
                  color: "text.primary",
                  overflow: "hidden",
                }}
              >
                {typeof cellValue === "string" ||
                typeof cellValue === "number" ? (
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, wordBreak: "break-word" }}
                  >
                    {cellValue}
                  </Typography>
                ) : (
                  <Box sx={{ display: "inline-block", maxWidth: "100%" }}>
                    {cellValue}
                  </Box>
                )}
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </Card>
  );
};

export default function CDataTable(props) {
  const {
    rows = [],
    meta,
    columns,
    isLoading,
    filterMode = "server",
    CustomToolbar,
    hideFooter,
    getRowId,
    getRowHeight,
    hasFilter = true,
    tableHeight = 820,
  } = props;

  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const theme = useTheme();
  const isLgScreen = useMediaQuery(theme.breakpoints.down("lg"));

  const handleFilterModelChange = useDebouncedCallback((filterModel) => {
    const quickFilterValue = filterModel.quickFilterValues?.join(" ") || "";

    params.set("term", quickFilterValue);
    params.set("page", 1);

    router.push(`?${params.toString()}`);
  }, 500);

  const handlePageChange = (_, value) => {
    params.set("page", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <Box
      sx={{
        height: isLgScreen ? "auto" : tableHeight,
        width: "100%",
        borderRadius: isLgScreen ? 0 : 4,
        // backgroundColor: "background.paper",
        border: (theme) =>
          `1px solid ${theme.palette.patient?.generic?.border || "rgba(255,255,255,0.06)"}`,
        boxShadow: (theme) => theme.palette.patient?.generic?.shadow || "none",
        overflow: "hidden",
        "& .MuiDataGrid-root": {
          border: "none",
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: (theme) =>
            theme.palette.patient?.generic?.tableHeadBg ||
            "rgba(255,255,255,0.03)",
        },
      }}
    >
      {isLgScreen ? (
        <Stack spacing={2} sx={{ overflowY: "auto", maxHeight: tableHeight }}>
          {hasFilter && (
            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
              defaultValue={searchParams.get("term") || ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFilterModelChange({
                    quickFilterValues: [e.target.value],
                  });
                }
              }}
              onChange={(e) =>
                handleFilterModelChange({ quickFilterValues: [e.target.value] })
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiInputBase-root": {
                  borderRadius: 3,
                  bgcolor: (theme) => alpha(theme.palette.common.white, 0.03),
                },
              }}
            />
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
                const key = getRowId ? getRowId(row) : (row.id ?? rIdx);

                return <RowCard key={key} row={row} columns={columns} />;
              })}
            </Stack>
          ) : (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                No records found.
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Check your filters or try a different search term.
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
          density="standard"
          rows={rows}
          columns={columns}
          loading={isLoading}
          showCellVerticalBorder
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          disableColumnMenu
          checkboxSelection={false}
          disableRowSelectionOnClick
          disableExporting={true}
          // hideFooterPagination={true}
          hideFooter={hideFooter || false}
          slots={{
            pagination: () =>
              hasFilter && (
                <CPagination meta={meta} onPageChange={handlePageChange} />
              ),
            toolbar: CustomToolbar || CToolbar,
          }}
          showToolbar={hasFilter}
          filterMode={filterMode || "client"}
          onFilterModelChange={handleFilterModelChange}
          getRowId={getRowId}
          getRowHeight={(params) => {
            return getRowHeight;
          }}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
        />
      )}
    </Box>
  );
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
