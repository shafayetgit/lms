export const COURSE_TIPS = {
  list: {
    description: "Manage all your courses from this central dashboard. You can create, edit, or remove courses here.",
    tips: [
      { label: "Create", text: "Click the 'Create Course' button to add a new course to the platform." },
      { label: "Manage", text: "Click on any course title to edit its details, chapters, and lessons." },
      { label: "Filtering", text: "Use the search bar and pagination to find specific courses quickly." },
    ]
  },
  details: {
    description: "Configure the foundational details of your course. A well-described course attracts more students.",
    tips: [
      { label: "Pricing", text: "Free courses will ignore the price field. Make sure to toggle correctly." },
      { label: "Visibility", text: "Published courses are visible to students. Upcoming courses are marked with a badge." },
      { label: "Media", text: "Upload a high-quality 16:9 thumbnail for better presentation." },
    ]
  },
  dashboard: {
    description: "Analyze course performance, student engagement, and lesson completion metrics.",
    tips: [
      { label: "KPIs", text: "Monitor total enrollment, average completion progress, course ratings, and lesson count." },
      { label: "Distribution", text: "Understand engagement levels categorized from Just Started to Fully Completed." },
      { label: "Lesson Stats", text: "Identify high-completion lessons or potential bottlenecks in your curriculum." },
    ]
  }
};
