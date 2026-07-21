export const CATEGORY_TIPS = {
  list: {
    description:
      "Manage all your course categories here. Categories help students find courses that match their interests.",
    tips: [
      { label: "Create", text: "Add a new category with a clear name and unique thumbnail." },
      {
        label: "Manage",
        text: "Click on any category name to update its details or change its badge.",
      },
      {
        label: "Status",
        text: "Inactive categories will not be shown to students on the frontend.",
      },
    ],
  },
  details: {
    description:
      "This section helps you configure the category details. Keeping categories organized makes navigation easier for your students.",
    tips: [
      {
        label: "Basic Info",
        text: "Choose a clear, distinct name and description for the category.",
      },
      {
        label: "Badge",
        text: "Select a badge color to easily distinguish this category in the UI.",
      },
      {
        label: "Active Status",
        text: "Categories must be active to show up in the main application listings.",
      },
      {
        label: "Thumbnail",
        text: "Upload a clean 1:1 (square) image or icon representing the category.",
      },
    ],
  },
}
