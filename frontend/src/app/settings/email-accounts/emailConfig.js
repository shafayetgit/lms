// Email provider definitions
export const EMAIL_SERVICES = [
  {
    name: "GMail",
    label: "Gmail",
    color: "#EA4335",
    info: "Setting up Gmail requires two-factor authentication and an app-specific password.",
    link: "https://support.google.com/accounts/answer/185833",
  },
  {
    name: "Outlook",
    label: "Outlook",
    color: "#0078D4",
    info: "Setting up Outlook requires two-factor authentication and an app-specific password.",
    link: "https://support.microsoft.com/en-us/account-billing/how-to-get-and-use-app-passwords-5896ed9b-4263-e681-128a-a6f2979a7944",
  },
  {
    name: "Sendgrid",
    label: "Sendgrid",
    color: "#1A82E2",
    info: "Setting up Sendgrid requires generating an API Key to use as your SMTP password.",
    link: "https://docs.sendgrid.com/for-developers/sending-email/api-getting-started",
  },
  {
    name: "SparkPost",
    label: "SparkPost",
    color: "#FA6423",
    info: "Setting up SparkPost requires generating an API Key with 'Send via SMTP' permissions.",
    link: "https://support.sparkpost.com/docs/getting-started/getting-started-sparkpost",
  },
  {
    name: "Postmark",
    label: "Postmark",
    color: "#F6C342",
    info: "Setting up Postmark requires an SMTP token from your Postmark server credentials.",
    link: "https://postmarkapp.com/support/article/1126-where-do-i-find-my-smtp-credentials",
  },
  {
    name: "Resend",
    label: "Resend",
    color: "#71717A",
    info: "Setting up Resend requires generating an API Key to use as your SMTP password.",
    link: "https://resend.com/docs/dashboard/api-keys/introduction",
  },
  {
    name: "Yahoo",
    label: "Yahoo",
    color: "#720E9E",
    info: "Setting up Yahoo requires two-factor authentication and an app-specific password.",
    link: "https://help.yahoo.com/kb/SLN15241.html",
  },
  {
    name: "Yandex",
    label: "Yandex",
    color: "#FC3F1D",
    info: "Setting up Yandex requires two-factor authentication and an app-specific password.",
    link: "https://yandex.com/support/id/authorization/app-passwords.html",
  },
]

// Provider initials for avatar fallback
export const SERVICE_INITIALS = {
  GMail: "G",
  Outlook: "O",
  Sendgrid: "SG",
  SparkPost: "SP",
  Postmark: "PM",
  Resend: "R",
  Yahoo: "Y",
  Yandex: "YX",
}

export const SERVICE_COLORS = Object.fromEntries(EMAIL_SERVICES.map(s => [s.name, s.color]))

export const SERVICE_IMAGES = {
  GMail: "/images/providers/gmail.png",
  Outlook: "/images/providers/outlook.png",
  Sendgrid: "/images/providers/sendgrid.png",
  SparkPost: "/images/providers/sparkpost.webp",
  Resend: "/images/providers/resend.png",
  Yahoo: "/images/providers/yahoo.png",
  Yandex: "/images/providers/yandex.png",
}

// Account name + email ID (shared by all providers)
const FIXED_FIELDS = [
  {
    name: "email_account_name",
    label: "Account Name",
    type: "text",
    placeholder: "e.g. Support / Sales",
    required: true,
  },
  {
    name: "email_id",
    label: "Email ID",
    type: "email",
    placeholder: "you@example.com",
    required: true,
  },
]

// All providers use password-based auth
export const PROVIDER_FIELDS = [
  ...FIXED_FIELDS,
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "App password",
    required: true,
  },
]

// Incoming/outgoing feature toggles
export const INCOMING_OUTGOING_FIELDS = [
  {
    name: "enable_incoming",
    label: "Enable Incoming",
    description: "If enabled, emails will be pulled from this account.",
  },
  {
    name: "enable_outgoing",
    label: "Enable Outgoing",
    description: "If enabled, outgoing emails can be sent from this account.",
  },
  {
    name: "default_incoming",
    label: "Default Incoming",
    description:
      "If enabled, all incoming company emails will arrive at this account. Note: Only one account can be default incoming.",
  },
  {
    name: "default_outgoing",
    label: "Default Outgoing",
    description:
      "If enabled, all outgoing emails will be sent from this account. Note: Only one account can be default outgoing.",
  },
]

export function validateAccountForm(values) {
  const errors = {}
  if (!values.email_account_name?.trim()) errors.email_account_name = "Account name is required"
  if (!values.email_id?.trim()) errors.email_id = "Email ID is required"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email_id || ""))
    errors.email_id = "Invalid email address"
  if (!values.password?.trim()) errors.password = "Password is required"
  return errors
}
