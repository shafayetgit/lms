"use client"
import React, { useState, useEffect, useRef } from "react"
import { Typography, Box, Alert, Stack } from "@mui/material"
import Grid from "@mui/material/Grid"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import { toast } from "react-toastify"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CNumberField from "@/components/form/CNumberField"
import CSelect from "@/components/form/CSelect"
import CFileField from "@/components/form/CFileField"
import CPageLoader from "@/components/ui/CPageLoader"
import CButton from "@/components/ui/CButton"

import {
  useGenerateAIQuizMutation,
  useRegenerateAIQuizMutation,
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

  const [sourcePublicId, setSourcePublicId] = useState(null)
  const [statusMessage, setStatusMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const [reviewOpen, setReviewOpen] = useState(false)
  const [draftQuizData, setDraftQuizData] = useState(null)

  const [generateAIQuiz, { isLoading: isInitiating }] = useGenerateAIQuizMutation()
  const [regenerateAIQuiz, { isLoading: isRegenerating }] = useRegenerateAIQuizMutation()
  const [triggerStatus] = useLazyGetAIGenerationStatusQuery()
  const [triggerDraft] = useLazyGetAIDraftQuizQuery()

  const pollIntervalRef = useRef(null)

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    if (isProcessing) return
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

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [])

  const startPollingStatus = id => {
    setSourcePublicId(id)
    setIsProcessing(true)
    setStatusMessage("Queued for processing...")

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await triggerStatus(id, false).unwrap()
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

          const draftRes = await triggerDraft(res?.data?.draft_quiz_public_id, false).unwrap()
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
                <CTextField
                  label="Quiz Title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Science Evaluation"
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CFileField
                  label="Document File"
                  name="file"
                  dragNdrop
                  accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
                  onChange={e => {
                    const selectedFile = e.target.files?.[0]
                    if (selectedFile) {
                      setFile(selectedFile)
                      if (!title) {
                        const baseName = selectedFile.name.replace(/\.[^/.]+$/, "")
                        setTitle(baseName)
                      }
                    } else {
                      setFile(null)
                    }
                  }}
                  required
                />
              </Grid>

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

      <AIQuizReviewDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        draftData={draftQuizData}
        onConfirmed={resetForm}
        onRegenerate={async () => {
          try {
            const formData = new FormData()
            formData.append("difficulty", difficulty)
            formData.append("num_questions", numQuestions)
            
            const res = await regenerateAIQuiz({
              sourcePublicId,
              formData,
            }).unwrap()
            setReviewOpen(false)
            setOpen(true)
            startPollingStatus(sourcePublicId)
          } catch (err) {
            toast.error(err?.data?.message || "Failed to initiate regeneration.")
          }
        }}
        isRegenerating={isRegenerating}
      />
    </>
  )
}
