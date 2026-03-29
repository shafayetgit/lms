import {
    Box,
    Typography,
    Rating,
    LinearProgress,
    Card,
    CardContent,
    Avatar,
    Divider,
    Button,
  } from "@mui/material";
  
  const reviews = [
    {
      name: "John Doe",
      date: "September 20, 2025",
      rating: 5,
      review: "Excellent course! Very detailed and easy to follow.",
    },
    {
      name: "Jane Smith",
      date: "September 18, 2025",
      rating: 4,
      review: "Good content but could use more real-world examples.",
    },
  ];
  
  export default function CourseReviews() {
    const averageRating = 4.6;
    const totalReviews = 128;
    const ratingDistribution = [80, 25, 15, 5, 3]; // counts for 5→1 stars
  
    return (
      <Box sx={{ my: 6 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Student Reviews
        </Typography>
  
        {/* Rating summary */}
        <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h3" fontWeight="bold" sx={{ mr: 2 }}>
            {averageRating.toFixed(1)}
          </Typography>
          <Box>
            <Rating value={averageRating} precision={0.1} readOnly />
            <Typography variant="body2" color="text.secondary">
              {totalReviews} reviews
            </Typography>
          </Box>
        </Box>
  
        {/* Rating breakdown */}
        {ratingDistribution.map((count, index) => (
          <Box
            key={index}
            display="flex"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography variant="body2" sx={{ width: 50 }}>
              {5 - index} ★
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(count / totalReviews) * 100}
              sx={{ flexGrow: 1, mx: 2, height: 8, borderRadius: 5 }}
            />
            <Typography variant="body2">{count}</Typography>
          </Box>
        ))}
  
        <Divider sx={{ my: 3 }} />
  
        {/* Review list */}
        {reviews.map((review, i) => (
          <Card key={i} sx={{ mb: 2, boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar sx={{ mr: 2 }}>{review.name.charAt(0)}</Avatar>
                <Box>
                  <Typography fontWeight="bold">{review.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {review.date}
                  </Typography>
                </Box>
              </Box>
              <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
              <Typography variant="body1">{review.review}</Typography>
            </CardContent>
          </Card>
        ))}
  
        <Box textAlign="center" mt={3}>
          <Button variant="outlined">Load More Reviews</Button>
        </Box>
      </Box>
    );
  }
  