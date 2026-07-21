export const COUPON_TIPS = {
  list: {
    description:
      "Manage promotional discount coupons for courses and batches. Coupons can be percentage-based or fixed amounts.",
    tips: [
      { label: "Create", text: "Click 'Create Coupon' to generate new promotional codes." },
      {
        label: "Redemptions",
        text: "Track redemption limits and actual usage for each coupon code.",
      },
      {
        label: "Restrictions",
        text: "Specify whether a coupon applies globally or to specific courses/batches.",
      },
    ],
  },
  details: {
    description:
      "Configure discount rules, validity periods, usage limits, and item-level restrictions for this coupon.",
    tips: [
      { label: "Code", text: "Enter a unique promotional code (e.g. SUMMER50)." },
      {
        label: "Discount Type",
        text: "Choose between percentage discounts or fixed currency amounts.",
      },
      {
        label: "Validity",
        text: "Set an expiration date after which the coupon will be automatically rejected.",
      },
      {
        label: "Usage Limit",
        text: "Define the maximum number of redemptions allowed across all users.",
      },
      {
        label: "Applicable Items",
        text: "Restrict the coupon to specific courses or batches, or leave empty for global applicability.",
      },
    ],
  },
}
