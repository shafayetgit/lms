"use client"
import React, { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { CircularProgress, Stack, Typography } from "@mui/material"
import Grid from "@mui/material/Grid"
import { toast } from "react-toastify"
import { useGetCheckoutLinkMutation, useReadPaymentsQuery } from "@/features/payment/paymentApi"
import { useGetActiveGatewayQuery } from "@/features/payment/paymentGatewayApi"
import { getCurrentUser } from "@/lib/auth/client"
import CButton from "@/components/ui/CButton"
import CDialog from "@/components/ui/CDialog"
import CForm from "@/components/ui/CForm"
import CTextField from "@/components/form/CTextField"
import CSelect from "@/components/form/CSelect"
import CCheckbox from "@/components/form/CCheckbox"
import { CreditCard, School } from "@mui/icons-material"

const countryOptions = [
  { label: "United States", value: "United States" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "Canada", value: "Canada" },
  { label: "Australia", value: "Australia" },
  { label: "Bangladesh", value: "Bangladesh" },
  { label: "India", value: "India" },
  { label: "Germany", value: "Germany" },
  { label: "France", value: "France" },
  { label: "Saudi Arabia", value: "Saudi Arabia" },
  { label: "United Arab Emirates", value: "United Arab Emirates" },
]

const sourceOptions = [
  { label: "Website", value: "Website" },
  { label: "Social Media", value: "Social Media" },
  { label: "Search Engine", value: "Search Engine" },
  { label: "Friend/Colleague", value: "Friend/Colleague" },
  { label: "Other", value: "Other" },
]

/**
 * Reusable enroll/buy button for courses and batches.
 */
export default function EnrollButton({
  paymentForType,
  paymentForPublicId,
  paidItem = false,
  price = "",
  label,
  disabled = false,
  variant = "contained",
  fullWidth = false,
  size = "medium",
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [getCheckoutLink, { isLoading }] = useGetCheckoutLinkMutation()
  const [user, setUser] = useState(null)

  React.useEffect(() => {
    setUser(getCurrentUser())
  }, [])
  const [billingOpen, setBillingOpen] = useState(false)
  const [billingName, setBillingName] = useState("")
  const [billingAddressLine1, setBillingAddressLine1] = useState("")
  const [billingAddressLine2, setBillingAddressLine2] = useState("")
  const [billingCity, setBillingCity] = useState("")
  const [billingState, setBillingState] = useState("")
  const [billingCountry, setBillingCountry] = useState("")
  const [billingPostalCode, setBillingPostalCode] = useState("")
  const [billingPhone, setBillingPhone] = useState("")
  const [whereHeard, setWhereHeard] = useState("")
  const [consentInvoicing, setConsentInvoicing] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [hasPrefilled, setHasPrefilled] = useState(false)

  const { data: paymentsData } = useReadPaymentsQuery({ size: 1 }, { skip: !user || !paidItem })

  React.useEffect(() => {
    if (paymentsData?.data?.length > 0 && !hasPrefilled) {
      const latest = paymentsData.data[0]
      setBillingName(latest.billing_name || "")
      setBillingAddressLine1(latest.billing_address_line_1 || "")
      setBillingAddressLine2(latest.billing_address_line_2 || "")
      setBillingCity(latest.billing_city || "")
      setBillingState(latest.billing_state || "")
      setBillingCountry(latest.billing_country || "")
      setBillingPostalCode(latest.billing_postal_code || "")
      setBillingPhone(latest.billing_phone || "")
      setHasPrefilled(true)
    }
  }, [paymentsData, hasPrefilled])

  const buttonLabel = label || (paidItem ? "Buy Now" : "Enroll Now")

  async function initiateCheckout(e) {
    if (e) e.preventDefault()
    if (paidItem && !consentInvoicing) {
      toast.error("You must consent to your personal information being stored for invoicing.")
      return
    }
    try {
      const normalizedType = paymentForType
        ? paymentForType.charAt(0).toUpperCase() + paymentForType.slice(1).toLowerCase()
        : ""

      const res = await getCheckoutLink({
        payment_for_type: normalizedType,
        payment_for_public_id: paymentForPublicId,
        billing_name: paidItem ? billingName : "Free Student",
        billing_address_line_1: paidItem ? billingAddressLine1 : "Free Address",
        billing_address_line_2: paidItem ? billingAddressLine2 || undefined : undefined,
        billing_city: paidItem ? billingCity : "Free City",
        billing_state: paidItem ? billingState || undefined : undefined,
        billing_country: paidItem ? billingCountry : "United States",
        billing_postal_code: paidItem ? billingPostalCode || undefined : undefined,
        billing_phone: paidItem ? billingPhone || undefined : undefined,
        where_heard: paidItem ? whereHeard : "Website",
        consent_invoicing: paidItem ? consentInvoicing : true,
        coupon_code: paidItem ? couponCode || undefined : undefined,
      }).unwrap()

      const redirectUrl = res?.data?.redirect_url
      if (!redirectUrl) throw new Error("No redirect URL returned")

      setBillingOpen(false)
      const payment = res?.data?.payment
      if (payment?.public_id && (Number(payment.amount) === 0 || !paidItem)) {
        router.push(`/payments/success?ref=${payment.public_id}`)
      } else {
        router.push(redirectUrl)
      }
    } catch (err) {
      const detail =
        err?.data?.message ||
        err?.data?.detail ||
        err?.message ||
        "Enrollment failed. Please try again."
      toast.error(detail)
    }
  }

  const { data: activeGatewayData, isLoading: isGatewayLoading } = useGetActiveGatewayQuery(undefined, {
    skip: !paidItem,
  })

  function handleClick() {
    if (!user) {
      toast.info("Please sign in to continue")
      router.push(`/auth/sign-in?next=${encodeURIComponent(pathname)}`)
      return
    }
    if (paidItem) {
      if (isGatewayLoading) {
        toast.info("Checking payment options...")
        return
      }
      if (!activeGatewayData?.data?.gateway) {
        toast.error("Purchases are currently disabled as no payment methods are configured.")
        return
      }
      setBillingOpen(true)
    } else {
      initiateCheckout()
    }
  }

  return (
    <>
      <CButton
        label={isLoading ? "Processing…" : buttonLabel}
        variant={variant}
        fullWidth={fullWidth}
        size={size}
        disabled={disabled || isLoading}
        onClick={handleClick}
        icon={
          isLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : paidItem ? (
            <CreditCard />
          ) : (
            <School />
          )
        }
      />

      {/* Billing dialog for paid items */}
      <CDialog
        open={billingOpen}
        handleCDialogClose={() => setBillingOpen(false)}
        title="Billing Details"
        maxWidth="sm"
      >
        <CForm
          onSubmit={initiateCheckout}
          dialog
          btnProps={{
            label: "Proceed to Payment",
            action: "",
            loading: isLoading,
            disabled: !consentInvoicing || isLoading,
          }}
        >
          <Stack spacing={3}>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={12}>
              {/* Left Column */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2.5}>
                  <CTextField
                    label="Billing Name"
                    value={billingName}
                    onChange={e => setBillingName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                  <CTextField
                    label="Address Line 1"
                    value={billingAddressLine1}
                    onChange={e => setBillingAddressLine1(e.target.value)}
                    placeholder="Street address, P.O. box, company name"
                    multiline
                    rows={2}
                    required
                  />
                  <CTextField
                    label="Address Line 2"
                    value={billingAddressLine2}
                    onChange={e => setBillingAddressLine2(e.target.value)}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    multiline
                    rows={2}
                  />
                  <CTextField
                    label="City"
                    value={billingCity}
                    onChange={e => setBillingCity(e.target.value)}
                    placeholder="City"
                    required
                  />
                  <CTextField
                    label="State/Province"
                    value={billingState}
                    onChange={e => setBillingState(e.target.value)}
                    placeholder="State / Province / Region"
                  />
                </Stack>
              </Grid>

              {/* Right Column */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2.5}>
                  <CSelect
                    label="Country"
                    value={billingCountry}
                    onChange={e => setBillingCountry(e.target.value)}
                    options={countryOptions}
                    required
                  />
                  <CTextField
                    label="Postal Code"
                    value={billingPostalCode}
                    onChange={e => setBillingPostalCode(e.target.value)}
                    placeholder="ZIP / Postal Code"
                  />
                  <CTextField
                    label="Phone Number"
                    value={billingPhone}
                    onChange={e => setBillingPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                  <CSelect
                    label="Where did you hear about us?"
                    value={whereHeard}
                    onChange={e => setWhereHeard(e.target.value)}
                    options={sourceOptions}
                    required
                  />
                  <CTextField
                    label="Coupon Code (optional)"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                  />
                </Stack>
              </Grid>
            </Grid>

            <CCheckbox
              name="consent_invoicing"
              label="I consent to my personal information being stored for invoicing"
              checked={consentInvoicing}
              onChange={e => setConsentInvoicing(e.target.checked)}
              required
            />
          </Stack>
        </CForm>
      </CDialog>
    </>
  )
}
