import React, { useState } from "react"
import { Box, Typography, Button, Stack, Avatar, Divider } from "@mui/material"
import { HelpOutline } from "@mui/icons-material"
import CTextField from "@/components/form/CTextField"
import { getCurrentUser } from "@/lib/auth/client"
import {
  useGetCourseDiscussionsQuery,
  useCreateDiscussionMutation,
  useGetDiscussionCommentsQuery,
  useCreateCommentMutation,
} from "@/features/discussion/discussionApi"

export default function CommunityTab({ course, activeLesson, isMobile = false }) {
  const [currentUser] = useState(() => {
    if (typeof window !== "undefined") {
      return getCurrentUser()
    }
    return null
  })

  const [newDiscussion, setNewDiscussion] = useState("")
  const [selectedDiscussionId, setSelectedDiscussionId] = useState(null)
  const [newReplyText, setNewReplyText] = useState("")
  const [isCreatingDiscussion, setIsCreatingDiscussion] = useState(false)
  const [isReplying, setIsReplying] = useState(false)

  const { data: discussionsResponse } = useGetCourseDiscussionsQuery(
    course?.public_id,
    { skip: !course?.public_id }
  )
  const [createDiscussion] = useCreateDiscussionMutation()

  const { data: commentsResponse } = useGetDiscussionCommentsQuery(
    selectedDiscussionId,
    { skip: !selectedDiscussionId }
  )
  const [createComment] = useCreateCommentMutation()

  const handlePostNewDiscussion = async () => {
    if (!newDiscussion.trim() || !course?.public_id) return
    const text = newDiscussion.trim()
    const title = text.split("\n")[0].substring(0, 100)
    try {
      await createDiscussion({
        course_public_id: course.public_id,
        lesson_public_id: activeLesson?.public_id || null,
        title: title,
        body: text,
      }).unwrap()
      setNewDiscussion("")
      setIsCreatingDiscussion(false)
    } catch (err) {
      console.error("Failed to create discussion:", err)
    }
  }

  const handlePostReply = async () => {
    if (!newReplyText.trim() || !selectedDiscussionId) return
    try {
      await createComment({
        discussion_id: selectedDiscussionId,
        body: newReplyText.trim(),
      }).unwrap()
      setNewReplyText("")
      setIsReplying(false)
    } catch (err) {
      console.error("Failed to create reply:", err)
    }
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return "yesterday"
    return `${days}d ago`
  }

  const renderCommentTree = (comments, depth = 0) => {
    if (!comments || comments.length === 0) return null
    return comments.map((comment) => (
      <Box
        key={comment.id}
        sx={{
          ml: depth > 0 ? 3 : 0,
          pl: depth > 0 ? 2 : 0,
          borderLeft: depth > 0 ? "2px solid" : "none",
          borderColor: "divider",
          mt: depth > 0 ? 1.5 : 0,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Avatar
            src={comment.user?.avatar}
            sx={{ width: 28, height: 28, bgcolor: "action.selected", color: "text.primary", fontSize: "0.75rem", fontWeight: 700 }}
          >
            {comment.user?.first_name ? comment.user.first_name[0] : "U"}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" fontWeight="700" color="text.primary">
                {`${comment.user?.first_name || ""} ${comment.user?.last_name || ""}`.trim() || "Student"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTimeAgo(comment.created_at)}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {comment.body}
            </Typography>
          </Box>
        </Stack>
        {comment.replies && comment.replies.length > 0 && renderCommentTree(comment.replies, depth + 1)}
      </Box>
    ))
  }

  const renderDiscussionItem = (disc) => {
    const isExpanded = selectedDiscussionId === disc.id
    const replies = isExpanded ? (commentsResponse || []) : []
    const totalReplies = replies.reduce((count, r) => {
      const countNested = (node) => {
        let c = 1
        if (node.replies) node.replies.forEach((child) => { c += countNested(child) })
        return c
      }
      return count + countNested(r)
    }, 0)

    return (
      <Box key={disc.id} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Avatar
            src={disc.user?.avatar}
            sx={{ width: 36, height: 36, bgcolor: "action.selected", color: "text.primary", fontSize: "0.875rem", fontWeight: 700 }}
          >
            {disc.user?.first_name ? disc.user.first_name[0] : "U"}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" fontWeight="700" color="text.primary">
                  {`${disc.user?.first_name || ""} ${disc.user?.last_name || ""}`.trim() || "Student"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTimeAgo(disc.created_at)}
                </Typography>
              </Stack>
            </Stack>
            <Typography variant="subtitle2" fontWeight="700" sx={{ mt: 0.25, color: "text.primary" }}>
              {disc.title}
            </Typography>
            {disc.body && disc.body !== disc.title && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {disc.body}
              </Typography>
            )}

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="text"
                onClick={() => setSelectedDiscussionId(isExpanded ? null : disc.id)}
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  p: 0,
                  minWidth: 0,
                  fontWeight: 600,
                  color: isExpanded ? "primary.main" : "text.secondary",
                }}
              >
                💬 {isExpanded ? `Hide replies (${totalReplies})` : disc.comment_count > 0 ? `${disc.comment_count} ${disc.comment_count === 1 ? "reply" : "replies"}` : "Reply"}
              </Button>
            </Stack>

            {isExpanded && (
              <Box sx={{ mt: 2, ml: 0, pl: 2, borderLeft: "2px solid", borderColor: "divider" }}>
                {replies.length > 0 ? (
                  <Box sx={{ mb: 2 }}>
                    {renderCommentTree(replies)}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mb: 2 }}>
                    No replies yet. Be the first to respond!
                  </Typography>
                )}

                <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mt: 1.5 }}>
                  <Avatar
                    src={currentUser?.avatar}
                    sx={{ width: 28, height: 28, bgcolor: "action.selected", fontSize: "0.75rem" }}
                  >
                    {currentUser?.first_name ? currentUser.first_name[0] : "U"}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <CTextField
                      placeholder="Write a reply..."
                      fullWidth
                      multiline
                      minRows={1}
                      value={newReplyText}
                      onChange={(e) => setNewReplyText(e.target.value)}
                      onFocus={() => setIsReplying(true)}
                      size="small"
                    />
                    {(newReplyText.trim() || isReplying) && (
                      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          onClick={() => {
                            setNewReplyText("")
                            setIsReplying(false)
                          }}
                          sx={{ color: "text.secondary", textTransform: "none", fontWeight: 600, fontSize: "0.75rem" }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handlePostReply}
                          sx={{ textTransform: "none", fontWeight: 600, borderRadius: 5, px: 2, fontSize: "0.75rem" }}
                        >
                          Reply
                        </Button>
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </Box>
            )}
          </Box>
        </Stack>
      </Box>
    )
  }

  const lessonDiscussions = (discussionsResponse || []).filter(
    (d) => d.lesson_id === activeLesson?.id
  )

  if (lessonDiscussions.length === 0 && !isCreatingDiscussion) {
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
        onClick={() => setIsCreatingDiscussion(true)}
      >
        <HelpOutline sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
        <Typography variant="subtitle2" fontWeight="700" color="text.primary" sx={{ mb: 0.5 }}>
          No discussions yet
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, maxWidth: 240 }}>
          Start a discussion, ask a question, or share interesting details about this lesson with others.
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation()
            setIsCreatingDiscussion(true)
          }}
          sx={{ fontWeight: 600 }}
        >
          Ask a Question
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: isMobile ? 0 : 2 }}>
      <Box sx={{ mb: 3 }}>
        <CTextField
          placeholder="Start a new discussion topic..."
          fullWidth
          multiline
          minRows={1}
          value={newDiscussion}
          onChange={(e) => setNewDiscussion(e.target.value)}
          autoFocus={isCreatingDiscussion}
          onBlur={() => {
            if (!newDiscussion.trim() && lessonDiscussions.length === 0) {
              setIsCreatingDiscussion(false)
            }
          }}
          size="small"
        />
        {(newDiscussion.trim() || isCreatingDiscussion) && (
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
            <Button
              size="small"
              onClick={() => {
                setNewDiscussion("")
                setIsCreatingDiscussion(false)
              }}
              sx={{
                color: "text.secondary",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handlePostNewDiscussion}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 5,
                px: 2,
              }}
            >
              Post Topic
            </Button>
          </Stack>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />
      <Box>
        {lessonDiscussions.map((disc) => renderDiscussionItem(disc))}
      </Box>
    </Box>
  )
}
