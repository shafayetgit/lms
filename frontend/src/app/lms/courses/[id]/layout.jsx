"use client"
import React from "react"
import { useParams } from "next/navigation"
import { useReadCourseQuery } from "@/features/course/courseAPI"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"

export default function CourseDetailLayout({ children }) {
  const { id } = useParams()
  const { data: { data } = {} } = useReadCourseQuery({ id }, { skip: !id })

  useSetBreadcrumb(data?.title, `/lms/courses/${id}`)

  return children
}
