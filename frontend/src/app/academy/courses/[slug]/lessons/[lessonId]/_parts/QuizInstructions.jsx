import React from "react"
import { Card, CardContent, Typography, Box } from "@mui/material"
import CButton from "@/components/ui/CButton"
import HistoryTable from "./HistoryTable"

export default function QuizInstructions({
  quiz,
  questions,
  attempts,
  handleStart,
  setSelectedAttemptId,
}) {
  const completedAttempts = attempts.filter(a => a.status !== "in_progress")

  return (
    <Card
      sx={{
        mt: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}>
        <Typography variant="h6" fontWeight="800">
          {quiz.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          {quiz.description || "Test your understanding with this quiz."}
        </Typography>

        {/* Instructions Panel */}
        <Box
          sx={{
            mb: 3,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 1,
            bgcolor: "action.hover",
            borderLeft: "4px solid",
            borderColor: "primary.main",
          }}
        >
          <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5, color: "primary.main" }}>
            Instructions & Guidelines
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 2.5,
              m: 0,
              fontSize: "0.875rem",
              lineHeight: "1.7",
              color: "text.secondary",
            }}
          >
            <li>Please read the following instructions carefully before starting the quiz.</li>
            <li>
              Do not refresh the page or close this window. Your progress will be saved but the
              timer continues.
            </li>
            <li>
              This quiz consists of <strong>{questions.length}</strong> questions.
            </li>
            {quiz.duration > 0 && (
              <li>
                Time Limit: <strong>{quiz.duration} minutes</strong>. The quiz will auto-submit when
                the timer expires.
              </li>
            )}
            <li>
              Passing Requirement: You must score at least{" "}
              <strong>{quiz.passing_percentage}%</strong>.
            </li>
            {quiz.max_attempts > 0 && (
              <li>
                Maximum Attempts Allowed: <strong>{quiz.max_attempts}</strong>.
              </li>
            )}
            {quiz.enable_negative_marking && (
              <Box component="li" sx={{ color: "error.main", fontWeight: "600" }}>
                Negative Marking: <strong>{quiz.marks_to_cut}</strong> marks will be deducted for
                each incorrect answer.
              </Box>
            )}
          </Box>
        </Box>

        {/* Attempts History */}
        {quiz.show_submission_history && attempts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1.5 }}>
              Previous Attempt History
            </Typography>
            <HistoryTable
              attempts={attempts}
              passingPercentage={quiz.passing_percentage}
              showAnswers={quiz.show_answers}
              onReview={attemptId => setSelectedAttemptId(attemptId)}
            />
          </Box>
        )}

        <CButton
          label={attempts.length > 0 ? "Retake Quiz" : "Start Quiz"}
          variant="contained"
          color="primary"
          onClick={handleStart}
          disabled={quiz.max_attempts > 0 && completedAttempts.length >= quiz.max_attempts}
          action="confirm"
        />

        {quiz.max_attempts > 0 && completedAttempts.length >= quiz.max_attempts && (
          <Typography
            variant="caption"
            color="error.main"
            display="block"
            sx={{ mt: 1.5, fontWeight: "600" }}
          >
            You have reached the maximum number of attempts for this quiz.
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
