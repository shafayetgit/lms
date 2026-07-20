export const BADGE_TIPS = {
  list: {
    description: "Manage your LMS badges here. Badges can be awarded automatically based on user progress and achievements.",
    tips: [
      { label: "Create", text: "Add a new badge with a distinct name and image icon." },
      { label: "Dynamic Rules", text: "Configure event-based conditions on each badge to automate assignment." },
      { label: "Assignments", text: "Go to the Assignments tab to view or manage badge assignments manually." },
    ]
  },
  details: {
    description: "Configure your badge's metadata and dynamic allocation rules.",
    tips: [
      { label: "Basic Info", text: "Name your badge and link a high-quality icon image URL." },
      { label: "Reference Table", text: "Select the database table to watch for trigger events (e.g., Course Progress, Certificates)." },
      { label: "Trigger Event", text: "Choose when to evaluate the condition: on creation ('New') or on updates ('Value Change')." },
      { label: "User Field", text: "Specify the attribute pointing to the recipient user, e.g., 'user_id' or 'member_id'." },
      { label: "Field to Check", text: "Define the specific field to check for mutations, e.g., 'is_completed' or 'passing' (only evaluated for 'Value Change' event triggers)." },
      { label: "Condition", text: "A secure Python expression. The trigger document is referenced as 'resource'. E.g., 'resource.is_completed == True' or 'resource.passing == True'." },
    ]
  }
};
