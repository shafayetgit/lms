import React, { useState, useEffect } from "react"
import { Box, Typography, Button, Stack, CircularProgress } from "@mui/material"
import { DescriptionOutlined } from "@mui/icons-material"
import CTextField from "@/components/form/CTextField"
import { useReadNoteQuery, useUpsertNoteMutation } from "@/features/tracking/trackingApi"

export default function NotesTab({ activeLesson, isMobile = false }) {
  const { data: noteResponse } = useReadNoteQuery(activeLesson?.public_id, {
    skip: !activeLesson?.public_id,
  })
  const [upsertNote, { isLoading: isSavingNote }] = useUpsertNoteMutation()

  const [noteText, setNoteText] = useState("")
  const [isEditingNote, setIsEditingNote] = useState(false)

  useEffect(() => {
    const fetchedNote = noteResponse?.data?.note || ""
    const timer = setTimeout(() => {
      setNoteText(fetchedNote)
    }, 0)
    return () => clearTimeout(timer)
  }, [noteResponse, activeLesson?.public_id])

  const handleSaveNote = async () => {
    if (!activeLesson?.public_id) return
    try {
      await upsertNote({
        lesson_public_id: activeLesson.public_id,
        note: noteText.trim(),
      }).unwrap()
      setIsEditingNote(false)
    } catch (err) {
      console.error("Failed to save note:", err)
    }
  }

  const handleClearNote = async () => {
    setNoteText("")
    if (!activeLesson?.public_id) return
    try {
      await upsertNote({
        lesson_public_id: activeLesson.public_id,
        note: "",
      }).unwrap()
      setIsEditingNote(false)
    } catch (err) {
      console.error("Failed to clear note:", err)
    }
  }

  if (!isEditingNote && !noteText.trim()) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          px: 2,
          textAlign: "center",
          cursor: "pointer",
        }}
        onClick={() => setIsEditingNote(true)}
      >
        <DescriptionOutlined sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
        <Typography variant="subtitle2" fontWeight="700" color="text.primary" sx={{ mb: 0.5 }}>
          No notes yet
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, maxWidth: 240 }}>
          Create personal notes to help you remember and review key points from this lesson.
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={e => {
            e.stopPropagation()
            setIsEditingNote(true)
          }}
          sx={{ fontWeight: 600 }}
        >
          Add Note
        </Button>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        mt: isMobile ? 0 : 2,
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <CTextField
        multiline
        fullWidth
        minRows={8}
        placeholder="Make notes for quick revision. Press / for menu."
        value={noteText}
        onChange={e => setNoteText(e.target.value)}
        autoFocus
        onBlur={() => {
          if (!noteText.trim()) {
            setIsEditingNote(false)
          }
        }}
        sx={{
          width: "100%",
        }}
      />
      {noteText.trim() && (
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
          <Button
            size="small"
            disabled={isSavingNote}
            onClick={handleClearNote}
            sx={{ color: "text.secondary", fontWeight: 600 }}
          >
            Clear
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={isSavingNote}
            onClick={handleSaveNote}
            sx={{ fontWeight: 600 }}
          >
            {isSavingNote ? <CircularProgress size={16} color="inherit" /> : "Save"}
          </Button>
        </Stack>
      )}
    </Box>
  )
}
