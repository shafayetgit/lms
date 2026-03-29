import { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  List,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CRadioGroup from "@/components/CRadioGroup";

export default function CategoryFilter() {
  // Dummy categories
  const productFilterInfo = {
    categories: [
      { label: "Business & Management", value: "business" },
      { label: "Finance & Accounting", value: "finance" },
      { label: "Technology & IT", value: "technology" },
      { label: "Design & Creative Arts", value: "design" },
      { label: "Marketing & Sales", value: "marketing" },
      { label: "Health & Fitness", value: "health" },
      { label: "Language Learning", value: "language" },
      { label: "Personal Development", value: "personal-development" },
      { label: "Data Science & Analytics", value: "data-science" },
      { label: "Education & Teaching", value: "education" },
    ],
  };

  const categories = productFilterInfo.categories;

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredCategories = categories.filter((category) =>
    category.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  return (
    <Accordion defaultExpanded sx={{background:'transparent'}}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Categories
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        <List sx={{ maxHeight: 200, overflowY: "auto" }}>
          <CRadioGroup
            options={filteredCategories}
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          />
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
