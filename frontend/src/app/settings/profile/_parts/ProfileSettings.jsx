"use client"
import React, { useState, useEffect, useRef } from "react"
import { Box, Stack, Avatar, IconButton, Typography, Tooltip } from "@mui/material"
import { PhotoCamera } from "@mui/icons-material"
import { toast } from "react-toastify"
import { useGetMeQuery, useUpdateUserMutation } from "@/features/user/userAPI"
import { useAttachMutation } from "@/features/media/mediaApi"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import { uploadMultipleToCloudinary } from "@/lib/cloudinary"
import CPageLoader from "@/components/ui/CPageLoader"

import { useFormik } from "formik"
import { profileSchema } from "@/schema/profile"

const getInitials = (firstName, lastName) => {
  const f = firstName ? firstName.charAt(0) : ""
  const l = lastName ? lastName.charAt(0) : ""
  return `${f}${l}`.toUpperCase() || "U"
}

export default function ProfileSettings() {
  const { data: meResponse, isLoading: isFetching, refetch } = useGetMeQuery()
  const user = meResponse?.data
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()
  const [attach] = useAttachMutation()

  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      timezone: "UTC",
    },
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        await updateUser({ publicId: user.public_id, ...values }).unwrap()
        refetch()
        toast.success("Profile information updated successfully")
      } catch (err) {
        toast.error(
          err?.data?.message || err?.data?.detail || "Failed to update profile information"
        )
      }
    },
  })

  useEffect(() => {
    if (user) {
      formik.setValues({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        timezone: user.timezone || "UTC",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleAvatarChange = async e => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    try {
      const uploadedFiles = await uploadMultipleToCloudinary({
        files: [
          {
            file,
            field: "avatar",
            model: "User",
            model_id: user.public_id,
          },
        ],
      })

      if (uploadedFiles && uploadedFiles.length > 0) {
        await attach(uploadedFiles).unwrap()
        refetch()
        toast.success("Profile photo updated successfully")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to upload profile photo")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      await updateUser({ publicId: user.public_id, avatar: "" }).unwrap()
      refetch()
      toast.success("Profile photo removed")
    } catch (err) {
      toast.error("Failed to remove profile photo")
    }
  }

  if (isFetching) {
    return <CPageLoader fullPage={false} />
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3, mb: 4 }}>
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={user?.avatar || undefined}
            alt={user?.first_name}
            sx={{
              width: 80,
              height: 80,
              fontSize: "2rem",
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            {!user?.avatar && getInitials(user?.first_name, user?.last_name)}
          </Avatar>

          <Tooltip title="Upload Photo">
            <IconButton
              component="label"
              size="small"
              sx={{
                position: "absolute",
                bottom: -4,
                right: -4,
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "background.default" },
              }}
              disabled={isUploading}
            >
              <PhotoCamera fontSize="small" />
              <input
                type="file"
                hidden
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarChange}
              />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>

          {user?.avatar && (
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  cursor: "pointer",
                  color: "error.main",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={handleRemoveAvatar}
              >
                Remove photo
              </Typography>
            </Box>
          )}

          {isUploading && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Uploading...
            </Typography>
          )}
        </Box>
      </Box>

      <CForm
        onSubmit={formik.handleSubmit}
        btnProps={{
          label: "Save",
          action: "",
          loading: isUpdating,
        }}
      >
        <Stack spacing={2.5}>
          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
            <CTextField
              label="First Name"
              name="first_name"
              value={formik.values.first_name}
              onChange={formik.handleChange}
              error={formik.touched.first_name && Boolean(formik.errors.first_name)}
              helperText={formik.touched.first_name && formik.errors.first_name}
              fullWidth
              required
            />
            <CTextField
              label="Last Name"
              name="last_name"
              value={formik.values.last_name}
              onChange={formik.handleChange}
              error={formik.touched.last_name && Boolean(formik.errors.last_name)}
              helperText={formik.touched.last_name && formik.errors.last_name}
              fullWidth
              required
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
            <CTextField
              label="Phone Number"
              name="phone_number"
              value={formik.values.phone_number}
              onChange={formik.handleChange}
              error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
              helperText={formik.touched.phone_number && formik.errors.phone_number}
              fullWidth
            />
            <CTextField
              label="Timezone"
              name="timezone"
              value={formik.values.timezone}
              onChange={formik.handleChange}
              error={formik.touched.timezone && Boolean(formik.errors.timezone)}
              helperText={formik.touched.timezone && formik.errors.timezone}
              fullWidth
            />
          </Box>
        </Stack>
      </CForm>
    </Box>
  )
}
