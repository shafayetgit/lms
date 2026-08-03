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
} from "@mui/material"
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted"

import CButton from "@/components/ui/CButton"
import CDialog from "@/components/ui/CDialog"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import { formatDate } from "@/utils/cdayjs"

import { useGetAIDraftQuizzesQuery } from "@/features/aiQuiz/aiQuizAPI"
import AIQuizReviewDialog from "./AIQuizReviewDialog"

export default function AIDraftsDialog() {
  const [open, setOpen] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState(null)

  const { data, isLoading, isError, refetch } = useGetAIDraftQuizzesQuery(undefined, {
    skip: !open,
  })

  const drafts = data?.data || []

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
        {isLoading ? (
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
      {selectedDraft && (
        <AIQuizReviewDialog
          open={!!selectedDraft}
          onClose={() => setSelectedDraft(null)}
          draftData={selectedDraft}
          onConfirmed={() => {
            setSelectedDraft(null)
            refetch()
          }}
          // Note: Regeneration flow might need access to sourcePublicId if they want to regenerate from here
          // For now, we skip onRegenerate from this view or we could pass it if we have source_content_public_id
          onRegenerate={null}
        />
      )}
    </>
  )
}
