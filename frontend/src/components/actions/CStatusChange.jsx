"use client"
import { toast } from "react-toastify"
import CButton from "@/components/CButton"
import { Delete } from "@mui/icons-material"
import CDialog from "../CDialog"
import CForm from "../CForm"
import { Grid } from "@mui/material"
import CSelect from "../CSelect"
import { useState } from "react"
import { useFormik } from "formik"

export default function CStatusChange({
  mutationFn,
  options,
  values,
  label = "Change Status",
  id,
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const handleClose = () => setOpen(false)
  const handleOpen = () => setOpen(true)

  const [updateStatus, { isLoading }] = mutationFn()

  const formik = useFormik({
    initialValues: values,
    onSubmit: async (formData, { resetForm }) => {
      try {
        const response = await updateStatus({ id: id, body: formData }).unwrap()
        toast.success(response?.message)
        resetForm()
        handleClose()
      } catch (error) {
        console.error("Error while updating:", error)
        toast.error(error?.data?.message || "Something went wrong")
      }
    },
  })

  return (
    <CDialog
      title="Change Status"
      btnProps={{ label, variant: "outlined", disabled: disabled }}
      open={open}
      handleCDialogOpen={handleOpen}
      handleCDialogClose={handleClose}
    >
      <CForm onSubmit={formik.handleSubmit} width="30rem" dialog btnProps={{ loading: isLoading }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CSelect
              label="Select Status"
              name="value"
              value={formik.values.value}
              options={options}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>
      </CForm>
    </CDialog>
  )
}
