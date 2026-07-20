import React from "react"
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Divider,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material"
import { AccessTime, BookmarkBorder, NavigateBefore, NavigateNext } from "@mui/icons-material"
import CTextField from "@/components/form/CTextField"
import CButton from "@/components/ui/CButton"
import { formatTimeRemaining } from "@/utils/shared"

export default function ActiveQuiz({
  quiz,
  questions,
  activeQuestionIdx,
  setActiveQuestionIdx,
  selectedAnswers,
  handleAnswerSelect,
  timeLeft,
  markedForReview,
  toggleMarkForReview,
  showConfirmDialog,
  setShowConfirmDialog,
  handleManualSubmit,
  isSubmitting,
}) {
  const currentQuestion = questions[activeQuestionIdx]
  const answeredCount = Object.keys(selectedAnswers).length
  const progressPercent = quiz.duration ? (timeLeft / (quiz.duration * 60)) * 100 : 100

  return (
    <Card sx={{ mt: 2, border: "1px solid", borderColor: "divider", borderRadius: 1, boxShadow: 3 }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header block with title & timer */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography variant="h6" fontWeight="800">
              {quiz.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Attempting Question {activeQuestionIdx + 1} of {questions.length} • {answeredCount} answered
            </Typography>
          </Box>
          {quiz.duration > 0 && (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}>
              <AccessTime color={timeLeft < 60 ? "error" : "primary"} />
              <Typography variant="h6" fontWeight="700" color={timeLeft < 60 ? "error.main" : "text.primary"}>
                {formatTimeRemaining(timeLeft)}
              </Typography>
            </Stack>
          )}
        </Stack>

        {quiz.duration > 0 && (
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            color={timeLeft < 60 ? "error" : "primary"}
            sx={{ height: 6, borderRadius: 1, mb: 3 }}
          />
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Active Question Display */}
        {currentQuestion && (
          <Box sx={{ mb: 4, minHeight: "180px" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight="700">
                QUESTION {activeQuestionIdx + 1}
              </Typography>
              <Typography
                variant="caption"
                sx={{ px: 1.5, py: 0.5, borderRadius: 1, bgcolor: "action.selected", fontWeight: "700" }}
              >
                {currentQuestion.marks} {currentQuestion.marks === 1 ? "Mark" : "Marks"}
              </Typography>
            </Stack>
            <Typography variant="body1" fontWeight="600" sx={{ mb: 3, fontSize: "1.1rem" }}>
              {currentQuestion.text}
            </Typography>

            {currentQuestion.question_type === "short_answer" ? (
              <CTextField
                fullWidth
                placeholder="Type your answer here..."
                value={selectedAnswers[currentQuestion.id]?.answer_text || ""}
                onChange={(e) => handleAnswerSelect(currentQuestion.id, null, e.target.value)}
              />
            ) : (
              <FormControl component="fieldset" sx={{ width: "100%" }}>
                <RadioGroup
                  value={selectedAnswers[currentQuestion.id]?.selected_option_id || ""}
                  onChange={(e) => handleAnswerSelect(currentQuestion.id, parseInt(e.target.value))}
                >
                  {(currentQuestion.choices || []).map((opt) => (
                    <FormControlLabel
                      key={opt.id}
                      value={opt.id}
                      control={<Radio />}
                      label={opt.text}
                      sx={{
                        mb: 1.5,
                        p: 1,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor:
                          selectedAnswers[currentQuestion.id]?.selected_option_id === opt.id
                            ? "primary.main"
                            : "divider",
                        bgcolor:
                          selectedAnswers[currentQuestion.id]?.selected_option_id === opt.id
                            ? "primary.lighter"
                            : "transparent",
                        "&:hover": { bgcolor: "action.hover" },
                        transition: "all 0.2s",
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          </Box>
        )}

        {/* Action Row */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}
        >
          <CButton
            label={markedForReview.includes(currentQuestion.id) ? "Unmark Review" : "Mark for Review"}
            variant="text"
            color="warning"
            onClick={() => toggleMarkForReview(currentQuestion.id)}
            icon={<BookmarkBorder />}
          />

          {/* Pagination Controls */}
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
              disabled={activeQuestionIdx === 0}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <NavigateBefore />
            </IconButton>

            <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", sm: "flex" } }}>
              {questions.map((q, idx) => {
                const isAnswered = !!selectedAnswers[q.id]
                const isMarked = markedForReview.includes(q.id)
                const isActive = idx === activeQuestionIdx

                let bgcolor = "action.hover"
                let color = "text.primary"
                let border = "1px solid transparent"

                if (isActive) {
                  border = "2px solid"
                  color = "primary.main"
                } else if (isMarked) {
                  bgcolor = "warning.light"
                  color = "warning.dark"
                } else if (isAnswered) {
                  bgcolor = "primary.main"
                  color = "primary.contrastText"
                }

                return (
                  <Box
                    key={q.id}
                    onClick={() => setActiveQuestionIdx(idx)}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      bgcolor,
                      color,
                      border,
                      "&:hover": { opacity: 0.8 },
                    }}
                  >
                    {idx + 1}
                  </Box>
                )
              })}
            </Stack>

            <IconButton
              onClick={() => setActiveQuestionIdx((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={activeQuestionIdx === questions.length - 1}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <NavigateNext />
            </IconButton>
          </Stack>

          <CButton
            label="Submit Quiz"
            variant="contained"
            color="primary"
            onClick={() => setShowConfirmDialog(true)}
            disabled={isSubmitting}
            action="send"
          />
        </Stack>

        {/* Marked for Review Tray */}
        {markedForReview.length > 0 && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 1,
              bgcolor: "warning.lighter",
              borderLeft: "4px solid",
              borderColor: "warning.main",
            }}
          >
            <Typography variant="caption" color="warning.dark" fontWeight="700" sx={{ display: "block", mb: 1 }}>
              MARKED FOR REVIEW
            </Typography>
            <Stack direction="row" spacing={1}>
              {markedForReview.map((id) => {
                const idx = questions.findIndex((q) => q.id === id)
                return (
                  <Chip
                    key={id}
                    label={`Q${idx + 1}`}
                    onClick={() => setActiveQuestionIdx(idx)}
                    color="warning"
                    size="small"
                    clickable
                    sx={{ fontWeight: "700" }}
                  />
                )
              })}
            </Stack>
          </Box>
        )}
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle sx={{ fontWeight: "800" }}>Submit Quiz?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to finish and submit your quiz attempt?
          </Typography>
          <Stack spacing={1} sx={{ p: 2, borderRadius: 1, bgcolor: "action.hover" }}>
            <Typography variant="body2">
              Total Questions: <strong>{questions.length}</strong>
            </Typography>
            <Typography variant="body2">
              Answered: <strong>{answeredCount}</strong>
            </Typography>
            <Typography variant="body2">
              Unanswered: <strong>{questions.length - answeredCount}</strong>
            </Typography>
            <Typography variant="body2">
              Marked for Review: <strong>{markedForReview.length}</strong>
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <CButton label="Cancel" onClick={() => setShowConfirmDialog(false)} variant="text" />
          <CButton label="Submit" onClick={handleManualSubmit} variant="contained" action="submit" />
        </DialogActions>
      </Dialog>
    </Card>
  )
}
