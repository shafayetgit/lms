---
trigger: always_on
---

Core Rules:
-----------
- Always use the project's approved design system components.

- Prefer existing custom components (e.g., CDialog, CForm, CTextField, CButton, CDatatable) over raw UI library components.

- Follow established design patterns, layouts, spacing, typography, and interaction behaviors.

- Reuse existing shared components whenever possible.

Project Structure:
-----------------
- Follow the existing directory and module structure for frontend and backend.

- Keep pages, components, hooks, services, and utilities in their designated locations.
- Follow established naming conventions.
- Avoid duplicating functionality that already exists elsewhere in the project.
- Do not add agentic comment use developer friendly one line most important comment.
- use uv and npm to test project, do not use docker for test.
- Before running rm command to delete any file ask permission.
- Do not test via browser.
- Do not run npm build

API Response Standard Format:
-----------------------------

- For List Response Format
{
  "success": true,
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "size": 10,
    "pages": 1,
    "has_next": false,
    "has_prev": false
  }
}

- For Detail Response Format
{
  "success": true,
  "data": {}
}

- For Create / Update Response Format
{
  "success": true,
  "data": {}
}

- For Delete Response Format
{
  "success": true,
  "message": "Successfully deleted"
}

- For Meta Response Format
{
  "success": true,
  "data": {
    "sources": [
      {
        "label": "Website",
        "value": "Website"
      }
    ],
    "industries": [
      {
        "label": "Technology",
        "value": "Technology"
      }
    ],
    "territories": [
      {
        "label": "North America",
        "value": "North America"
      }
    ],
    "users": [
      {
        "label": "John Doe",
        "value": 1,
        "public_id": "019eb84e-1010-70c1-b6d0-d60a5931cf7b",
        "email": "john@example.com",
        "avatar": null
      }
    ]
  }
}

Grid syntax in version 9.x:

import Grid from '@mui/material/Grid';

      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        {Array.from(Array(6)).map((_, index) => (
          <Grid key={index} size={{ xs: 2, sm: 4, md: 4 }}>
            <Item>{index + 1}</Item>
          </Grid>
        ))}
      </Grid>

Always use CPageLloader, do not use skeleton.
Always keep helpline sidebar to the right for each module with explanation of improtant things and fields
- Always remember to delete the temporary helper script