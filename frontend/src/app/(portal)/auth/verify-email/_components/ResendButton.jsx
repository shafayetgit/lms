"use client"

import { useState, useEffect } from "react"
import { Box, Typography } from "@mui/material"
import CButton from "@/components/ui/CButton"

const ResendButton = ({ onResend, isLoading }) => {
  const [seconds, setSeconds] = useState(30)

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const handleClick = () => {
    onResend()
    setSeconds(30)
  }

  return (
    <Box textAlign="center">
      {seconds > 0 ? (
        <Typography variant="caption" color="text.disabled">
          Resend code in{" "}
          <Typography component="span" variant="caption" color="primary" fontWeight={600}>
            {seconds}s
          </Typography>
        </Typography>
      ) : (
        <CButton
          type="button"
          label="Resend code"
          variant="text"
          size="small"
          loading={isLoading}
          disabled={isLoading}
          onClick={handleClick}
        />
      )}
    </Box>
  )
}

export default ResendButton