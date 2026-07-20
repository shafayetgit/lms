export const EMAIL_ACCOUNT_TIPS = {
  list: {
    description:
      "Manage all your email accounts in one place. These accounts are used for sending and receiving emails directly within the LMS. You can add multiple accounts and set one as default for incoming and outgoing.",
    tips: [
      {
        label: "Default Incoming",
        text: "Set one account as the default for incoming emails. This account will be used to sync emails.",
      },
      {
        label: "Default Outgoing",
        text: "Set one account as the default for outgoing emails. This account will be pre-selected when sending system notifications.",
      },
      {
        label: "Lead from email",
        text: "If enabled, incoming emails from unknown addresses will automatically create a new record in the system.",
      },
      {
        label: "Testing",
        text: "After configuring your IMAP and SMTP settings, use the toggle switches to enable incoming and outgoing mail separately.",
      },
    ],
  },
}
