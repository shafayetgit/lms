import { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Typography,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function PriceRange() {
  // Dummy price range (min, max)
  const productFilterInfo = {
    price_range: [10, 100],
  };

  const [value, setValue] = useState(productFilterInfo.price_range);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Accordion defaultExpanded sx={{ background: "transparent" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Price
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box
            sx={{
              backgroundColor: "primary.main",
              color: "custom.light",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              fontWeight: "bold",
            }}
          >
            ${value[0]}
          </Box>
          <Box
            sx={{
              backgroundColor: "primary.main",
              color: "custom.light",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              fontWeight: "bold",
            }}
          >
            ${value[1]}
          </Box>
        </Box>
        <Slider
          value={value}
          onChange={handleChange}
          step={2}
          min={productFilterInfo.price_range[0]}
          max={productFilterInfo.price_range[1]}
          valueLabelDisplay="auto"
          sx={{
            color: "text.primary",
            height: 6,
            "& .MuiSlider-thumb": {
              width: 16,
              height: 16,
            },
          }}
        />
      </AccordionDetails>
    </Accordion>
  );
}
