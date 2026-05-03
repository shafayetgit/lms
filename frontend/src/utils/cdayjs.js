import dayjs from "dayjs"

/**
 * Format a date to YYYY
 */
export const formatYear = date => (date ? dayjs(date).format("YYYY") : null)
/**
 * Format a date to YYYY-MM-DD
 */
export const formatDate = date => (date ? dayjs(date).format("YYYY-MM-DD") : null)

/**
 * Parse a time string into a dayjs object (base date fixed for consistency)
 */
export const formatTime = time => (time ? dayjs(`1971-04-17 ${time}`) : null)

/**
 * Format a time string to 12-hour with AM/PM
 */
export const formatTime12h = time => (time ? dayjs(`1971-04-17 ${time}`).format("hh:mm A") : null)

/**
 * Format a datetime into 12-hour time with AM/PM
 */
export const formatDateTimeToTime = dateTime =>
  dateTime ? dayjs(dateTime).format("hh:mm A") : null

/**
 * Format a datetime into 24-hour time (HH:mm)
 */
export const formatDateTimeTo24Time = dateTime =>
  dateTime ? dayjs(dateTime).format("HH:mm") : null

/**
 * Format a datetime into YYYY-MM-DD hh:mm A
 */
export const formatDateTime = dateTime =>
  dateTime ? dayjs(dateTime).format("YYYY-MM-DD hh:mm A") : null

/**
 * Normalize and return a date range { startDate, endDate }
 */
export function getDateRange(dateInput) {
  if (!dateInput) return { startDate: null, endDate: null }

  let startDate, endDate

  if (Array.isArray(dateInput)) {
    if (dateInput.length === 1) {
      startDate = endDate = dateInput[0]
    } else {
      startDate = dateInput[0]
      endDate = dateInput[dateInput.length - 1]
    }
  } else if (typeof dateInput === "object" && dateInput !== null) {
    startDate = dateInput.start
    endDate = dateInput.end
  } else {
    // fallback if single value
    startDate = endDate = dateInput
  }

  return {
    startDate: startDate ? formatDate(startDate) : null,
    endDate: endDate ? formatDate(endDate) : null,
  }
}

/**
 * Calculate age in years from a given date of birth.
 * @param {string|Date} dob - The date of birth.
 * @returns {number|null} Age in years, or null if no dob is provided.
 */
export const calculateAge = (dob) => {
  if (!dob) return null
  const birthDate = dayjs(dob)
  return dayjs().diff(birthDate, "year")
}
