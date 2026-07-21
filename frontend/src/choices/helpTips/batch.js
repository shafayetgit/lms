export const BATCH_TIPS = {
  list: {
    description:
      "Manage student cohorts, schedule timetables, assign instructors, and configure course cohorts.",
    tips: [
      {
        label: "Create Batch",
        text: "Click 'Create Batch' to start a new student cohort with custom date ranges.",
      },
      {
        label: "Cohort Navigation",
        text: "Click any batch title to edit general settings, schedule timetables, or view student enrollments.",
      },
      {
        label: "Status Toggles",
        text: "Only published batches with active dates allow student enrollments.",
      },
    ],
  },
  details: {
    description:
      "Configure batch metadata, instruction medium, seat capacity limits, and pricing details.",
    tips: [
      {
        label: "Duration Boundaries",
        text: "Ensure end date is not prior to start date. Timetable entries must fall within these dates.",
      },
      {
        label: "Seat Limits",
        text: "Specify max student capacity or set to 0 for unlimited enrollments.",
      },
      {
        label: "Evaluation",
        text: "Set evaluation deadline to review assignments before issuing course completion certificates.",
      },
    ],
  },
  timetable: {
    description:
      "Schedule live classes, webinars, and lesson milestones for students enrolled in this batch cohort.",
    tips: [
      {
        label: "Schedule Entry",
        text: "Provide session topic, date, start/end time, and conferencing link (Zoom/Google Meet).",
      },
      {
        label: "Chronological Order",
        text: "Timetable items automatically sort by date and start time.",
      },
    ],
  },
  enrollments: {
    description: "Monitor student enrollment metrics and seat availability for this batch cohort.",
    tips: [
      {
        label: "Capacity Tracking",
        text: "View live enrolled student count against the configured maximum seat count.",
      },
      {
        label: "Self Enrollment",
        text: "Check whether self-enrollment is enabled or disabled for this cohort.",
      },
    ],
  },
  dashboard: {
    description: "Monitor student cohort performance, general metrics, and enrollment indicators.",
    tips: [
      {
        label: "Cohort Metrics",
        text: "Track the number of enrolled students, maximum seats available, and whether self-enrollment is allowed.",
      },
    ],
  },
}

export default BATCH_TIPS.list
