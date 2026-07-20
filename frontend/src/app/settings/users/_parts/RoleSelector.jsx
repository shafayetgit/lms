"use client"
import React, { useState } from "react"
import { Box, Menu, MenuItem } from "@mui/material"
import {
  ShieldOutlined,
  SchoolOutlined,
  PersonOutlineOutlined,
  KeyboardArrowDown,
} from "@mui/icons-material"
import { toast } from "react-toastify"
import CButton from "@/components/ui/CButton"
import { useUpdateUserMutation, useGetUserRolesQuery } from "@/features/user/userAPI"

export default function RoleSelector({ user, roles: propRoles = [] }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [updateUser, { isLoading }] = useUpdateUserMutation()
  const { data: rolesResponse } = useGetUserRolesQuery()
  const roles = rolesResponse?.data || []
  const open = Boolean(anchorEl)

  const currentRoleName = (user?.role || "student").toLowerCase()

  const getRoleIcon = roleSlug => {
    switch (roleSlug) {
      case "super-admin":
      case "admin":
        return <ShieldOutlined fontSize="small" />
      case "instructor":
        return <SchoolOutlined fontSize="small" />
      default:
        return <PersonOutlineOutlined fontSize="small" />
    }
  }

  const matchedRole = roles.find(r => r.slug === currentRoleName)
  const displayLabel = matchedRole?.name || (currentRoleName.charAt(0).toUpperCase() + currentRoleName.slice(1))
  const displayIcon = getRoleIcon(currentRoleName)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSelectRole = async targetRoleName => {
    handleClose()
    try {
      await updateUser({
        publicId: user.public_id || user.id,
        role: targetRoleName,
      }).unwrap()
      toast.success(`Role updated to ${targetRoleName}`)
    } catch (e) {
      toast.error(e?.data?.message || "Failed to update user role")
    }
  }

  return (
    <Box>
      <CButton
        onClick={handleClick}
        disabled={isLoading}
        icon={displayIcon}
        endIcon={<KeyboardArrowDown />}
        label={displayLabel}
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: "12px",
            mt: 0.5,
            minWidth: 150,
          },
        }}
      >
        {roles.map(r => (
          <MenuItem
            key={r.id}
            onClick={() => handleSelectRole(r.slug)}
            selected={currentRoleName === r.slug}
          >
            {r.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}
