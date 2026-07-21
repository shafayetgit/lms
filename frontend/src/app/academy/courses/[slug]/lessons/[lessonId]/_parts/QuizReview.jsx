import React, { useMemo } from "react"
import { Card, CardContent, Typography, Box, Stack, Divider } from "@mui/material"
import { CheckCircle, Close, RadioButtonUnchecked } from "@mui/icons-material"
import CButton from "@/components/ui/CButton"

export default function QuizReview({ questions, submissionDetail, onClose }) {
  const resultsMap = useMemo(() => {
    return (submissionDetail.answers || []).reduce((acc, ans) => {
      acc[ans.question_id] = ans
      return acc
    }, {})
  }, [submissionDetail])

  return (
    <Card sx={{ mt: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="800">
            Quiz Attempt Review
          </Typography>
          <CButton label="Close Review" variant="outlined" onClick={onClose} action="close" />
        </Stack>
        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 1,
            bgcolor: submissionDetail.passing ? "success.lighter" : "error.lighter",
            color: submissionDetail.passing ? "success.dark" : "error.dark",
            border: "1px solid",
            borderColor: submissionDetail.passing ? "success.light" : "error.light",
          }}
        >
          <Typography variant="subtitle1" fontWeight="700">
            Result: {submissionDetail.passing ? "Passed" : "Failed"}
          </Typography>
          <Typography variant="body2">
            Score: {submissionDetail.score} / {submissionDetail.score_out_of} (
            {submissionDetail.percentage.toFixed(1)}%)
          </Typography>
        </Box>

        {questions.map((question, qIdx) => {
          const studentResult = resultsMap[question.id]
          const isCorrect = studentResult?.is_correct || false
          const studentAnswerText = studentResult?.answer_text

          return (
            <Box
              key={question.id}
              sx={{
                mb: 4,
                p: 2.5,
                borderRadius: 1,
                border: "1px solid",
                borderColor: isCorrect ? "success.light" : "error.light",
                bgcolor: "background.paper",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    bgcolor: isCorrect ? "success.main" : "error.main",
                    color: "common.white",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  {qIdx + 1}
                </Box>
                <Typography variant="body1" fontWeight="600">
                  {question.text}
                </Typography>
              </Stack>

              {question.question_type === "short_answer" ? (
                <Box sx={{ ml: 5, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Your Answer:
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="600"
                    color={isCorrect ? "success.main" : "error.main"}
                  >
                    {studentAnswerText || "(No response)"}
                  </Typography>
                  {!isCorrect && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Correct Answer:
                      </Typography>
                      <Typography variant="body1" fontWeight="600" color="success.main">
                        {question.choices.find(c => c.is_correct)?.text || "N/A"}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ ml: 5, display: "flex", flexDirection: "column", gap: 1 }}>
                  {(question.choices || []).map(opt => {
                    const isSelected = studentResult?.selected_option_id === opt.id
                    const isOptCorrect = opt.is_correct

                    let labelColor = "text.primary"
                    let optBg = "transparent"
                    let border = "1px solid"
                    let borderColor = "transparent"

                    if (isOptCorrect) {
                      labelColor = "success.main"
                      optBg = "success.lighter"
                      borderColor = "success.main"
                    } else if (isSelected && !isOptCorrect) {
                      labelColor = "error.main"
                      optBg = "error.lighter"
                      borderColor = "error.main"
                    } else {
                      borderColor = "divider"
                    }

                    return (
                      <Box
                        key={opt.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: optBg,
                          border: border,
                          borderColor: borderColor,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {isOptCorrect ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : isSelected ? (
                          <Close color="error" fontSize="small" />
                        ) : (
                          <RadioButtonUnchecked color="disabled" fontSize="small" />
                        )}
                        <Typography
                          variant="body2"
                          color={labelColor}
                          fontWeight={isSelected || isOptCorrect ? "600" : "400"}
                        >
                          {opt.text}
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
              )}

              {question.explanation && (
                <Box
                  sx={{
                    ml: 5,
                    mt: 2,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    borderLeft: "4px solid",
                    borderColor: "info.main",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="700"
                    display="block"
                    sx={{ textTransform: "uppercase", mb: 0.5 }}
                  >
                    Explanation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {question.explanation}
                  </Typography>
                </Box>
              )}
            </Box>
          )
        })}
      </CardContent>
    </Card>
  )
}
