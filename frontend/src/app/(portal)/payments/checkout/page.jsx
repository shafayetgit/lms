"use client"
import React, { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Paper,
  Stack,
} from "@mui/material"
import Grid from "@mui/material/Grid"
import {
  ArrowBack,
  Lock,
  OfflinePin,
  HelpOutline,
  CreditCard,
  Receipt,
  Stars,
  LocalActivity,
  VerifiedUser,
  AccessTime,
  CheckCircle,
  AccountBox,
  Public,
  Home,
} from "@mui/icons-material"
import { motion } from "framer-motion"
import { toast } from "react-toastify"

// RTK Query Hooks
import {
  useReadPaymentByPublicIdQuery,
  useGetCheckoutLinkMutation,
  useValidateCouponMutation,
} from "@/features/payment/paymentApi"
import {
  useCreatePaymentIntentMutation,
  useInitiateCheckoutMutation,
} from "@/features/payment/paymentGatewayApi"
import CPageLoader from "@/components/ui/CPageLoader"

// Stripe libraries
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

function CheckoutContent() {
  const router = useRouter()
  const theme = useTheme()
  const searchParams = useSearchParams()
  const payment_public_id = searchParams.get("payment_public_id")

  // Fetch draft payment details
  const {
    data: paymentRes,
    isLoading: isPaymentLoading,
    error: paymentError,
    refetch,
  } = useReadPaymentByPublicIdQuery(payment_public_id, {
    skip: !payment_public_id,
  })
  const payment = paymentRes?.data

  // Mutations
  const [createPaymentIntent, { data: intentRes, isLoading: isIntentLoading }] =
    useCreatePaymentIntentMutation()

  // State
  const [stripePromise, setStripePromise] = useState(null)
  const [intentError, setIntentError] = useState(null)

  const handleSetupPaymentIntent = useCallback(async () => {
    try {
      setIntentError(null)
      const res = await createPaymentIntent(payment_public_id).unwrap()
      if (res?.data && !res.data.requires_redirect && res.data.publishable_key) {
        setStripePromise(loadStripe(res.data.publishable_key))
      }
    } catch (err) {
      setIntentError(
        err?.data?.message ||
          err?.data?.detail ||
          err?.message ||
          "Failed to initialize payment gateway."
      )
    }
  }, [payment_public_id, createPaymentIntent])

  // Initialize form fields once payment details load
  useEffect(() => {
    if (payment) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSetupPaymentIntent()
    }
  }, [payment, handleSetupPaymentIntent])

  if (isPaymentLoading) {
    return <CPageLoader />
  }

  if (!payment_public_id) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 1 }}>
          No payment reference ID was provided in the checkout request.
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push("/lms/dashboard")}
          sx={{ textTransform: "none" }}
        >
          Back to Dashboard
        </Button>
      </Container>
    )
  }

  if (paymentError) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 1 }}>
          {paymentError?.data?.message ||
            paymentError?.data?.detail ||
            "Payment transaction not found or expired."}
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push("/lms/dashboard")}
          sx={{ textTransform: "none" }}
        >
          Back to Dashboard
        </Button>
      </Container>
    )
  }

  if (!payment) {
    return <CPageLoader />
  }

  // Check if payment is already completed
  if (payment.status === "COMPLETED" || payment.status === "completed") {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
        <Typography variant="h5" fontWeight={700} mb={1}>
          Payment Completed!
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          You are already enrolled in this {payment.payment_for_type.toLowerCase()}.
        </Typography>
        <Button
          variant="contained"
          onClick={() =>
            router.push(payment.payment_for_type === "Course" ? `/lms/enrollments` : `/lms/batches`)
          }
          sx={{ textTransform: "none" }}
        >
          View My Enrollments
        </Button>
      </Container>
    )
  }

  const itemDetails = payment.item_details || payment.itemDetails || {}
  const requiresRedirect = intentRes?.data?.requires_redirect
  const clientSecret = intentRes?.data?.client_secret
  const gatewayName = intentRes?.data?.gateway || "Payment Gateway"

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Main Left Section: Secure Checkout Card */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ order: { xs: 2, md: 1 } }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 1,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* Embedded Stripe Flow */}
            {isIntentLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress size={32} />
              </Box>
            ) : intentError ? (
              <Alert severity="error" sx={{ borderRadius: 1, mb: 3 }}>
                {intentError}
              </Alert>
            ) : requiresRedirect ? (
              /* External Gateway Redirect Flow */
              <RedirectPaymentForm
                payment_public_id={payment_public_id}
                amount={payment.amount}
                currency={payment.currency}
                gatewayName={gatewayName}
              />
            ) : stripePromise && clientSecret ? (
              /* Embedded Stripe Card Element Flow */
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: theme.palette.mode === "dark" ? "night" : "flat",
                    variables: {
                      colorPrimary: theme.palette.primary.main,
                      colorBackground: theme.palette.background.paper,
                      colorText: theme.palette.text.primary,
                      borderRadius: 1,
                    },
                  },
                }}
              >
                <StripeCheckoutForm payment={payment} clientSecret={clientSecret} />
              </Elements>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 1 }}>
                No payment setup required or payment configuration is incomplete.
              </Alert>
            )}

            {/* Billing Address Summary at the bottom of checkout form */}
            {(payment.billing_address_line_1 || payment.billing_country) && (
              <Box
                sx={{
                  mt: 3,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.action.disabledBackground, 0.2),
                  border: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  fontWeight={600}
                  sx={{ mb: 0.5, textTransform: "uppercase" }}
                >
                  Billing Address
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {[
                    payment.billing_name,
                    payment.billing_address_line_1,
                    payment.billing_address_line_2,
                    payment.billing_city,
                    payment.billing_state,
                    payment.billing_postal_code,
                    payment.billing_country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Section: Order Summary & Helpline Sidebar */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ order: { xs: 1, md: 2 } }}>
          <Stack spacing={3}>
            {/* Consolidated Order Summary Card */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 1,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  Order Summary
                </Typography>

                {/* Item Brief Info */}
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  {itemDetails.banner && (
                    <Box
                      component="img"
                      src={itemDetails.banner}
                      alt={itemDetails.title}
                      sx={{ width: 80, height: 60, objectFit: "cover", borderRadius: 1 }}
                    />
                  )}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} lineHeight={1.3}>
                      {itemDetails.title || `${payment.payment_for_type} Purchase`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {payment.payment_for_type}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Price Breakdown */}
                <Stack spacing={1.5}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Price
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {payment.currency} {parseFloat(payment.original_amount).toFixed(2)}
                    </Typography>
                  </Box>

                  {parseFloat(payment.discount_amount) > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="success.main">
                          Discount
                        </Typography>
                        {payment.coupon_code && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                            <Stars sx={{ fontSize: 14, color: "success.main" }} />
                            <Typography variant="caption" color="success.main" fontWeight={600}>
                              {`Coupon "${payment.coupon_code}" applied`}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        -{payment.currency} {parseFloat(payment.discount_amount).toFixed(2)}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 1 }} />

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      Total
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">
                      {payment.currency} {parseFloat(payment.amount).toFixed(2)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Helpline / Info Sidebar (Required by Rule: Always keep helpline sidebar to the right) */}
            <HelplineCard isMobile={false} />
          </Stack>
        </Grid>
      </Grid>

      {/* Helpline / Info Sidebar for Mobile (renders at the very bottom of the page) */}
      <HelplineCard isMobile={true} />
    </Container>
  )
}

/* Sub-component: Helpline Card */
function HelplineCard({ isMobile }) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 1,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        display: isMobile ? { xs: "block", md: "none" } : { xs: "none", md: "block" },
        mt: isMobile ? 3 : 0,
      }}
    >
      <Typography
        variant="subtitle2"
        fontWeight={700}
        sx={{ mb: 2, letterSpacing: 0.5, textTransform: "uppercase", color: "text.secondary" }}
      >
        Important Information
      </Typography>
      <List disablePadding>
        {[
          {
            icon: <OfflinePin sx={{ color: "success.main" }} />,
            primary: "Instant Enrollment",
            secondary:
              "Your enrollment is activated immediately after successful payment confirmation.",
          },
          {
            icon: <HelpOutline sx={{ color: "info.main" }} />,
            primary: "Need help with payment?",
            secondary:
              "Get in touch with support at support@lms.app or check the FAQs on the course detail page.",
          },
          {
            icon: <Receipt sx={{ color: "secondary.main" }} />,
            primary: "Secure Invoices",
            secondary:
              "An email confirmation containing your transaction invoice will be sent automatically.",
          },
        ].map((item, index) => (
          <ListItem key={index} sx={{ px: 0, alignItems: "flex-start", mb: index === 2 ? 0 : 2 }}>
            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.primary}
              secondary={item.secondary}
              primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
              secondaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
              sx={{ m: 0 }}
            />
          </ListItem>
        ))}
      </List>
    </Card>
  )
}

/* Sub-component: Redirecting gateway form */
function RedirectPaymentForm({ payment_public_id, amount, currency, gatewayName }) {
  const [initiateCheckout, { isLoading }] = useInitiateCheckoutMutation()
  const [error, setError] = useState(null)

  const handlePay = async () => {
    try {
      setError(null)
      const res = await initiateCheckout(payment_public_id).unwrap()
      const url = res?.data?.checkout_url
      if (!url) throw new Error("No checkout URL returned from payment gateway.")
      if (url.startsWith("http")) {
        window.location.href = url
      } else {
        window.location.href = `${window.location.origin}${url}`
      }
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.data?.detail ||
          err?.message ||
          "Failed to initiate payment gateway."
      )
    }
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        You will be redirected to the secure <strong>{gatewayName}</strong> portal to complete your
        transaction.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
          {error}
        </Alert>
      )}
      <Button
        variant="contained"
        fullWidth
        disabled={isLoading}
        onClick={handlePay}
        sx={{
          py: 1.5,
          borderRadius: 1,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: 0,
          "&:hover": { boxShadow: 0 },
        }}
      >
        {isLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          `Proceed to Payment (${currency} ${parseFloat(amount).toFixed(2)})`
        )}
      </Button>
    </Box>
  )
}

const COUNTRY_CODE_MAP = {
  "united states": "US",
  "united kingdom": "GB",
  canada: "CA",
  australia: "AU",
  bangladesh: "BD",
  india: "IN",
  germany: "DE",
  france: "FR",
  "saudi arabia": "SA",
  "united arab emirates": "AE",
}

/* Sub-component: Embedded Stripe Form using Stripe Hooks */
function StripeCheckoutForm({ payment, clientSecret }) {
  const stripe = useStripe()
  const elements = useElements()
  const theme = useTheme()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const { billing_name, member_email, amount, currency, public_id } = payment

  const handleSubmit = async event => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: billing_name || "",
          email: member_email || "",
          phone: payment.billing_phone || "",
          address: {
            line1: payment.billing_address_line_1 || "",
            line2: payment.billing_address_line_2 || "",
            city: payment.billing_city || "",
            state: payment.billing_state || "",
            postal_code: payment.billing_postal_code || "",
            country:
              COUNTRY_CODE_MAP[payment.billing_country?.trim().toLowerCase()] ||
              payment.billing_country ||
              "",
          },
        },
      },
      return_url: `${window.location.origin}/payments/success?ref=${public_id}`,
    })

    if (error) {
      setErrorMessage(error.message)
      setIsProcessing(false)
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      router.push(`/payments/success?ref=${public_id}`)
    } else {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Box>
          <TextField
            label="Name"
            fullWidth
            value={billing_name || ""}
            disabled
            variant="outlined"
            size="small"
            sx={{
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: theme.palette.text.primary,
              },
              "& .MuiOutlinedInput-root": {
                bgcolor: "action.hover",
                borderRadius: 1,
              },
            }}
          />
        </Box>

        <Box>
          <TextField
            label="Email"
            fullWidth
            value={member_email || ""}
            disabled
            variant="outlined"
            size="small"
            sx={{
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: theme.palette.text.primary,
              },
              "& .MuiOutlinedInput-root": {
                bgcolor: "action.hover",
                borderRadius: 1,
              },
            }}
          />
        </Box>

        <Box>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: "action.hover",
            }}
          >
            <CardElement
              options={{
                style: {
                  base: {
                    color: theme.palette.text.primary,
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    "::placeholder": {
                      color: theme.palette.text.secondary,
                    },
                  },
                  invalid: {
                    color: theme.palette.error.main,
                  },
                },
              }}
            />
          </Paper>
        </Box>
      </Stack>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
          {errorMessage}
        </Alert>
      )}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || isProcessing}
        sx={{
          py: 1.5,
          borderRadius: 1,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: 0,
          "&:hover": { boxShadow: 0 },
        }}
      >
        {isProcessing ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          `Pay ${currency} ${parseFloat(amount).toFixed(2)}`
        )}
      </Button>
    </form>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CPageLoader />}>
      <CheckoutContent />
    </Suspense>
  )
}
