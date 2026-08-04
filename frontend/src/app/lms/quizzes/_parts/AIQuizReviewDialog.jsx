"use client"
import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Chip,
  Stack,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material"
import Grid from "@mui/material/Grid"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import { toast } from "react-toastify"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CPageLoader from "@/components/ui/CPageLoader"
import CButton from "@/components/ui/CButton"
import CSelect from "@/components/form/CSelect"
import CNumberField from "@/components/form/CNumberField"

import {
  useUpdateAIDraftQuizMutation,
  useConfirmAIDraftQuizMutation,
} from "@/features/aiQuiz/aiQuizAPI"

export default function AIQuizReviewDialog({
  open,
  onClose,
  draftData,
  onConfirmed,
  onRegenerate,
  isRegenerating,
}) {
  const [questions, setQuestions] = useState([])
  const [quizTitle, setQuizTitle] = useState("")

  const [regenOpen, setRegenOpen] = useState(false)
  const [regenDifficulty, setRegenDifficulty] = useState("medium")
  const [regenNumQuestions, setRegenNumQuestions] = useState(5)

  const [updateDraft, { isLoading: isUpdating }] = useUpdateAIDraftQuizMutation()
  const [confirmDraft, { isLoading: isConfirming }] = useConfirmAIDraftQuizMutation()

  useEffect(() => {
    if (draftData?.quiz_data) {
      setQuizTitle(draftData.quiz_data.title || "AI Generated Quiz")
      setQuestions(draftData.quiz_data.questions || [])
    }
    if (draftData) {
      if (draftData.difficulty) setRegenDifficulty(draftData.difficulty)
      if (draftData.num_questions) setRegenNumQuestions(draftData.num_questions)
    }
  }, [draftData])

  if (!draftData) return null

  const qualityScore = draftData.quality_report?.quality_score ?? 100
  const auditPassed = draftData.quality_report?.passed ?? true
  const issues = draftData.quality_report?.issues || []
  const suggestions = draftData.quality_report?.suggestions || []

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions]
    const newOptions = [...updated[qIndex].options]
    const oldVal = newOptions[optIndex]
    newOptions[optIndex] = value
    updated[qIndex].options = newOptions

    if (updated[qIndex].correct_option === oldVal) {
      updated[qIndex].correct_option = value
    }
    setQuestions(updated)
  }

  const handlePublish = async () => {
    try {
      const updatedPayload = {
        quiz_data: {
          ...draftData.quiz_data,
          title: quizTitle,
          questions: questions,
        },
      }
      await updateDraft({
        draftPublicId: draftData.public_id,
        body: updatedPayload,
      }).unwrap()

      const response = await confirmDraft({
        draftPublicId: draftData.public_id,
        body: { title_override: quizTitle },
      }).unwrap()

      toast.success(response?.message || "Quiz confirmed and published successfully!")
      if (onConfirmed) onConfirmed()
      onClose()
    } catch (error) {
      console.error("Publish error:", error)
      toast.error(error?.data?.message || "Failed to publish quiz. Please try again.")
    }
  }

  const handleRegenSubmit = e => {
    e.preventDefault()
    setRegenOpen(false)
    if (onRegenerate) {
      onRegenerate({
        difficulty: regenDifficulty,
        numQuestions: regenNumQuestions,
      })
    }
  }

  return (
    <>
      <CDialog
        title="Review & Confirm AI Quiz"
        maxWidth="md"
        open={open}
        handleCDialogClose={onClose}
      >
        <Box sx={{ py: 1 }}>
          <Card variant="outlined" sx={{ mb: 3, bgcolor: "background.paper" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight={700}>
                  AI Quality Audit Report
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  {onRegenerate && (
                    <CButton
                      label="Regenerate"
                      onClick={() => setRegenOpen(true)}
                      loading={isRegenerating}
                      variant="outlined"
                      color="secondary"
                      size="small"
                    />
                  )}
                  <Chip
                    icon={<CheckCircleOutlineIcon />}
                    label={`Score: ${qualityScore}/100`}
                    color={qualityScore >= 80 ? "success" : qualityScore >= 60 ? "warning" : "error"}
                    fontWeight={700}
                  />
                </Stack>
              </Stack>

            {issues.length > 0 && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                <strong>Issues Flagged:</strong> {issues.join("; ")}
              </Alert>
            )}

            {suggestions.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                <strong>Suggestions:</strong> {suggestions.join("; ")}
              </Typography>
            )}
          </CardContent>
        </Card>

        <CForm
          onSubmit={e => {
            e.preventDefault()
            handlePublish()
          }}
          btnProps={{
            label: "Confirm & Publish Quiz",
            loading: isUpdating || isConfirming,
          }}
          dialog
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CTextField
                label="Quiz Title"
                value={quizTitle}
                onChange={e => setQuizTitle(e.target.value)}
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Generated Questions ({questions.length})
              </Typography>

              {questions.map((q, qIndex) => (
                <Accordion
                  key={qIndex}
                  defaultExpanded={qIndex === 0}
                  elevation={0}
                  variant="outlined"
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600}>
                      Q{qIndex + 1}: {q.question_text || "Untitled Question"}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <CTextField
                          label={`Question ${qIndex + 1} Text`}
                          value={q.question_text}
                          onChange={e =>
                            handleQuestionChange(qIndex, "question_text", e.target.value)
                          }
                          multiline
                          rows={2}
                          required
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" fontWeight={600} mb={1}>
                          Options (Select radio for correct answer):
                        </Typography>
                        <RadioGroup
                          value={q.correct_option}
                          onChange={e =>
                            handleQuestionChange(qIndex, "correct_option", e.target.value)
                          }
                        >
                          {q.options?.map((opt, optIndex) => (
                            <Stack
                              key={optIndex}
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              mb={1}
                            >
                              <FormControlLabel
                                value={opt}
                                control={<Radio size="small" color="success" />}
                                label=""
                                sx={{ mr: 0 }}
                              />
                              <CTextField
                                label={`Option ${optIndex + 1}`}
                                value={opt}
                                onChange={e =>
                                  handleOptionChange(qIndex, optIndex, e.target.value)
                                }
                                size="small"
                                fullWidth
                                required
                              />
                            </Stack>
                          ))}
                        </RadioGroup>
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <CTextField
                          label="Explanation (Optional)"
                          value={q.explanation || ""}
                          onChange={e =>
                            handleQuestionChange(qIndex, "explanation", e.target.value)
                          }
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>
          </Grid>
        </CForm>
      </Box>
    </CDialog>

    <CDialog
      title="Regenerate Quiz Options"
      open={regenOpen}
      handleCDialogClose={() => setRegenOpen(false)}
    >
      <CForm
        onSubmit={handleRegenSubmit}
        width="25rem"
        btnProps={{ label: "Regenerate Quiz", loading: isRegenerating }}
        dialog
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CSelect
              label="Difficulty Level"
              value={regenDifficulty}
              onChange={e => setRegenDifficulty(e.target.value)}
              options={[
                { label: "Easy", value: "easy" },
                { label: "Medium", value: "medium" },
                { label: "Hard", value: "hard" },
              ]}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CNumberField
              label="Number of Questions (1-30)"
              value={regenNumQuestions}
              onChange={val => setRegenNumQuestions(val)}
              min={1}
              max={30}
              required
            />
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
    </>
  )
}
