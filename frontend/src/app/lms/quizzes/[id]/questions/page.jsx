"use client"
import React from "react"
import { useParams } from "next/navigation"
import { useReadQuizQuery } from "@/features/quiz/quizAPI"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import PermissionGuard from "@/components/ui/PermissionGuard"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"
import QuestionsBuilder from "../_parts/QuestionsBuilder"
import { InfoOutlined, Quiz, Assignment } from "@mui/icons-material"
import { QUIZ_TIPS } from "@/choices/helpTips/quiz"

export default function QuestionsPage() {
  const { id } = useParams()

  const {
    data: quizData,
    isLoading,
    isError,
  } = useReadQuizQuery({ id }, { refetchOnMountOrArgChange: true, skip: !id })

  useSetBreadcrumb(quizData?.data?.title, `/lms/quizzes/${id}`)

  if (isLoading) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  const navigators = [
    {
      label: "Details",
      href: `/lms/quizzes/${id}`,
      icon: <InfoOutlined />,
      resource: "quiz",
      action: "read",
    },
    {
      label: "Questions",
      href: `/lms/quizzes/${id}/questions`,
      icon: <Quiz />,
      resource: "question",
      action: "read",
    },
    {
      label: "Submissions",
      href: `/lms/quizzes/${id}/submissions`,
      icon: <Assignment />,
      resource: "quiz_submission",
      action: "read",
    },
  ]

  return (
    <PermissionGuard resource="question" action="read">
      <CModuleLayout navigators={navigators} helpTips={QUIZ_TIPS.details}>
        {id && quizData?.data && (
          <QuestionsBuilder quizId={id} questions={quizData.data.questions || []} />
        )}
      </CModuleLayout>
    </PermissionGuard>
  )
}
