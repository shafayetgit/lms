const LOWERCASE_REGEX = /[a-z]/
const UPPERCASE_REGEX = /[A-Z]/
const NUMBER_REGEX = /[0-9]/
const SPECIAL_REGEX = /[^A-Za-z0-9]/

/**
 * Check password strength and return normalized score + UI metadata
 * Score range: 0 - 4
 */
export const checkPasswordStrength = (password = "") => {
  if (!password) {
    return {
      score: 0,
      label: "No password",
      color: "error",
      percentage: 0,
    }
  }

  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++

  if (LOWERCASE_REGEX.test(password)) score++
  if (UPPERCASE_REGEX.test(password)) score++
  if (NUMBER_REGEX.test(password)) score++
  if (SPECIAL_REGEX.test(password)) score++

  let normalizedScore = 0

  if (score >= 6) normalizedScore = 4
  else if (score >= 5) normalizedScore = 3
  else if (score >= 4) normalizedScore = 2
  else if (score >= 2) normalizedScore = 1

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
  const strengthColors = ["error", "error", "warning", "info", "success"]

  return {
    score: normalizedScore,
    label: strengthLabels[normalizedScore],
    color: strengthColors[normalizedScore],
    percentage: (normalizedScore + 1) * 20,
  }
}

/**
 * Check password rule requirements individually
 */
export const checkPasswordRequirements = (password = "") => {
  return {
    minLength: password.length >= 8,
    hasLowercase: LOWERCASE_REGEX.test(password),
    hasUppercase: UPPERCASE_REGEX.test(password),
    hasNumber: NUMBER_REGEX.test(password),
    hasSpecial: SPECIAL_REGEX.test(password),
  }
}
