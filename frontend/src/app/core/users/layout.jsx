"use client"
import React from "react"
import { usePathname } from "next/navigation"
import { PersonOutlineOutlined, PersonAddOutlined } from "@mui/icons-material"
import CModuleLayout from "@/components/ui/CModuleLayout"
import { USER_TIPS } from "@/choices/helpTips/user"
import PermissionGuard from "@/components/ui/PermissionGuard"

export default function UsersLayout({ children }) {
  const pathname = usePathname()

  // Inside a user detail route — let [id]/layout.jsx own the full layout
  const isDetailRoute =
    /^\/core\/users\/[^/]+/.test(pathname) &&
    pathname !== "/core/users" &&
    pathname !== "/core/users/pending-invites"

  if (isDetailRoute) {
    return (
      <PermissionGuard resource="user" action="read">
        {children}
      </PermissionGuard>
    )
  }

  const navigators = [
    {
      label: "Users",
      href: "/core/users",
      icon: <PersonOutlineOutlined fontSize="small" />,
    },
    {
      label: "Pending Invites",
      href: "/core/users/pending-invites",
      icon: <PersonAddOutlined fontSize="small" />,
    },
  ]

  const activeTips =
    pathname === "/core/users/pending-invites" ? USER_TIPS.invite_user : USER_TIPS.users

  return (
    <PermissionGuard resource="user" action="read">
      <CModuleLayout helpTips={activeTips}>{children}</CModuleLayout>
    </PermissionGuard>
  )
}
