export const QUESTION_TYPE_OPTIONS = [
  { label: "Single Choice (MCQ)", value: "mcq_single" },
  { label: "Multiple Choice (MCQ)", value: "mcq_multiple" },
  { label: "True / False", value: "true_false" },
  { label: "Short Answer", value: "short_answer" },
]

export const QUESTION_TYPE_LABELS = {
  mcq_single: "Single Choice",
  mcq_multiple: "Multiple Choice",
  true_false: "True / False",
  short_answer: "Short Answer",
}

export const QUESTION_TYPE_COLORS = {
  mcq_single: "primary",
  mcq_multiple: "secondary",
  true_false: "info",
  short_answer: "warning",
}

export const DEFAULT_CHOICES = [
  { text: "", is_correct: true },
  { text: "", is_correct: false },
]

export const TRUE_FALSE_CHOICES = [
  { text: "True", is_correct: true },
  { text: "False", is_correct: false },
]
