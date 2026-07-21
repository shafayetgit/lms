"use client"
import React, { useState, useEffect } from "react"
import { useFormik } from "formik"
import { Grid, Stack, IconButton, Typography, alpha, useTheme } from "@mui/material"
import { Close } from "@mui/icons-material"
import { toast } from "react-toastify"

import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CButton from "@/components/ui/CButton"
import CTextField from "@/components/form/CTextField"
import CNumberField from "@/components/form/CNumberField"
import CSelect from "@/components/form/CSelect"
import CCheckbox from "@/components/form/CCheckbox"
import { useUpdateQuestionMutation } from "@/features/quiz/quizAPI"
import { mapApiErrorsToFormik } from "@/utils/shared"
import { questionValidationSchema } from "@/schema/question"
import { QUESTION_TYPE_OPTIONS, DEFAULT_CHOICES, TRUE_FALSE_CHOICES } from "@/choices/question"
import PermissionGuard from "@/components/ui/PermissionGuard"

export default function UpdateQuestionDialog({ quizId, question }) {
  const theme = useTheme()
  const [open, setOpen] = useState(false)

  const handleClose = () => setOpen(false)
  const handleOpen = () => setOpen(true)

  const [updateQuestion, { isLoading }] = useUpdateQuestionMutation()

  const formik = useFormik({
    initialValues: {
      text: question?.text ?? "",
      question_type: question?.question_type ?? "mcq_single",
      marks: question?.marks ?? 1,
      explanation: question?.explanation ?? "",
      is_active: question?.is_active ?? true,
      choices: question?.choices?.length
        ? question.choices.map(c => ({ text: c.text, is_correct: c.is_correct }))
        : question?.question_type === "short_answer"
          ? []
          : DEFAULT_CHOICES,
    },
    validationSchema: questionValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        const res = await updateQuestion({
          quizId,
          questionId: question.id,
          body: values,
        }).unwrap()
        toast.success(res?.message || "Question updated")
        handleClose()
      } catch (err) {
        const errors = mapApiErrorsToFormik(err)
        setErrors(errors)
        toast.error(err?.data?.detail || err?.data?.message || "Failed to update question")
      }
    },
  })

  const { values, setFieldValue } = formik

  useEffect(() => {
    if (formik.submitCount > 0 && Object.keys(formik.errors).length > 0) {
      toast.error("Please fill in all required fields correctly.")
    }
  }, [formik.submitCount, formik.errors])

  const isChoiceBased = ["mcq_single", "mcq_multiple", "true_false"].includes(values.question_type)

  const handleTypeChange = e => {
    const type = e.target.value
    setFieldValue("question_type", type)

    if (type === "true_false") {
      setFieldValue("choices", TRUE_FALSE_CHOICES)
    } else if (type === "short_answer") {
      setFieldValue("choices", [])
    } else if (!values.choices?.length || values.question_type === "true_false") {
      setFieldValue("choices", DEFAULT_CHOICES)
    }
  }

  const addChoice = () => {
    setFieldValue("choices", [...values.choices, { text: "", is_correct: false }])
  }

  const removeChoice = index => {
    if (values.choices.length <= 2) return
    setFieldValue(
      "choices",
      values.choices.filter((_, i) => i !== index)
    )
  }

  const handleCorrectToggle = index => {
    if (values.question_type === "mcq_single") {
      const updated = values.choices.map((c, i) => ({
        ...c,
        is_correct: i === index,
      }))
      setFieldValue("choices", updated)
    } else {
      setFieldValue(`choices.${index}.is_correct`, !values.choices[index].is_correct)
    }
  }

  return (
    <PermissionGuard resource="question" action="update" silent>
      <CDialog
        title="Update Question"
        btnProps={{ label: "Update", action: "edit", variant: "outlined", size: "small" }}
        open={open}
        handleCDialogOpen={handleOpen}
        handleCDialogClose={handleClose}
      >
        <CForm
          onSubmit={formik.handleSubmit}
          width="40rem"
          btnProps={{ loading: isLoading, label: "Update Question" }}
          dialog
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CTextField
                label="Question Text"
                name="text"
                value={formik.values.text}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  (formik.touched.text || formik.submitCount > 0) && Boolean(formik.errors.text)
                }
                helperText={(formik.touched.text || formik.submitCount > 0) && formik.errors.text}
                multiline
                rows={2}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CSelect
                label="Question Type"
                name="question_type"
                value={formik.values.question_type}
                options={QUESTION_TYPE_OPTIONS}
                onChange={handleTypeChange}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <CNumberField
                label="Points"
                name="marks"
                value={formik.values.marks}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  (formik.touched.marks || formik.submitCount > 0) && Boolean(formik.errors.marks)
                }
                helperText={(formik.touched.marks || formik.submitCount > 0) && formik.errors.marks}
                required
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <CCheckbox
                label="Active"
                checked={formik.values.is_active}
                onChange={e => setFieldValue("is_active", e.target.checked)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CTextField
                label="Explanation (optional)"
                name="explanation"
                value={formik.values.explanation}
                onChange={formik.handleChange}
                multiline
                rows={2}
              />
            </Grid>

            {isChoiceBased && (
              <Grid size={{ xs: 12 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle2" fontWeight={700}>
                      Choices
                    </Typography>
                    {values.question_type !== "true_false" && (
                      <CButton
                        label="Add Choice"
                        action="add"
                        size="small"
                        variant="outlined"
                        onClick={addChoice}
                      />
                    )}
                  </Stack>

                  {typeof formik.errors.choices === "string" &&
                    (formik.touched.choices || formik.submitCount > 0) && (
                      <Typography variant="caption" color="error.main" fontWeight={600}>
                        {formik.errors.choices}
                      </Typography>
                    )}

                  {values.choices.map((choice, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: choice.is_correct
                          ? alpha(theme.palette.success.main, 0.4)
                          : "divider",
                        bgcolor: choice.is_correct
                          ? alpha(theme.palette.success.main, 0.04)
                          : "transparent",
                        transition: "all 0.2s",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="text.secondary"
                        sx={{ minWidth: 24 }}
                      >
                        {String.fromCharCode(65 + index)}.
                      </Typography>

                      <CTextField
                        label=""
                        placeholder={`Choice ${String.fromCharCode(65 + index)}`}
                        name={`choices.${index}.text`}
                        value={choice.text}
                        onChange={e => setFieldValue(`choices.${index}.text`, e.target.value)}
                        onBlur={formik.handleBlur}
                        error={
                          (formik.touched.choices?.[index]?.text || formik.submitCount > 0) &&
                          Boolean(formik.errors.choices?.[index]?.text)
                        }
                        helperText={
                          (formik.touched.choices?.[index]?.text || formik.submitCount > 0) &&
                          formik.errors.choices?.[index]?.text
                        }
                        size="small"
                        disabled={values.question_type === "true_false"}
                        sx={{ flex: 1 }}
                      />

                      <CCheckbox
                        label="Correct"
                        checked={choice.is_correct}
                        onChange={() => handleCorrectToggle(index)}
                        disabled={values.question_type === "true_false" && index >= 2}
                      />

                      {values.question_type !== "true_false" && values.choices.length > 2 && (
                        <IconButton
                          size="small"
                          onClick={() => removeChoice(index)}
                          sx={{ color: "error.main" }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Grid>
            )}
          </Grid>
        </CForm>
      </CDialog>
    </PermissionGuard>
  )
}
