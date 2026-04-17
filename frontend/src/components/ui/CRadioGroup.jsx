import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";

export default function CRadioGroup({
  label = "",
  options = [],
  value,
  onChange,
  row = false,
  sx = {},
  ...other
}) {
  return (
    <FormControl  {...other}>
      {label && (
        <FormLabel sx={{ fontWeight: "bold", mb: 1 }}>{label}</FormLabel>
      )}
      <RadioGroup row={row} value={value} onChange={onChange}>
        {options.map((option, index) => (
          <FormControlLabel
            key={index}
            value={option.value}
            control={<Radio size="small" />}
            label={option.label}
            sx={{ ...sx}}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

// Example to use:
// export default function App() {
//     const [selected, setSelected] = useState("option1");

//     return (
//       <CRadioGroup
//         label="Choose One"
//         options={[
//           { value: "option1", label: "Option 1" },
//           { value: "option2", label: "Option 2" },
//           { value: "option3", label: "Option 3" },
//         ]}
//         value={selected}
//         onChange={(e) => setSelected(e.target.value)}
//         row // Set false for vertical layout
//       />
//     );
//   }
