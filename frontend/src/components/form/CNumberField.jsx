import React from "react"
import { NumberField } from "@base-ui/react"
import { Box, Typography, alpha, styled } from "@mui/material"
import { Add, Remove, Height } from "@mui/icons-material"

const StyledRoot = styled(NumberField.Root, {
  shouldForwardProp: (prop) => prop !== 'fullWidth',
})(({ fullWidth }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: fullWidth ? '100%' : 'auto',
}));

const StyledGroup = styled(NumberField.Group)(({ theme, ...props }) => ({
  display: 'flex',
  alignItems: 'center',
  borderRadius: '12px',
  border: `1px solid ${props['data-invalid'] !== undefined ? theme.palette.error.main : alpha(theme.palette.divider, 0.4)}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:focus-within': {
    borderColor: props['data-invalid'] !== undefined ? theme.palette.error.main : theme.palette.primary.main,
    boxShadow: `0 0 0 4px ${alpha(props['data-invalid'] !== undefined ? theme.palette.error.main : theme.palette.primary.main, 0.1)}`,
  },
  '&:hover': {
    borderColor: props['data-invalid'] !== undefined ? theme.palette.error.dark : theme.palette.primary.main,
  },
}));

const StyledInput = styled(NumberField.Input)(({ theme }) => ({
  flex: 1,
  border: 'none',
  background: 'transparent',
  padding: '12px 0',
  fontSize: '0.95rem',
  fontWeight: 700,
  textAlign: 'center',
  color: theme.palette.text.primary,
  '&:focus': {
    outline: 'none',
  },
  '&::placeholder': {
    color: theme.palette.text.disabled,
  },
  '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
  '&[type=number]': {
    MozAppearance: 'textfield',
  },
}));

const StepperButton = styled('button')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '42px',
  height: '42px',
  border: 'none',
  background: 'transparent',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  '&:disabled': {
    opacity: 0.2,
    cursor: 'not-allowed',
  },
}));

const CNumberField = React.forwardRef(function CNumberField({ 
  label, 
  error, 
  helperText, 
  value, 
  onChange, 
  onBlur, 
  name,
  min,
  max,
  step = 1,
  fullWidth = true,
  ...rest 
}, ref) {
  return (
    <StyledRoot 
      ref={ref}
      min={min} 
      max={max} 
      step={step}
      fullWidth={fullWidth}
      value={value === "" || value === null || isNaN(value) ? null : Number(value)}
      onValueChange={(val) => {
        if (onChange) {
          onChange({
            target: {
              name: name,
              value: val,
            },
          });
        }
      }}
      disabled={rest.disabled}
      readOnly={rest.readOnly}
    >
      {label && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8, px: 0.5 }}>
          <Typography 
            variant="caption" 
            fontWeight={800} 
            sx={{ 
              color: error ? 'error.main' : 'text.secondary',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              opacity: 0.8
            }}
          >
            {label}
          </Typography>
          <NumberField.ScrubArea>
            <Height sx={{ fontSize: 14, transform: 'rotate(90deg)', opacity: 0.5, cursor: 'ew-resize' }} />
          </NumberField.ScrubArea>
        </Box>
      )}

      <StyledGroup data-invalid={error ? '' : undefined}>
        <NumberField.Decrement render={<StepperButton type="button"><Remove sx={{ fontSize: 18 }} /></StepperButton>} />
        
        <StyledInput 
          name={name}
          value={value ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          inputMode="decimal"
          onKeyDown={(e) => {
            if (["e", "E", "+", "-"].includes(e.key)) {
              e.preventDefault();
              return;
            }

            const isControl = [
              "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", 
              "Enter", "Escape", "Home", "End"
            ].includes(e.key);
            
            const isNumber = /^[0-9]$/.test(e.key);
            const isDecimal = e.key === "." && !value?.toString().includes(".");
            const isCommand = (e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase());

            if (!isControl && !isNumber && !isDecimal && !isCommand) {
              e.preventDefault();
            }
          }}
          onPaste={(e) => {
            const pasteData = e.clipboardData.getData('text');
            if (!/^[0-9.]*$/.test(pasteData)) {
              e.preventDefault();
            }
          }}
          {...rest}
        />
        
        <NumberField.Increment render={<StepperButton type="button"><Add sx={{ fontSize: 18 }} /></StepperButton>} />
      </StyledGroup>

      {(helperText || error) && (
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 0.6, 
            ml: 1, 
            color: error ? 'error.main' : 'text.disabled',
            fontWeight: 500,
            display: 'block'
          }}
        >
          {error || helperText}
        </Typography>
      )}
    </StyledRoot>
  );
});

export default CNumberField;
