"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToEmailAccounts() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/settings/email-accounts");
  }, [router]);

  return null;
}
