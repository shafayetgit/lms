import * as yup from "yup";

export const questionValidationSchema = yup.object().shape({
  text: yup.string().required("Question text is required"),
  question_type: yup.string().required("Type is required"),
  points: yup.number().min(0).default(1),
  explanation: yup.string().nullable(),
  choices: yup.array().of(
    yup.object().shape({
      text: yup.string().required("Choice text is required"),
      is_correct: yup.boolean().default(false),
    })
  ),
});
