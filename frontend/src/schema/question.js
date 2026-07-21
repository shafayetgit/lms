import * as yup from "yup"

export const questionValidationSchema = yup.object().shape({
  text: yup.string().required("Question text is required"),
  question_type: yup.string().required("Type is required"),
  marks: yup.number().min(0, "Points must be at least 0").required("Points is required"),
  explanation: yup.string().nullable(),
  choices: yup.array().when("question_type", {
    is: val => ["mcq_single", "mcq_multiple", "true_false"].includes(val),
    then: schema =>
      schema
        .of(
          yup.object().shape({
            text: yup.string().required("Choice text is required"),
            is_correct: yup.boolean().default(false),
          })
        )
        .test(
          "at-least-one-correct",
          "At least one choice must be marked as correct",
          choices => choices && choices.some(c => c.is_correct)
        )
        .required(),
    otherwise: schema => schema.nullable().optional(),
  }),
})
