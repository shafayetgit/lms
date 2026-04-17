"use client"

import { useRef } from "react"
import { Box } from "@mui/material"

const OTP_LENGTH = 6

const OtpInput = ({ onChange, error }) => {
  const inputsRef = useRef([])

  const handleInput = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1)
    e.target.value = val
    const digits = inputsRef.current.map(el => el?.value || "")
    if (val && idx < OTP_LENGTH - 1) inputsRef.current[idx + 1]?.focus()
    onChange(digits.join(""))
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !e.target.value && idx > 0) {
      inputsRef.current[idx - 1].value = ""
      inputsRef.current[idx - 1]?.focus()
      const digits = inputsRef.current.map(el => el?.value || "")
      onChange(digits.join(""))
    }
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus()
    if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) inputsRef.current[idx + 1]?.focus()
  }

  const handlePaste = e => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
    pasted.split("").forEach((ch, i) => {
      if (inputsRef.current[i]) inputsRef.current[i].value = ch
    })
    const next = Math.min(pasted.length, OTP_LENGTH - 1)
    inputsRef.current[next]?.focus()
    onChange(inputsRef.current.map(el => el?.value || "").join(""))
  }

  return (
    <Box display="flex" gap="clamp(4px, 2vw, 8px)" mb={3}>
      {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
        <Box
          key={idx}
          component="input"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          ref={el => (inputsRef.current[idx] = el)}
          onInput={e => handleInput(e, idx)}
          onKeyDown={e => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          sx={{
            flex: 1,
            minWidth: 0,
            height: "clamp(44px, 12vw, 52px)",
            textAlign: "center",
            fontSize: "clamp(18px, 5vw, 22px)",
            fontWeight: 600,
            border: "1px solid",
            borderColor: error ? "error.main" : "divider",
            borderRadius: 1.5,
            outline: "none",
            bgcolor: "background.paper",
            color: "text.primary",
            transition: "border-color 0.15s, box-shadow 0.15s",
            "&:focus": {
              borderColor: "primary.main",
              boxShadow: theme =>
                `0 0 0 3px ${theme.palette.primary.main}26`,
            },
          }}
        />
      ))}
    </Box>
  )
}

export { OTP_LENGTH }
export default OtpInput