"use client"

import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Rating,
  LinearProgress,
  Avatar,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material"
import { useReadReviewsQuery } from "@/features/review/reviewAPI"
import { getCurrentUser } from "@/lib/auth/client"
import WriteReviewDialog from "./WriteReviewDialog"

function getRelativeTimeString(dateString) {
  if (!dateString) return ""
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`
}

export default function RatingSection({ course, isEnrolled = false }) {
  const [pageSize, setPageSize] = useState(5)

  // 1. Fetch reviews distribution (up to 100) to compute star ratings breakdown
  const { data: distributionResponse, isLoading: isDistLoading } = useReadReviewsQuery(
    { course_id: course?.public_id, size: 100 },
    { skip: !course?.public_id }
  )

  // 2. Fetch paginated list of reviews (increases by 5 on clicking "Load More")
  const { data: reviewsResponse, isLoading, isFetching } = useReadReviewsQuery(
    { course_id: course?.public_id, size: pageSize, page: 1 },
    { skip: !course?.public_id }
  )

  const reviews = React.useMemo(() => reviewsResponse?.data || [], [reviewsResponse])
  const distributionList = React.useMemo(() => distributionResponse?.data || [], [distributionResponse])

  const [user, setUser] = useState(null)
  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(getCurrentUser())
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const [open, setOpen] = useState(false)

  const myReview = React.useMemo(() => {
    if (!user || !distributionList) return null
    return distributionList.find((r) => r.student?.username === user.sub)
  }, [user, distributionList])

  if (isLoading || isDistLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  const totalReviews = course?.total_reviews || reviewsResponse?.meta?.total || reviews.length
  const averageRating = Number(course?.avg_rating || 0)

  // Calculate breakdown from distributionList
  const ratingDistribution = [0, 0, 0, 0, 0] // index 0: 5 stars, index 4: 1 star
  distributionList.forEach((r) => {
    const ratingVal = Math.round(r.rating)
    if (ratingVal >= 1 && ratingVal <= 5) {
      ratingDistribution[5 - ratingVal]++
    }
  })

  const handleLoadMore = () => {
    setPageSize((prevSize) => prevSize + 5)
  }

  const hasNext = reviewsResponse?.meta?.has_next

  return (
    <Box sx={{ mb: 6 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          Reviews
        </Typography>
        {isEnrolled && user && !myReview && (
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            size="small"
            sx={{ fontWeight: 600 }}
          >
            Write a Review
          </Button>
        )}
      </Box>

      {/* Write/Edit Review Dialog */}
      {isEnrolled && user && (
        <WriteReviewDialog
          open={open}
          onClose={() => setOpen(false)}
          course={course}
          user={user}
          myReview={myReview}
        />
      )}

      {/* Rating summary */}
      <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
        <Typography variant="h3" fontWeight="bold">
          {averageRating.toFixed(1)}
        </Typography>
        <Rating value={averageRating} precision={0.1} readOnly />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          ({totalReviews} reviews)
        </Typography>
      </Box>

      {/* Rating breakdown */}
      {totalReviews > 0 ? (
        ratingDistribution.map((count, index) => {
          const starLabel = 5 - index
          const divisor = distributionList.length || 1
          const percentage = (count / divisor) * 100
          return (
            <Box key={index} display="flex" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ width: 50 }}>
                {starLabel} ★
              </Typography>
              <LinearProgress
                variant="determinate"
                value={percentage}
                aria-label={`${starLabel} Star Rating Breakdown`}
                sx={{ flexGrow: 1, mx: 2, height: 8, borderRadius: 5 }}
              />
              <Typography variant="body2" sx={{ minWidth: 20, textAlign: "right" }}>
                {count}
              </Typography>
            </Box>
          )
        })
      ) : (
        <Typography variant="body2" color="text.secondary">
          No ratings yet.
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Review list */}
      {reviews.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No reviews yet for this course.
        </Typography>
      ) : (
        reviews.map((review, i) => (
          <Box key={review.public_id || i} sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" mb={0.75}>
              <Avatar
                sx={{ 
                  width: 36, 
                  height: 36, 
                  mr: 1.5, 
                  fontSize: "0.95rem",
                  bgcolor: "text.primary",
                  color: "background.paper"
                }}
                src={review.student?.avatar}
              >
                {review.student?.full_name?.charAt(0) ||
                  review.student?.first_name?.charAt(0) ||
                  "U"}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 0.25 }}>
                  <Typography variant="subtitle2" component="span" fontWeight="bold">
                    {review.student?.full_name ||
                      `${review.student?.first_name || ""} ${review.student?.last_name || ""}`.trim() ||
                      "Anonymous"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getRelativeTimeString(review.created_at)}
                  </Typography>
                </Box>
                <Rating
                  value={review.rating}
                  readOnly
                  size="small"
                  precision={0.1}
                  sx={{ fontSize: "1rem" }}
                />
              </Box>
            </Box>
            {review.body && (
              <Typography variant="body2" sx={{ mt: 1, whiteSpace: "pre-line", color: "text.primary" }}>
                {review.body}
              </Typography>
            )}
            {i < reviews.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))
      )}

      {hasNext && (
        <Box textAlign="center" mt={3}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={isFetching}
            startIcon={isFetching ? <CircularProgress size={16} /> : null}
          >
            {isFetching ? "Loading..." : "Load More Reviews"}
          </Button>
        </Box>
      )}
    </Box>
  )
}
