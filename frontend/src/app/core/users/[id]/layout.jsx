"use client"
import React, { useEffect, useMemo } from "react"
import { useParams, usePathname } from "next/navigation"
import { useDispatch } from "react-redux"
import {
  InfoOutlined,
  VpnKeyOutlined,
  SettingsOutlined,
  LinkOutlined,
  ComputerOutlined,
  MoreHorizOutlined,
  FlagOutlined,
} from "@mui/icons-material"
import CModuleLayout from "@/components/ui/CModuleLayout"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import { setBreadcrumbLabel } from "@/features/app/appSlice"
import { useGetUserQuery } from "@/features/user/userAPI"
import { USER_TIPS } from "@/choices/helpTips/user"

export default function UserDetailLayout({ children }) {
  const { id } = useParams()
  const pathname = usePathname()
  const dispatch = useDispatch()

  const { data: userResponse, isLoading, isError } = useGetUserQuery(id, { skip: !id })
  const user = userResponse?.data

  useEffect(() => {
    if (user) {
      const name = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "User"
      dispatch(setBreadcrumbLabel({ key: `/core/users/${id}`, label: name }))
    }
  }, [user, id, dispatch])

  const navigators = [
    {
      label: "Details",
      href: `/core/users/${id}/details`,
      icon: <InfoOutlined fontSize="small" />,
    },
    {
      label: "Roles",
      href: `/core/users/${id}/roles`,
      icon: <VpnKeyOutlined fontSize="small" />,
    },
    {
      label: "Feature Flags",
      href: `/core/users/${id}/feature-flags`,
      icon: <FlagOutlined fontSize="small" />,
    },
    {
      label: "Settings",
      href: `/core/users/${id}/settings`,
      icon: <SettingsOutlined fontSize="small" />,
    },
  ]

  // Determine active tab name from pathname
  const segments = pathname.split("/")
  const lastSegment = segments[segments.length - 1]
  const activeTab = lastSegment === id ? "details" : lastSegment

  // Fallback to general users tips if the specific tip doesn't exist
  const activeTips = USER_TIPS[`user_${activeTab}`] || USER_TIPS.users

  if (isLoading) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  return (
    <CModuleLayout navigators={navigators} helpTips={activeTips}>
      {children}
    </CModuleLayout>
  )
}
