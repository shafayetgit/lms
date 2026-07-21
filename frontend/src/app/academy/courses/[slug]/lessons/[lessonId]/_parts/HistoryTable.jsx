import React from "react"
import { Box, Typography, Stack, Chip } from "@mui/material"
import CButton from "@/components/ui/CButton"

export default function HistoryTable({ attempts, passingPercentage, showAnswers, onReview }) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        bgcolor: "background.paper",
        mt: 1,
      }}
    >
      {attempts.map((attempt, index) => {
        const passed = attempt.percentage >= passingPercentage
        const dateStr = new Date(attempt.start_time).toLocaleDateString()
        const durationStr = attempt.time_taken
          ? `${Math.floor(attempt.time_taken / 60)}m ${attempt.time_taken % 60}s`
          : "N/A"

        return (
          <Box
            key={attempt.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              bgcolor: index % 2 === 0 ? "background.paper" : "action.hover",
              borderBottom: index < attempts.length - 1 ? "1px solid" : "none",
              borderColor: "divider",
            }}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight="700">
                Attempt #{index + 1}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Date: {dateStr} • Duration: {durationStr}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <Typography
                variant="body2"
                color={passed ? "success.main" : "error.main"}
                fontWeight="700"
              >
                {attempt.score.toFixed(1)} / {attempt.score_out_of.toFixed(1)} (
                {attempt.percentage.toFixed(1)}%)
              </Typography>
              <Chip
                label={passed ? "Passed" : "Failed"}
                size="small"
                color={passed ? "success" : "error"}
                variant="contained"
                sx={{ fontWeight: "700" }}
              />
              {showAnswers && (
                <CButton
                  label="Review Answers"
                  variant="outlined"
                  onClick={() => onReview(attempt.id)}
                  action="view"
                />
              )}
            </Stack>
          </Box>
        )
      })}
    </Box>
  )
}
