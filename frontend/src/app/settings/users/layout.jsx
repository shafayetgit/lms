"use client"
import React from "react"
import { usePathname } from "next/navigation"
import { PersonOutlineOutlined, PersonAddOutlined } from "@mui/icons-material"
import CModuleLayout from "@/components/ui/CModuleLayout"
import { USER_TIPS } from "@/choices/helpTips/user"
import PermissionGuard from "@/components/ui/PermissionGuard"

export default function UsersLayout({ children }) {
  const pathname = usePathname()
  const navigators = [
    {
      label: "Users",
      href: "/settings/users",
      icon: <PersonOutlineOutlined fontSize="small" />,
    },
    {
      label: "Pending Invites",
      href: "/settings/users/pending-invites",
      icon: <PersonAddOutlined fontSize="small" />,
    },
  ]

  const activeTips =
    pathname === "/settings/users/pending-invites" ? USER_TIPS.invite_user : USER_TIPS.users

  return (
    <PermissionGuard resource="user" action="read">
      <CModuleLayout navigators={navigators} helpTips={activeTips}>
        {children}
      </CModuleLayout>
    </PermissionGuard>
  )
}
