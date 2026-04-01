import { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Typography,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CRadioGroup from "@/components/CRadioGroup";

const ratings = [5, 4, 3, 2, 1];

export default function RatingFilter() {
  const [selectedRating, setSelectedRating] = useState(null);

  const handleRatingChange = (e) => {
    setSelectedRating(Number(e.target.value));
  };

  return (
    <Accordion defaultExpanded sx={{background:'transparent'}}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Rating
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <CRadioGroup
          value={selectedRating}
          onChange={handleRatingChange}
          options={ratings.map((value) => ({
            value,
            label: (
              <Stack direction="row" spacing={2}>
                <Rating value={value} readOnly size="small" />
                <Typography variant="subtitle2">{`(${value} Star)`}</Typography>
              </Stack>
            ),
          }))}
          sx={{ pl: 1 }}
        />
      </AccordionDetails>
    </Accordion>
  );
}
