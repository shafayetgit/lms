"use client"
import React from "react"
import { useFormik } from "formik"
import { Grid, Typography, Box } from "@mui/material"
import { toast } from "react-toastify"
import { useParams, useRouter } from "next/navigation"
import * as Yup from "yup"

import CForm from "@/components/ui/CForm"
import CSelect from "@/components/form/CSelect"
import CAutocomplete from "@/components/form/CAutocomplete"
import CPageLoader from "@/components/ui/CPageLoader"
import CModuleLayout from "@/components/ui/CModuleLayout"

import {
  useReadCertificateRequestQuery,
  useUpdateCertificateRequestMutation,
} from "@/features/certificate/certificateApi"
import { useReadInstructorsQuery } from "@/features/instructor/instructorAPI"
import { mapApiErrorsToFormik } from "@/utils/shared"

const validationSchema = Yup.object().shape({
  status: Yup.string().required("Status is required"),
  evaluator_public_id: Yup.string().when("status", {
    is: "Approved",
    then: schema => schema.required("An evaluator is required when approving"),
    otherwise: schema => schema.nullable(),
  }),
})

export default function RequestDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const { data: requestRes, isLoading: isRequestLoading } = useReadCertificateRequestQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: !id,
  })

  const { data: instructorsRes, isLoading: isInstructorsLoading } = useReadInstructorsQuery({
    size: 100,
  })

  const [updateRequest, { isLoading: isUpdating }] = useUpdateCertificateRequestMutation()

  const request = requestRes?.data
  const instructors = instructorsRes?.data || []

  const instructorOptions = instructors.map(inst => ({
    label: `${inst.first_name} ${inst.last_name} (${inst.email})`,
    value: inst.public_id,
  }))

  const formik = useFormik({
    initialValues: {
      status: request?.status ?? "Pending",
      evaluator_public_id: request?.evaluator?.public_id ?? "",
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        await updateRequest({ id, body: values }).unwrap()
        toast.success("Certificate request updated successfully")
        router.push("/lms/evaluations")
      } catch (error) {
        const errors = mapApiErrorsToFormik(error)
        setErrors(errors)
        toast.error(error?.data?.message || "Failed to update request")
      }
    },
  })

  if (isRequestLoading || isInstructorsLoading) return <CPageLoader fullPage={false} />

  const helpTips = {
    description:
      "When a student requests a certificate, they need to be evaluated by an instructor.",
    tips: [
      {
        title: "Assign Evaluator",
        description: "Choose an instructor to perform the evaluation session.",
      },
      {
        title: "Approval",
        description:
          "Approving the request automatically generates a pending Evaluation Session for the assigned instructor.",
      },
    ],
  }

  return (
    <CModuleLayout helpTips={helpTips}>
      <Box sx={{ bgcolor: "background.paper", p: 3, borderRadius: 1, boxShadow: 1 }}>
        <Typography variant="h5" mb={1} fontWeight="600">
          Certificate Request Details
        </Typography>

        {request && (
          <Box sx={{ mb: 4, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
            <Typography variant="body1" mb={0.5}>
              <strong>Student:</strong>{" "}
              {request.member?.full_name || request.member?.email || "N/A"}
            </Typography>
            <Typography variant="body1" mb={0.5}>
              <strong>Course/Batch:</strong>{" "}
              {request.course?.title || request.batch?.title || "N/A"}
            </Typography>
            <Typography variant="body1" mb={0.5}>
              <strong>Current Status:</strong> {request.status}
            </Typography>
          </Box>
        )}

        <CForm onSubmit={formik.handleSubmit} width="100%" btnProps={{ loading: isUpdating }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CSelect
                label="Status"
                name="status"
                value={formik.values.status}
                options={[
                  { label: "Pending", value: "Pending" },
                  { label: "Approved", value: "Approved" },
                  { label: "Rejected", value: "Rejected" },
                ]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && formik.errors.status}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CAutocomplete
                label="Assign Evaluator"
                name="evaluator_public_id"
                options={instructorOptions}
                value={
                  formik.values.evaluator_public_id
                    ? instructorOptions.find(
                        opt => opt.value === formik.values.evaluator_public_id
                      ) || null
                    : null
                }
                onChange={(e, val) => formik.setFieldValue("evaluator_public_id", val?.value || "")}
                isOptionEqualToValue={(option, val) => option?.value === val?.value}
                error={
                  formik.touched.evaluator_public_id && Boolean(formik.errors.evaluator_public_id)
                }
                helperText={formik.touched.evaluator_public_id && formik.errors.evaluator_public_id}
              />
            </Grid>
          </Grid>
        </CForm>
      </Box>
    </CModuleLayout>
  )
}
