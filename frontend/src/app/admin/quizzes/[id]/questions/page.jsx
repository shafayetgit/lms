"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useReadQuizQuery } from "@/features/quiz/quizAPI";
import CPageLoader from "@/components/ui/CPageLoader";
import CError from "@/components/ui/CError";
import ModuleContainer from "@/components/ui/ModuleContainer";
import QuestionsBuilder from "../_parts/QuestionsBuilder";

export default function QuestionsPage() {
  const { id } = useParams();

  const { data: quizData, isLoading, isError } = useReadQuizQuery(
    { id },
    { refetchOnMountOrArgChange: true, skip: !id }
  );

  if (isLoading) return <CPageLoader fullPage={false} />;
  if (isError) return <CError fullPage={false} />;

  const breadcrumbs = [
    { label: "Dashboard", path: "/" },
    { label: "Quizzes", path: "/admin/quizzes" },
    { label: quizData?.data?.title || "Quiz", path: `/admin/quizzes/${id}` },
    { label: "Questions", path: "" },
  ];

  return (
    <ModuleContainer breadcrumbs={breadcrumbs}>
      {id && quizData?.data && (
        <QuestionsBuilder quizId={id} questions={quizData.data.questions || []} />
      )}
    </ModuleContainer>
  );
}
