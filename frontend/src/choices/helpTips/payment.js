export const PAYMENT_TIPS = {
  list: {
    description: "Monitor and manage student transaction history, payment statuses, and sources.",
    tips: [
      { label: "Transactions", text: "View recent course and batch payment transactions." },
      {
        label: "Status",
        text: "Filter transactions by status: Pending, Completed, Failed, or Refunded.",
      },
      {
        label: "Details",
        text: "Click on any transaction member ID to inspect payment details and status updates.",
      },
    ],
  },
  details: {
    description: "Inspect specific payment details and update the transaction status if necessary.",
    tips: [
      {
        label: "Status Update",
        text: "Manually adjust payment status to Completed or Refunded when resolving support queries.",
      },
      { label: "Member & Item", text: "Reference student ID and target course or batch ID." },
    ],
  },
}
