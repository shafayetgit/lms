"use client"
import React, { useState } from "react"
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Chip,
  Stack,
  Divider,
  Box,
} from "@mui/material"
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted"

import CButton from "@/components/ui/CButton"
import CDialog from "@/components/ui/CDialog"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import { formatDate } from "@/utils/cdayjs"

import {
  useGetAIDraftQuizzesQuery,
  useRegenerateAIQuizMutation,
  useLazyGetAIGenerationStatusQuery,
  useLazyGetAIDraftQuizQuery,
} from "@/features/aiQuiz/aiQuizAPI"
import AIQuizReviewDialog from "./AIQuizReviewDialog"
import { toast } from "react-toastify"

export default function AIDraftsDialog() {
  const [open, setOpen] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState(null)

  const { data, isLoading, isError, refetch } = useGetAIDraftQuizzesQuery(undefined, {
    skip: !open,
  })

  const [regenerateAIQuiz] = useRegenerateAIQuizMutation()
  const [triggerStatus] = useLazyGetAIGenerationStatusQuery()
  const [triggerDraft] = useLazyGetAIDraftQuizQuery()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const pollIntervalRef = React.useRef(null)

  const drafts = data?.data || []

  React.useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [])

  const startPollingStatus = id => {
    setIsProcessing(true)
    setStatusMessage("Queued for processing...")

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await triggerStatus(id, false).unwrap()
        const currentStatus = res?.data?.status

        if (currentStatus === "queued") {
          setStatusMessage("Queued in queue worker...")
        } else if (currentStatus === "generating") {
          setStatusMessage("Generating structured quiz questions...")
        } else if (currentStatus === "auditing") {
          setStatusMessage("Auditing quiz quality & accuracy...")
        } else if (currentStatus === "completed") {
          clearInterval(pollIntervalRef.current)
          setStatusMessage("Completed! Loading review editor...")

          const draftRes = await triggerDraft(res?.data?.draft_quiz_public_id, false).unwrap()
          setIsProcessing(false)
          setSelectedDraft(draftRes?.data)
          refetch()
        } else if (currentStatus === "failed") {
          clearInterval(pollIntervalRef.current)
          setIsProcessing(false)
          toast.error(res?.data?.error_message || "Quiz regeneration failed. Please try again.")
        }
      } catch (err) {
        console.error("Polling status error:", err)
      }
    }, 2000)
  }

  return (
    <>
      <CButton
        label="Pending AI Drafts"
        onClick={() => setOpen(true)}
        variant="outlined"
        color="secondary"
        startIcon={<FormatListBulletedIcon />}
      />

      <CDialog
        title="Pending AI Quiz Drafts"
        open={open}
        handleCDialogClose={() => setOpen(false)}
        maxWidth="sm"
      >
        {isProcessing ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <CPageLoader fullPage={false} />
            <Typography variant="h6" fontWeight={600} mt={2}>
              {statusMessage}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Please wait while AI regenerates your quiz...
            </Typography>
          </Box>
        ) : isLoading ? (
          <CPageLoader fullPage={false} />
        ) : isError ? (
          <CError fullPage={false} />
        ) : drafts.length === 0 ? (
          <Typography variant="body1" textAlign="center" py={4} color="text.secondary">
            You have no pending AI quiz drafts.
          </Typography>
        ) : (
          <List>
            {drafts.map((draft, idx) => (
              <React.Fragment key={draft.public_id}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => setSelectedDraft(draft)}>
                    <ListItemText
                      primary={
                        <Typography fontWeight={600}>
                          {draft.quiz_data?.title || "Untitled AI Quiz"}
                        </Typography>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} mt={0.5} alignItems="center">
                          <Chip label={draft.difficulty} size="small" variant="outlined" />
                          <Typography variant="caption" color="text.secondary">
                            {draft.num_questions} Questions
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            • Created {formatDate(draft.created_at)}
                          </Typography>
                        </Stack>
                      }
                      secondaryTypographyProps={{ component: "div" }}
                    />
                  </ListItemButton>
                </ListItem>
                {idx < drafts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CDialog>

      {/* Review Dialog for the selected draft */}
      {selectedDraft && !isProcessing && (
        <AIQuizReviewDialog
          open={!!selectedDraft}
          onClose={() => setSelectedDraft(null)}
          draftData={selectedDraft}
          onConfirmed={() => {
            setSelectedDraft(null)
            refetch()
          }}
          onRegenerate={async opts => {
            try {
              const regenDifficulty = opts?.difficulty || selectedDraft.difficulty
              const regenNumQuestions = opts?.numQuestions || selectedDraft.num_questions

              const formData = new FormData()
              formData.append("difficulty", regenDifficulty)
              formData.append("num_questions", regenNumQuestions)

              setSelectedDraft(null) // Close the review dialog

              await regenerateAIQuiz({
                sourcePublicId: selectedDraft.source_content_public_id,
                formData,
              }).unwrap()
              
              startPollingStatus(selectedDraft.source_content_public_id)
            } catch (err) {
              toast.error(err?.data?.message || "Failed to initiate regeneration.")
            }
          }}
        />
      )}
    </>
  )
}
