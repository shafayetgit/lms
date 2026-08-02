"use client"
import React, { useState, useEffect, useRef } from "react"
import { Grid, Typography, Box, Alert, Stack } from "@mui/material"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import { toast } from "react-toastify"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CNumberField from "@/components/form/CNumberField"
import CSelect from "@/components/form/CSelect"
import CPageLoader from "@/components/ui/CPageLoader"
import CButton from "@/components/ui/CButton"

import {
  useGenerateAIQuizMutation,
  useLazyGetAIGenerationStatusQuery,
  useLazyGetAIDraftQuizQuery,
} from "@/features/aiQuiz/aiQuizAPI"
import AIQuizReviewDialog from "./AIQuizReviewDialog"

export default function AIQuizGenerateDialog() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [numQuestions, setNumQuestions] = useState(5)

  // Pipeline Status State
  const [sourcePublicId, setSourcePublicId] = useState(null)
  const [statusMessage, setStatusMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Review Dialog State
  const [reviewOpen, setReviewOpen] = useState(false)
  const [draftQuizData, setDraftQuizData] = useState(null)

  const [generateAIQuiz, { isLoading: isInitiating }] = useGenerateAIQuizMutation()
  const [triggerStatus] = useLazyGetAIGenerationStatusQuery()
  const [triggerDraft] = useLazyGetAIDraftQuizQuery()

  const pollIntervalRef = useRef(null)

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    if (isProcessing) return // Prevent closing while pipeline active
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFile(null)
    setTitle("")
    setDifficulty("medium")
    setNumQuestions(5)
    setSourcePublicId(null)
    setStatusMessage("")
    setIsProcessing(false)
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
  }

  // Clear polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [])

  // Poll status endpoint until completed or failed
  const startPollingStatus = id => {
    setSourcePublicId(id)
    setIsProcessing(true)
    setStatusMessage("Queued for processing...")

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await triggerStatus(id, true).unwrap()
        const currentStatus = res?.data?.status

        if (currentStatus === "queued") {
          setStatusMessage("Queued in queue worker...")
        } else if (currentStatus === "parsing") {
          setStatusMessage("Extracting & parsing document content (OCR)...")
        } else if (currentStatus === "correcting") {
          setStatusMessage("Cleaning & correcting extracted text with AI...")
        } else if (currentStatus === "generating") {
          setStatusMessage("Generating structured quiz questions...")
        } else if (currentStatus === "auditing") {
          setStatusMessage("Auditing quiz quality & accuracy...")
        } else if (currentStatus === "completed") {
          clearInterval(pollIntervalRef.current)
          setStatusMessage("Completed! Loading review editor...")

          const draftRes = await triggerDraft(res?.data?.draft_quiz_public_id, true).unwrap()
          setDraftQuizData(draftRes?.data)
          setIsProcessing(false)
          setOpen(false)
          setReviewOpen(true)
        } else if (currentStatus === "failed") {
          clearInterval(pollIntervalRef.current)
          setIsProcessing(false)
          toast.error(res?.data?.error_message || "Quiz generation failed. Please try again.")
        }
      } catch (err) {
        console.error("Polling status error:", err)
      }
    }, 2000)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!file) {
      toast.error("Please select a document file (.pdf, .docx, .txt, image)")
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)
      formData.append("difficulty", difficulty)
      formData.append("num_questions", numQuestions)

      const response = await generateAIQuiz(formData).unwrap()
      const publicId = response?.data?.public_id

      if (publicId) {
        toast.info("AI Generation task started successfully!")
        startPollingStatus(publicId)
      }
    } catch (error) {
      console.error("Initiate AI Quiz Error:", error)
      toast.error(error?.data?.detail || error?.data?.message || "Failed to start AI Quiz generation")
    }
  }

  return (
    <>
      <CButton
        label="Generate with AI"
        onClick={handleOpen}
        variant="contained"
        color="secondary"
        startIcon={<AutoAwesomeIcon />}
        sx={{ mr: 1 }}
      />

      <CDialog
        title="Generate Quiz with AI"
        open={open}
        handleCDialogOpen={handleOpen}
        handleCDialogClose={handleClose}
      >
        {isProcessing ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <CPageLoader fullPage={false} />
            <Typography variant="h6" fontWeight={600} mt={2}>
              {statusMessage}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Please stay on this window while AI processes your document.
            </Typography>
          </Box>
        ) : (
          <CForm
            onSubmit={handleSubmit}
            width="30rem"
            btnProps={{ label: "Generate Quiz", loading: isInitiating }}
            dialog
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  Upload a PDF, Word document, text file, or image. Our AI Vision & Processing engine will extract content, clean OCR errors, and auto-generate a structured quiz.
                </Alert>
              </Grid>

              {/* Title */}
              <Grid size={{ xs: 12 }}>
                <CTextField
                  label="Quiz Title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Science Evaluation"
                  required
                />
              </Grid>

              {/* File Upload */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    border: "2px dashed",
                    borderColor: file ? "primary.main" : "divider",
                    borderRadius: 1,
                    p: 2,
                    textAlign: "center",
                    bgcolor: "background.paper",
                    cursor: "pointer",
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
                    style={{ display: "none" }}
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        setFile(e.target.files[0])
                        if (!title) {
                          const baseName = e.target.files[0].name.replace(/\.[^/.]+$/, "")
                          setTitle(baseName)
                        }
                      }
                    }}
                  />
                  <Typography variant="body1" fontWeight={600}>
                    {file ? `File: ${file.name}` : "Click to select or drop document here"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports PDF, DOCX, TXT, PNG, JPG (Max 10MB)
                  </Typography>
                </Box>
              </Grid>

              {/* Difficulty Select */}
              <Grid size={{ xs: 6 }}>
                <CSelect
                  label="Difficulty Level"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  options={[
                    { label: "Easy", value: "easy" },
                    { label: "Medium", value: "medium" },
                    { label: "Hard", value: "hard" },
                  ]}
                  required
                />
              </Grid>

              {/* Question Count */}
              <Grid size={{ xs: 6 }}>
                <CNumberField
                  label="Number of Questions (1-30)"
                  value={numQuestions}
                  onChange={e => setNumQuestions(Number(e.target.value))}
                  inputProps={{ min: 1, max: 30 }}
                  required
                />
              </Grid>
            </Grid>
          </CForm>
        )}
      </CDialog>

      {/* Human-in-the-Loop Review Editor Dialog */}
      <AIQuizReviewDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        draftData={draftQuizData}
        onConfirmed={resetForm}
      />
    </>
  )
}
