import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { CircularProgress, Alert } from "@mui/material"
import { toast } from "react-toastify"
import { useReadQuizQuery } from "@/features/quiz/quizAPI"
import {
  useReadMySubmissionsQuery,
  useStartQuizSubmissionMutation,
  useSubmitQuizMutation,
  useReadQuizSubmissionQuery,
} from "@/features/quizSubmission/quizSubmissionAPI"
import { seededShuffle } from "@/utils/shared"
import QuizReview from "./QuizReview"
import ActiveQuiz from "./ActiveQuiz"
import QuizInstructions from "./QuizInstructions"

export default function QuizPlayer({ quizId, onCompleted }) {
  const { data: quizResponse, isLoading, isError } = useReadQuizQuery({ id: quizId, is_portal: true }, { skip: !quizId })
  const quiz = quizResponse?.data
  const { data: attemptsResponse, refetch: refetchAttempts } = useReadMySubmissionsQuery({ quiz_id: quizId }, { skip: !quizId })
  const attempts = useMemo(() => attemptsResponse?.data || [], [attemptsResponse])

  const [startAttempt] = useStartQuizSubmissionMutation()
  const [submitQuiz] = useSubmitQuizMutation()
  const submittedIdsRef = useRef(new Set())

  const [activeAttempt, setActiveAttempt] = useState(null)
  const [selectedAnswers, setSelectedAnswers] = useState({}) // format: { [questionId]: { selected_option_id, answer_text } }
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0)
  const [markedForReview, setMarkedForReview] = useState([])
  const [timeLeft, setTimeLeft] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Review mode state
  const [selectedAttemptId, setSelectedAttemptId] = useState(null)
  const { data: submissionDetailResponse } = useReadQuizSubmissionQuery(
    { id: selectedAttemptId },
    { skip: !selectedAttemptId }
  )
  const submissionDetail = submissionDetailResponse?.data

  // Auto-submit on time limit expiration
  const handleAutoSubmit = useCallback(async (attemptId) => {
    const targetAttemptId = attemptId || activeAttempt?.id
    if (!targetAttemptId) return
    setIsSubmitting(true)
    try {
      const formattedAnswers = Object.entries(selectedAnswers).map(([qId, val]) => ({
        question_id: parseInt(qId),
        selected_option_id: val.selected_option_id || null,
        answer_text: val.answer_text || null,
      }))
      const res = await submitQuiz({
        id: targetAttemptId,
        body: { answers: formattedAnswers },
      }).unwrap()

      if (res.success) {
        submittedIdsRef.current.add(targetAttemptId)
        localStorage.removeItem(`quiz_answers_${targetAttemptId}`)
        localStorage.removeItem(`quiz_marked_${targetAttemptId}`)
        localStorage.removeItem(`quiz_active_idx_${targetAttemptId}`)
        setActiveAttempt(null)
        refetchAttempts()
        if (quiz?.show_answers) {
          setSelectedAttemptId(targetAttemptId)
        }
        if (res.data?.passing && onCompleted) {
          onCompleted()
        }
      }
    } catch (err) {
      console.error("Failed to auto-submit quiz", err)
      toast.error(err?.data?.message || err?.message || "Failed to auto-submit quiz")
      if (err?.status && err.status >= 400 && err.status < 500) {
        submittedIdsRef.current.add(targetAttemptId)
        localStorage.removeItem(`quiz_answers_${targetAttemptId}`)
        localStorage.removeItem(`quiz_marked_${targetAttemptId}`)
        localStorage.removeItem(`quiz_active_idx_${targetAttemptId}`)
        setActiveAttempt(null)
        refetchAttempts()
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [activeAttempt, selectedAnswers, submitQuiz, refetchAttempts, onCompleted, quiz])

  // Restore active attempt from database (if in_progress)
  useEffect(() => {
    if (attempts.length > 0 && !activeAttempt) {
      const inProgressAttempt = attempts.find(a => a.status === "in_progress" && !submittedIdsRef.current.has(a.id))
      if (inProgressAttempt) {
        setActiveAttempt(inProgressAttempt)
        if (quiz?.duration) {
          const startTime = new Date(inProgressAttempt.start_time).getTime()
          const now = new Date().getTime()
          const elapsedSeconds = Math.floor((now - startTime) / 1000)
          const totalSeconds = quiz.duration * 60
          const remaining = totalSeconds - elapsedSeconds
          if (remaining > 0) {
            setTimeLeft(remaining)
          } else {
            handleAutoSubmit(inProgressAttempt.id)
          }
        }
      }
    }
  }, [attempts, quiz, activeAttempt, handleAutoSubmit])

  // Timer countdown hook
  useEffect(() => {
    if (!activeAttempt || !quiz?.duration || timeLeft === null) return
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId)
          handleAutoSubmit(activeAttempt.id)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerId)
  }, [activeAttempt, quiz, timeLeft, handleAutoSubmit])

  // Restore local storage progress when activeAttempt is loaded
  useEffect(() => {
    if (activeAttempt) {
      const savedAnswers = localStorage.getItem(`quiz_answers_${activeAttempt.id}`)
      const savedMarked = localStorage.getItem(`quiz_marked_${activeAttempt.id}`)
      const savedIdx = localStorage.getItem(`quiz_active_idx_${activeAttempt.id}`)
      if (savedAnswers) setSelectedAnswers(JSON.parse(savedAnswers))
      if (savedMarked) setMarkedForReview(JSON.parse(savedMarked))
      if (savedIdx) setActiveQuestionIdx(parseInt(savedIdx))
    }
  }, [activeAttempt])

  // Auto-save progress to local storage
  useEffect(() => {
    if (activeAttempt) {
      localStorage.setItem(`quiz_answers_${activeAttempt.id}`, JSON.stringify(selectedAnswers))
      localStorage.setItem(`quiz_marked_${activeAttempt.id}`, JSON.stringify(markedForReview))
      localStorage.setItem(`quiz_active_idx_${activeAttempt.id}`, String(activeQuestionIdx))
    }
  }, [selectedAnswers, markedForReview, activeQuestionIdx, activeAttempt])

  // Start new attempt
  const handleStart = async () => {
    try {
      const res = await startAttempt({ quiz_id: quizId }).unwrap()
      if (res.success && res.data) {
        setActiveAttempt(res.data)
        setSelectedAnswers({})
        setMarkedForReview([])
        setActiveQuestionIdx(0)
        if (quiz?.duration) {
          setTimeLeft(quiz.duration * 60)
        } else {
          setTimeLeft(null)
        }
      }
    } catch (err) {
      console.error("Failed to start quiz attempt", err)
      toast.error(err?.data?.message || err?.message || "Failed to start quiz attempt")
    }
  }

  // Answer selection handler
  const handleAnswerSelect = (questionId, optionId, textVal = null) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: {
        selected_option_id: optionId,
        answer_text: textVal,
      },
    }))
  }

  // Manual Submit
  const handleManualSubmit = async () => {
    if (!activeAttempt) return
    setIsSubmitting(true)
    try {
      const formattedAnswers = Object.entries(selectedAnswers).map(([qId, val]) => ({
        question_id: parseInt(qId),
        selected_option_id: val.selected_option_id || null,
        answer_text: val.answer_text || null,
      }))
      const res = await submitQuiz({
        id: activeAttempt.id,
        body: { answers: formattedAnswers },
      }).unwrap()

      if (res.success) {
        submittedIdsRef.current.add(activeAttempt.id)
        localStorage.removeItem(`quiz_answers_${activeAttempt.id}`)
        localStorage.removeItem(`quiz_marked_${activeAttempt.id}`)
        localStorage.removeItem(`quiz_active_idx_${activeAttempt.id}`)
        setActiveAttempt(null)
        refetchAttempts()
        if (quiz?.show_answers) {
          setSelectedAttemptId(res.data?.id || activeAttempt.id)
        }
        if (res.data?.passing && onCompleted) {
          onCompleted()
        }
      }
    } catch (err) {
      console.error("Failed to submit quiz", err)
      toast.error(err?.data?.message || err?.message || "Failed to submit quiz")
      if (err?.status && err.status >= 400 && err.status < 500) {
        submittedIdsRef.current.add(activeAttempt.id)
        localStorage.removeItem(`quiz_answers_${activeAttempt.id}`)
        localStorage.removeItem(`quiz_marked_${activeAttempt.id}`)
        localStorage.removeItem(`quiz_active_idx_${activeAttempt.id}`)
        setActiveAttempt(null)
        refetchAttempts()
      }
    } finally {
      setIsSubmitting(false)
      setShowConfirmDialog(false)
    }
  }

  // Toggle mark for review
  const toggleMarkForReview = (questionId) => {
    setMarkedForReview(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const questions = useMemo(() => {
    const rawQuestions = quiz?.questions || []
    if (!quiz?.shuffle_questions) return rawQuestions
    const seed = activeAttempt?.id || submissionDetail?.id || selectedAttemptId
    if (!seed) return rawQuestions
    return seededShuffle(rawQuestions, seed)
  }, [quiz, activeAttempt?.id, submissionDetail?.id, selectedAttemptId])

  if (isLoading) return <CircularProgress />
  if (isError || !quiz) return <Alert severity="error">Failed to load quiz details</Alert>

  // 1. Review Mode view
  if (selectedAttemptId && submissionDetail) {
    return (
      <QuizReview
        questions={questions}
        submissionDetail={submissionDetail}
        onClose={() => setSelectedAttemptId(null)}
      />
    )
  }

  // 2. Active quiz view
  if (activeAttempt) {
    return (
      <ActiveQuiz
        quiz={quiz}
        questions={questions}
        activeQuestionIdx={activeQuestionIdx}
        setActiveQuestionIdx={setActiveQuestionIdx}
        selectedAnswers={selectedAnswers}
        handleAnswerSelect={handleAnswerSelect}
        timeLeft={timeLeft}
        markedForReview={markedForReview}
        toggleMarkForReview={toggleMarkForReview}
        showConfirmDialog={showConfirmDialog}
        setShowConfirmDialog={setShowConfirmDialog}
        handleManualSubmit={handleManualSubmit}
        isSubmitting={isSubmitting}
      />
    )
  }

  // 3. Pre-Quiz Instructions & Guidelines view
  return (
    <QuizInstructions
      quiz={quiz}
      questions={questions}
      attempts={attempts}
      handleStart={handleStart}
      setSelectedAttemptId={setSelectedAttemptId}
    />
  )
}
