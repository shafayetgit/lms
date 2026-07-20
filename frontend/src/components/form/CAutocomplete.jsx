import React from "react"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"

export default function CAutocomplete({
  label,
  name,
  required,
  multiple,
  value,
  options,
  getOptionLabel,
  onChange,
  isOptionEqualToValue,
  error,
  helperText,
  autoFocus,
  className,
  autoComplete,
  placeholder,
  variant,
  size = "small",
  disabled,
  ...rest
}) {
  const isValueEmpty = multiple 
    ? !(value && value.length > 0) 
    : !value;
  const isRequired = required && isValueEmpty;

  const defaultGetOptionLabel = (option) => {
    if (!option) return "";
    if (typeof option === "string") return option;
    if (option.label !== undefined && option.label !== null) return String(option.label);
    if (option.title !== undefined && option.title !== null) return String(option.title);
    if (option.name !== undefined && option.name !== null) return String(option.name);
    return "";
  };

  return (
    <>
      <Autocomplete
        multiple={multiple}
        value={multiple ? (value || []) : (value !== undefined ? value : null)}
        options={options}
        getOptionLabel={getOptionLabel || defaultGetOptionLabel}
        onChange={onChange}
        isOptionEqualToValue={isOptionEqualToValue}
        size={size}
        fullWidth
        disabled={disabled}
        renderOption={(props, option) => {
          const { key, ...restProps } = props
          return (
            <li key={option && typeof option === "object" && option.value ? option.value : key} {...restProps}>
              {getOptionLabel ? getOptionLabel(option) : defaultGetOptionLabel(option)}
            </li>
          )
        }}
        renderInput={params => (
          <TextField
            label={label}
            name={name}
            error={error}
            helperText={helperText}
            autoFocus={autoFocus}
            className={className}
            autoComplete={autoComplete}
            placeholder={placeholder}
            variant={variant}
            required={isRequired}
            {...params}
          />
        )}
        {...rest}
      />
    </>
  )
}
