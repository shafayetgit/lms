import React, { useEffect } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Box, Typography, Grid } from "@mui/material"
import { toast } from "react-toastify"
import CTextField from "@/components/form/CTextField"
import CCheckbox from "@/components/form/CCheckbox"
import CForm from "@/components/ui/CForm"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import { useGetUserQuery, useUpdateUserMutation } from "@/features/user/userAPI"
import { mapApiErrorsToFormik } from "@/utils/shared"

const userValidationSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  username: Yup.string().required("Username is required"),
  timezone: Yup.string().required("Timezone is required"),
})

export default function DetailsTab({ userId }) {
  const {
    data: userResponse,
    isLoading: isLoadingUser,
    isError,
  } = useGetUserQuery(userId, { skip: !userId })
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()

  const user = userResponse?.data

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone_number: "",
      timezone: "UTC",
      is_active: true,
    },
    validationSchema: userValidationSchema,
    onSubmit: async (values, { setErrors }) => {
      try {
        const payload = {
          publicId: userId,
          first_name: values.first_name,
          last_name: values.last_name,
          username: values.username,
          phone_number: values.phone_number || null,
          timezone: values.timezone,
          is_active: values.is_active,
        }

        await updateUser(payload).unwrap()
        toast.success("User updated successfully")
      } catch (error) {
        const formikErrors = mapApiErrorsToFormik(error)
        setErrors(formikErrors)
        toast.error(error?.data?.detail || error?.data?.message || "Failed to update user")
      }
    },
  })

  const { setValues } = formik

  useEffect(() => {
    if (user) {
      setValues({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        timezone: user.timezone || "UTC",
        is_active: user.is_active ?? true,
      })
    }
  }, [user, setValues])

  if (isLoadingUser) return <CPageLoader fullPage={false} />
  if (isError) return <CError fullPage={false} />

  const fullName = `${formik.values.first_name || ""} ${formik.values.last_name || ""}`.trim()

  return (
    <CForm
      onSubmit={formik.handleSubmit}
      width="100%"
      sx={{ maxWidth: 900 }}
      btnProps={{
        label: "Save",
        action: "",
        loading: isUpdating,
      }}
    >
      <Grid container spacing={3}>
        {/* Row 1: Names */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <CTextField
            label="First Name"
            name="first_name"
            value={formik.values.first_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.first_name && Boolean(formik.errors.first_name)}
            helperText={formik.touched.first_name && formik.errors.first_name}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CTextField
            label="Last Name"
            name="last_name"
            value={formik.values.last_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.last_name && Boolean(formik.errors.last_name)}
            helperText={formik.touched.last_name && formik.errors.last_name}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CTextField label="Full Name" value={fullName} disabled />
        </Grid>

        {/* Row 2: Contact & Identity */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <CTextField label="Email" name="email" value={formik.values.email} disabled required />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CTextField
            label="Username"
            name="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CTextField
            label="Phone Number"
            name="phone_number"
            value={formik.values.phone_number}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
            helperText={formik.touched.phone_number && formik.errors.phone_number}
          />
        </Grid>

        {/* Row 3: Settings */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <CTextField
            label="Time Zone"
            name="timezone"
            value={formik.values.timezone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.timezone && Boolean(formik.errors.timezone)}
            helperText={formik.touched.timezone && formik.errors.timezone}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CTextField label="Language" value="English" disabled />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CCheckbox
            label="Enabled"
            checked={formik.values.is_active}
            onChange={e => formik.setFieldValue("is_active", e.target.checked)}
          />
        </Grid>
      </Grid>
    </CForm>
  )
}
