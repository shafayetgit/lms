'use client';
import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  Rating,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  PlayCircleOutline,
  AccessTime,
  Person,
  Assignment,
  Star,
  ExpandMore,
  Home,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Share,
} from '@mui/icons-material';

// Mock data for the course
const courseData = {
  id: 1,
  title: 'Advanced Financial Analysis & Investment Banking',
  instructor: 'Michael Chen',
  rating: 4.8,
  totalRatings: 1247,
  students: 15420,
  duration: '28 hours',
  lectures: 186,
  level: 'Intermediate',
  lastUpdated: 'October 2023',
  price: 94.99,
  originalPrice: 149.99,
  language: 'English',
  description: 'Master financial analysis, valuation, and modeling techniques used by investment bankers and equity research analysts.',
  learningObjectives: [
    'Perform advanced financial statement analysis',
    'Build complex financial models in Excel',
    'Value companies using DCF, comparable companies, and precedent transactions',
    'Analyze M&A deals and LBO transactions',
    'Create investment recommendations and pitch books'
  ],
  curriculum: [
    {
      section: 'Introduction to Investment Banking',
      lectures: 12,
      duration: '2.5 hours',
      content: [
        { title: 'Course Overview', duration: '15:20', preview: true },
        { title: 'The Role of Investment Banks', duration: '22:45', preview: false },
        { title: 'Financial Markets Overview', duration: '18:30', preview: false },
      ]
    },
    {
      section: 'Financial Statement Analysis',
      lectures: 24,
      duration: '4 hours',
      content: [
        { title: 'Income Statement Deep Dive', duration: '25:15', preview: true },
        { title: 'Balance Sheet Analysis', duration: '28:40', preview: false },
        { title: 'Cash Flow Statement Mastery', duration: '32:10', preview: false },
      ]
    },
    {
      section: 'Financial Modeling',
      lectures: 38,
      duration: '6.5 hours',
      content: [
        { title: 'Excel Tips for Financial Modeling', duration: '35:25', preview: true },
        { title: 'Building Revenue Projections', duration: '42:30', preview: false },
        { title: 'Working Capital Schedule', duration: '38:15', preview: false },
      ]
    }
  ],
  instructorInfo: {
    name: 'Michael Chen',
    title: 'Former Senior Analyst at Global Bank Inc.',
    bio: 'Michael has over 12 years of experience in investment banking and equity research. He has worked on transactions totaling over $50 billion in value and specializes in financial modeling and valuation. Michael is passionate about teaching finance professionals practical skills that are directly applicable in their careers.',
    students: 84500,
    courses: 8,
    rating: 4.9,
    image: 'https://placehold.co/150x150/87CEEB/000000?text=MC'
  },
  requirements: [
    'Basic understanding of accounting principles',
    'Microsoft Excel 2010 or later',
    'No prior finance experience required'
  ]
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function CourseDetailPage() {
  const [value, setValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleAddToFavorites = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        {/* Left Column - Course Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {courseData.title}
          </Typography>
          
          <Typography variant="body1" paragraph>
            {courseData.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating value={courseData.rating} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {courseData.rating} ({courseData.totalRatings.toLocaleString()} ratings)
              </Typography>
            </Box>
            <Typography variant="body2">•</Typography>
            <Typography variant="body2">
              {courseData.students.toLocaleString()} students
            </Typography>
            <Typography variant="body2">•</Typography>
            <Typography variant="body2">
              Last updated {courseData.lastUpdated}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            <Chip icon={<Person />} label={`Instructor: ${courseData.instructor}`} variant="outlined" />
            <Chip icon={<AccessTime />} label={courseData.duration} variant="outlined" />
            <Chip icon={<Assignment />} label={`${courseData.lectures} lectures`} variant="outlined" />
            <Chip label={courseData.level} color="primary" variant="outlined" />
          </Box>

          {/* Course Preview Video */}
          <Card sx={{ mb: 4 }}>
            <CardMedia
              component="div"
              sx={{
                height: 400,
                backgroundColor: '#f5f5f5',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <PlayCircleOutline sx={{ fontSize: 80, color: 'primary.main' }} />
            </CardMedia>
          </Card>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="course details tabs">
              <Tab label="Overview" />
              <Tab label="Curriculum" />
              <Tab label="Instructor" />
              <Tab label="Reviews" />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              What you'll learn
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {courseData.learningObjectives.map((item, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Star color="primary" sx={{ mr: 1, mt: 0.5 }} />
                    <Typography variant="body1">{item}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h5" gutterBottom fontWeight="bold">
              Requirements
            </Typography>
            <List dense>
              {courseData.requirements.map((req, index) => (
                <ListItem key={index}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Assignment color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={req} />
                </ListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={value} index={1}>
            <Typography variant="h6" gutterBottom>
              {courseData.curriculum.length} sections • {courseData.lectures} lectures • {courseData.duration} total length
            </Typography>
            
            {courseData.curriculum.map((section, index) => (
              <Accordion key={index} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography fontWeight="bold">{section.section}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {section.lectures} lectures • {section.duration}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {section.content.map((lecture, idx) => (
                      <ListItem 
                        key={idx} 
                        secondaryAction={
                          <Typography variant="body2" color="text.secondary">
                            {lecture.duration}
                          </Typography>
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <PlayCircleOutline color={lecture.preview ? "primary" : "inherit"} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={lecture.title} 
                          primaryTypographyProps={{
                            color: lecture.preview ? 'primary.main' : 'inherit',
                            fontWeight: lecture.preview ? 'bold' : 'normal'
                          }}
                        />
                        {lecture.preview && (
                          <Chip label="Preview" size="small" color="primary" variant="outlined" sx={{ ml: 2 }} />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </TabPanel>

          <TabPanel value={value} index={2}>
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  component="img"
                  src={courseData.instructorInfo.image}
                  alt={courseData.instructorInfo.name}
                  sx={{ width: 150, height: 150, borderRadius: '50%', mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  {courseData.instructorInfo.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {courseData.instructorInfo.title}
                </Typography>
                <Rating value={courseData.instructorInfo.rating} precision={0.1} readOnly size="small" />
              </Box>
              
              <Box>
                <Typography variant="body1" paragraph>
                  {courseData.instructorInfo.bio}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                  <Box>
                    <Typography variant="h6" color="primary">
                      {courseData.instructorInfo.students.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">Students</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" color="primary">
                      {courseData.instructorInfo.courses}
                    </Typography>
                    <Typography variant="body2">Courses</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" color="primary">
                      {courseData.instructorInfo.rating}
                    </Typography>
                    <Typography variant="body2">Rating</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={value} index={3}>
            <Typography variant="h5" gutterBottom>
              Student Reviews
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h3" sx={{ mr: 2 }}>
                {courseData.rating}
              </Typography>
              <Box>
                <Rating value={courseData.rating} precision={0.1} readOnly />
                <Typography variant="body2" color="text.secondary">
                  Course Rating • {courseData.totalRatings.toLocaleString()} ratings
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              Reviews will be displayed here
            </Typography>
          </TabPanel>
        </Grid>

        {/* Right Column - Course Action Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 115, boxShadow: 3 }}>
            <CardMedia
              component="div"
              sx={{ height: 200, backgroundColor: '#f5f5f5' }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  ${courseData.price}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  ${courseData.originalPrice}
                </Typography>
                <Chip label="37% off" color="success" size="small" />
              </Box>
              
              <Button 
                variant="contained" 
                fullWidth 
                size="large" 
                startIcon={<ShoppingCart />}
                sx={{ mb: 2 }}
              >
                Add to Cart
              </Button>
              
              <Button 
                variant="outlined" 
                fullWidth 
                size="large"
                sx={{ mb: 2 }}
              >
                Buy Now
              </Button>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button 
                  startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
                  onClick={handleAddToFavorites}
                  color={isFavorite ? "error" : "inherit"}
                >
                  {isFavorite ? 'Saved' : 'Save'}
                </Button>
                <Button startIcon={<Share />}>
                  Share
                </Button>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  This course includes:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PlayCircleOutline color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={`${courseData.duration} on-demand video`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Assignment color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="18 articles" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Assignment color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="25 downloadable resources" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <AccessTime color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Full lifetime access" />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default CourseDetailPage;