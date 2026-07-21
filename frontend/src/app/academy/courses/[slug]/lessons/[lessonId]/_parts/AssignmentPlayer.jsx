import React, { useState } from "react"
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material"
import { CheckCircle, Send, AccessTime, Cancel } from "@mui/icons-material"
import { toast } from "react-toastify"
import CTextField from "@/components/form/CTextField"
import {
  useSubmitAssignmentMutation,
  useReadAssignmentQuery,
} from "@/features/assignment/assignmentApi"

export default function AssignmentPlayer({ assignmentId, onCompleted }) {
  const {
    data: assignmentResponse,
    isLoading,
    isError,
  } = useReadAssignmentQuery(assignmentId, { skip: !assignmentId })
  const assignment = assignmentResponse?.data

  const [submitAssignment] = useSubmitAssignmentMutation()
  const [answer, setAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [subResult, setSubResult] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setIsSubmitting(true)
    try {
      const res = await submitAssignment({
        id: assignmentId,
        body: { answer: answer },
      }).unwrap()
      if (res.success) {
        setSubmitted(true)
        setSubResult(res.data)
        setIsEditing(false)
        toast.success("Assignment submitted successfully!")
      }
    } catch (err) {
      console.error("Failed to submit assignment", err)
      const msg =
        err?.data?.message || err?.data?.detail || err?.message || "Failed to submit assignment"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <CircularProgress />
  if (isError || !assignment)
    return <Alert severity="error">Failed to load assignment details</Alert>

  const submission = assignment.my_submission || subResult
  const hasSubmitted = submitted || !!assignment.my_submission

  return (
    <Card sx={{ mt: 2, border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="700">
          Assignment: {assignment.title}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          Type: {assignment.type}
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "action.hover" }}>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {assignment.question}
          </Typography>
        </Paper>

        {hasSubmitted && !isEditing ? (
          <Box sx={{ mt: 2 }}>
            <Alert
              severity={
                submission?.status === "Accepted"
                  ? "success"
                  : submission?.status === "Rejected"
                    ? "error"
                    : "info"
              }
              icon={
                submission?.status === "Accepted" ? (
                  <CheckCircle />
                ) : submission?.status === "Rejected" ? (
                  <Cancel />
                ) : (
                  <AccessTime />
                )
              }
              sx={{ mb: 2 }}
            >
              Assignment Submission Status: {submission?.status || "Pending"}
            </Alert>

            {submission?.grade !== null && submission?.grade !== undefined && (
              <Paper
                variant="outlined"
                sx={{ p: 2, mb: 2, bgcolor: "success.light", color: "success.contrastText" }}
              >
                <Typography variant="subtitle2" fontWeight="700">
                  Grade: {submission.grade} / 100
                </Typography>
              </Paper>
            )}

            <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
              Your Answer:
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, bgcolor: "background.paper" }}>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {submission?.answer}
              </Typography>
            </Paper>

            {submission?.comments && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Instructor Feedback:
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, bgcolor: "action.hover" }}>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", fontStyle: "italic" }}>
                    {submission.comments}
                  </Typography>
                </Paper>
              </Box>
            )}

            {assignment?.answer && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>
                  Reference Answer / Solution:
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, bgcolor: "action.hover" }}>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {assignment.answer}
                  </Typography>
                </Paper>
              </Box>
            )}

            {submission?.status === "Rejected" && (
              <Button
                variant="outlined"
                color="secondary"
                sx={{ mt: 3 }}
                onClick={() => {
                  setAnswer(submission?.answer || "")
                  setIsEditing(true)
                }}
              >
                Resubmit Solution
              </Button>
            )}
          </Box>
        ) : (
          <Box>
            <CTextField
              fullWidth
              multiline
              rows={6}
              placeholder="Write your answer or code here..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
            />
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !answer.trim()}
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Send />}
              >
                {hasSubmitted ? "Resubmit Solution" : "Submit Solution"}
              </Button>
              {isEditing && (
                <Button variant="outlined" color="inherit" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
