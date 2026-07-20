"use client"
import { useParams, redirect } from "next/navigation"

export default function UserDetailPage() {
  const { id } = useParams()
  redirect(`/core/users/${id}/details`)
}
