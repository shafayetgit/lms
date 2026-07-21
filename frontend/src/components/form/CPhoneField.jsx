"use client"

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
  useCallback,
} from "react"
import PropTypes from "prop-types"
import {
  TextField,
  InputAdornment,
  FormLabel,
  Typography,
  Box,
  Button,
  Popper,
  Paper,
  ClickAwayListener,
  FormHelperText,
  FormControl,
} from "@mui/material"
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js"
import countries from "world-countries"
import { KeyboardArrowDown } from "@mui/icons-material"

// Generate country options with phone codes and flags (memoized outside component)
const generateCountryOptions = () => {
  return countries
    .map(country => ({
      code: country.cca2,
      name: country.name.common,
      phoneCode:
        country.idd?.root && country.idd?.suffixes
          ? `${country.idd.root}${country.idd.suffixes[0]}`
          : null,
      flag: country.flag,
    }))
    .filter(country => country.phoneCode)
    .sort((a, b) => a.name.localeCompare(b.name))
}

const COUNTRY_OPTIONS = generateCountryOptions()

const CPhoneField = forwardRef(
  (
    {
      name,
      value = "",
      error = false,
      label,
      helperText,
      fullWidth = true,
      autoFocus = false,
      placeholder = "Enter phone number",
      required = false,
      variant = "outlined",
      size = "small",
      onChange = () => {},
      disabled = false,
      defaultCountry = "CA",
      validateOnChange = true,
      countrySearchPlaceholder = "Search country",
      dropdownWidth = 300,
      dropdownMaxHeight = 400,
      renderCountryOption = null,
      onCountryChange = () => {},
      onValidation = () => {},
      enableAutoDetection = true, // New prop to control auto-detection
      formatOnBlur = true, // New prop to format number on blur
      ...otherProps
    },
    ref
  ) => {
    // State variables
    const [selectedCountry, setSelectedCountry] = useState(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [internalError, setInternalError] = useState({
      isInvalid: false,
      message: "",
    })
    const [localPhoneNumber, setLocalPhoneNumber] = useState("")
    const [isInitialized, setIsInitialized] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)

    const searchInputRef = useRef(null)
    const inputRef = useRef(null)

    // Filter countries based on search term
    const filteredCountries = useMemo(() => {
      if (!searchTerm) return COUNTRY_OPTIONS
      return COUNTRY_OPTIONS.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }, [searchTerm])

    // Find country by code or by phone number
    const findCountryByCode = useCallback(code => {
      return COUNTRY_OPTIONS.find(c => c.code === code) || null
    }, [])

    const findCountryByPhoneNumber = useCallback(
      phoneNumber => {
        try {
          const parsed = parsePhoneNumberFromString(phoneNumber)
          if (parsed?.country) {
            return findCountryByCode(parsed.country)
          }
        } catch (e) {
          // Silently fail
        }
        return null
      },
      [findCountryByCode]
    )

    // Initialize from value prop
    useEffect(() => {
      if (value && !isInitialized) {
        let active = true
        try {
          const parsed = parsePhoneNumberFromString(value)

          if (parsed?.country) {
            const foundCountry = findCountryByCode(parsed.country)
            if (foundCountry) {
              setTimeout(() => {
                if (active) {
                  setSelectedCountry(foundCountry)
                  setLocalPhoneNumber(parsed.nationalNumber)
                  onCountryChange(foundCountry)
                }
              }, 0)
            } else {
              setTimeout(() => {
                if (active) setLocalPhoneNumber(value)
              }, 0)
            }
          } else {
            // Try to detect country from partial number
            const detectedCountry = findCountryByPhoneNumber(value)
            if (detectedCountry) {
              setTimeout(() => {
                if (active) {
                  setSelectedCountry(detectedCountry)
                  onCountryChange(detectedCountry)
                }
              }, 0)
            }
            setTimeout(() => {
              if (active) setLocalPhoneNumber(value)
            }, 0)
          }
        } catch (e) {
          setTimeout(() => {
            if (active) setLocalPhoneNumber(value)
          }, 0)
        }
        setTimeout(() => {
          if (active) setIsInitialized(true)
        }, 0)
        return () => {
          active = false
        }
      }
    }, [value, isInitialized, onCountryChange, findCountryByCode, findCountryByPhoneNumber])

    // Set default country if provided and no value
    useEffect(() => {
      if (!isInitialized && defaultCountry && !value) {
        let active = true
        const country = findCountryByCode(defaultCountry)
        if (country) {
          setTimeout(() => {
            if (active) {
              setSelectedCountry(country)
              onCountryChange(country)
            }
          }, 0)
        }
        setTimeout(() => {
          if (active) setIsInitialized(true)
        }, 0)
        return () => {
          active = false
        }
      }
    }, [defaultCountry, value, isInitialized, onCountryChange, findCountryByCode])

    // Validation function
    const validatePhoneNumber = useCallback((phoneNumber, country) => {
      if (!phoneNumber) {
        return {
          isValid: false,
          message: "Please enter a phone number",
        }
      }

      if (!country?.code) {
        return {
          isValid: false,
          message: "Country could not be detected. Please select manually.",
        }
      }

      try {
        const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber, country.code)
        if (parsedPhoneNumber?.isValid()) {
          return { isValid: true, message: "" }
        }
        return { isValid: false, message: "Invalid phone number for selected country" }
      } catch (e) {
        return { isValid: false, message: "Invalid phone number format" }
      }
    }, [])

    // Format phone number
    const formatPhoneNumber = useCallback((phoneNumber, countryCode) => {
      if (!phoneNumber || !countryCode) return phoneNumber
      try {
        const formatter = new AsYouType(countryCode)
        return formatter.input(phoneNumber)
      } catch {
        return phoneNumber
      }
    }, [])

    // Handle country selection
    const handleCountryChange = useCallback(
      country => {
        setSelectedCountry(country)
        onCountryChange(country)

        if (localPhoneNumber) {
          try {
            // Re-parse with new country
            const parsed = parsePhoneNumberFromString(localPhoneNumber, country.code)
            const formattedNumber = parsed?.nationalNumber || localPhoneNumber
            setLocalPhoneNumber(formattedNumber)

            // Return full international number
            const fullNumber = parsed?.number || localPhoneNumber
            onChange(fullNumber)
          } catch {
            onChange(localPhoneNumber)
          }
        }

        setIsDropdownOpen(false)

        if (validateOnChange && localPhoneNumber) {
          const validation = validatePhoneNumber(localPhoneNumber, country)
          setInternalError({
            isInvalid: !validation.isValid,
            message: validation.message,
          })
          onValidation(validation.isValid, validation.message)
        }
      },
      [
        localPhoneNumber,
        onChange,
        validateOnChange,
        validatePhoneNumber,
        onCountryChange,
        onValidation,
      ]
    )

    // Handle phone number input changes with auto country detection
    const handlePhoneNumberChange = useCallback(
      event => {
        const inputValue = event.target.value
        setLocalPhoneNumber(inputValue)

        let detectedCountry = selectedCountry
        let formattedValue = inputValue

        // Auto-detect country from typed number
        if (enableAutoDetection && inputValue) {
          const countryFromNumber = findCountryByPhoneNumber(inputValue)

          if (countryFromNumber) {
            // Country detected from number
            if (!selectedCountry || countryFromNumber.code !== selectedCountry.code) {
              setSelectedCountry(countryFromNumber)
              onCountryChange(countryFromNumber)
              detectedCountry = countryFromNumber
            }

            try {
              // Format the number with detected country
              const parsed = parsePhoneNumberFromString(inputValue, countryFromNumber.code)
              if (parsed) {
                formattedValue = parsed.nationalNumber
              }
            } catch {
              // Keep original if parsing fails
            }
          } else if (selectedCountry) {
            // No country detected, use selected country for formatting
            try {
              const parsed = parsePhoneNumberFromString(inputValue, selectedCountry.code)
              if (parsed) {
                formattedValue = parsed.nationalNumber
              }
            } catch {
              // Keep original if parsing fails
            }
          }
        }

        // Only update if value actually changed (prevents cursor jumping)
        if (formattedValue !== localPhoneNumber) {
          setLocalPhoneNumber(formattedValue)
        }

        // Build full international number for onChange
        let fullNumber = formattedValue
        if (detectedCountry) {
          try {
            const parsed = parsePhoneNumberFromString(formattedValue, detectedCountry.code)
            fullNumber = parsed?.number || formattedValue
          } catch {
            fullNumber = formattedValue
          }
        }

        onChange(fullNumber)

        // Validate if needed
        if (validateOnChange) {
          const validation = validatePhoneNumber(formattedValue, detectedCountry)
          setInternalError({
            isInvalid: !validation.isValid,
            message: validation.message,
          })
          onValidation(validation.isValid, validation.message)
        }
      },
      [
        selectedCountry,
        localPhoneNumber,
        onChange,
        validateOnChange,
        validatePhoneNumber,
        onValidation,
        onCountryChange,
        enableAutoDetection,
        findCountryByPhoneNumber,
      ]
    )

    // Handle blur for formatting
    const handleBlur = useCallback(() => {
      setIsFocused(false)

      if (formatOnBlur && selectedCountry && localPhoneNumber) {
        const formatted = formatPhoneNumber(localPhoneNumber, selectedCountry.code)
        if (formatted !== localPhoneNumber) {
          setLocalPhoneNumber(formatted)

          // Update parent with formatted number
          try {
            const parsed = parsePhoneNumberFromString(formatted, selectedCountry.code)
            onChange(parsed?.number || formatted)
          } catch {
            onChange(formatted)
          }
        }
      }
    }, [formatOnBlur, selectedCountry, localPhoneNumber, formatPhoneNumber, onChange])

    const handleFocus = useCallback(() => {
      setIsFocused(true)
    }, [])

    // Expose methods to parent components
    useImperativeHandle(
      ref,
      () => ({
        isValid: () => {
          const validation = validatePhoneNumber(localPhoneNumber, selectedCountry)
          setInternalError({
            isInvalid: !validation.isValid,
            message: validation.message,
          })
          onValidation(validation.isValid, validation.message)
          return validation.isValid
        },
        getValue: () => {
          if (!selectedCountry || !localPhoneNumber) return localPhoneNumber
          try {
            const parsed = parsePhoneNumberFromString(localPhoneNumber, selectedCountry.code)
            return parsed?.number || localPhoneNumber
          } catch {
            return localPhoneNumber
          }
        },
        getCountry: () => selectedCountry,
        setCountry: countryCode => {
          const country = findCountryByCode(countryCode)
          if (country) {
            setSelectedCountry(country)
            onCountryChange(country)
          }
        },
        clear: () => {
          setLocalPhoneNumber("")
          setInternalError({ isInvalid: false, message: "" })
        },
        focus: () => {
          inputRef.current?.focus()
        },
        getFormattedNumber: () => {
          if (!selectedCountry || !localPhoneNumber) return localPhoneNumber
          return formatPhoneNumber(localPhoneNumber, selectedCountry.code)
        },
      }),
      [
        selectedCountry,
        localPhoneNumber,
        validatePhoneNumber,
        onValidation,
        findCountryByCode,
        onCountryChange,
        formatPhoneNumber,
      ]
    )

    const toggleDropdown = useCallback(() => {
      setIsDropdownOpen(prev => !prev)
      if (!isDropdownOpen) {
        setTimeout(() => searchInputRef.current?.focus(), 100)
      }
    }, [isDropdownOpen])

    const closeDropdown = useCallback(
      event => {
        if (anchorEl?.contains(event.target)) return
        setIsDropdownOpen(false)
        setSearchTerm("")
      },
      [anchorEl]
    )

    // Display error (prop error takes precedence over internal error)
    const displayError = error || internalError.isInvalid
    const displayHelperText = error ? helperText : internalError.message || helperText

    // Custom country option renderer
    const renderCountry = useCallback(
      option => {
        if (renderCountryOption) {
          return renderCountryOption(option)
        }

        return (
          <Box
            key={option.code}
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              cursor: "pointer",
              "&:hover": { backgroundColor: "action.hover" },
              backgroundColor:
                selectedCountry?.code === option.code ? "action.selected" : "transparent",
            }}
            onClick={() => handleCountryChange(option)}
          >
            <Typography component="span" sx={{ fontSize: "1.2rem", mr: 1 }}>
              {option.flag}
            </Typography>
            <Typography sx={{ flex: 1 }}>{option.name}</Typography>
            <Typography sx={{ opacity: 0.7 }}>{option.phoneCode}</Typography>
          </Box>
        )
      },
      [renderCountryOption, handleCountryChange, selectedCountry]
    )

    return (
      <FormControl
        error={displayError}
        fullWidth={fullWidth}
        disabled={disabled}
        variant={variant}
        size={size}
      >
        <TextField
          id={`${name}-input`}
          name={name}
          value={localPhoneNumber}
          onChange={handlePhoneNumberChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          error={displayError}
          fullWidth={fullWidth}
          autoFocus={autoFocus}
          placeholder={placeholder}
          required={required}
          variant={variant}
          size={size}
          disabled={disabled}
          inputRef={inputRef}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Button
                    ref={setAnchorEl}
                    onClick={toggleDropdown}
                    endIcon={<KeyboardArrowDown />}
                    disabled={disabled}
                    sx={{
                      minWidth: "auto",
                      px: 1,
                      mr: 1,
                      "& .MuiButton-endIcon": { ml: 0.5 },
                    }}
                  >
                    <Typography component="span" sx={{ fontSize: "1.2rem", mr: 0.5 }}>
                      {selectedCountry?.flag || "🌐"}
                    </Typography>
                    <Typography variant="body2">{selectedCountry?.phoneCode || ""}</Typography>
                  </Button>

                  <Popper
                    open={isDropdownOpen}
                    anchorEl={anchorEl}
                    placement="bottom-start"
                    sx={{ zIndex: 1300 }}
                    modifiers={[
                      {
                        name: "preventOverflow",
                        options: { boundary: "viewport" },
                      },
                    ]}
                  >
                    <ClickAwayListener onClickAway={closeDropdown}>
                      <Paper
                        sx={{
                          width: dropdownWidth,
                          maxHeight: dropdownMaxHeight,
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box sx={{ p: 1, borderBottom: 1, borderColor: "divider" }}>
                          <TextField
                            inputRef={searchInputRef}
                            placeholder={countrySearchPlaceholder}
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onClick={e => e.stopPropagation()}
                          />
                        </Box>
                        <Box sx={{ overflowY: "auto", flex: 1 }}>
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map(renderCountry)
                          ) : (
                            <Typography sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
                              No countries found
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    </ClickAwayListener>
                  </Popper>
                </InputAdornment>
              ),
            },
          }}
          {...otherProps}
        />

        {displayHelperText && (
          <FormHelperText error={displayError}>{displayHelperText}</FormHelperText>
        )}
      </FormControl>
    )
  }
)

CPhoneField.displayName = "CPhoneField"

export default CPhoneField
