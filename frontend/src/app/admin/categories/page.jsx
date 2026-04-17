"use client";
import { useSearchParams } from "next/navigation";
import { useListQuery } from "@/features/category/categoryAPI";

export default function Page() {
  const searchParams = useSearchParams();
  const term = searchParams.get("term") ?? "";
  const page = searchParams.get("page") ?? 1;

  const { data } = useListQuery({ page, term });

  return <div>page</div>;
}