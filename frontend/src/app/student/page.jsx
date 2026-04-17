"use client";

import {
    Box,
    Typography,
    Card,
    CardContent,
    Avatar,
    LinearProgress,
    Stack,
    Divider,
    IconButton,
    Chip,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    useTheme,
    alpha,
    Grid,
    useMediaQuery
} from "@mui/material";
import { motion } from "framer-motion";
import {
    SchoolOutlined,
    TrendingUp,
    PlayCircleOutline,
    ArrowForward,
    EmojiEventsOutlined,
    TimerOutlined
} from "@mui/icons-material";
import NeuralPanel from "@/components/ui/NeuralPanel";
import StudentLayout from "./StudentLayout";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 12,
        },
    },
};

export default function StudentDashboard() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const stats = [
        {
            title: "Active Courses",
            value: "04",
            change: "2 new this week",
            icon: <SchoolOutlined />,
            color: theme.palette.secondary.main,
        },
        {
            title: "Learning Hours",
            value: "128h",
            change: "+12% vs last month",
            icon: <TimerOutlined />,
            color: theme.palette.primary.main,
        },
        {
            title: "Certificates",
            value: "02",
            change: "1 pending review",
            icon: <EmojiEventsOutlined />,
            color: "#8b5cf6", // Purple accent
        },
    ];

    const recentLessons = [
        {
            id: 1,
            title: "Advanced Financial modeling",
            lesson: "Module 4: Cash Flow Analysis",
            progress: 65,
            time: "2 hours ago",
        },
        {
            id: 2,
            title: "Digital Marketing Mastery",
            lesson: "Instagram Ads Strategies",
            progress: 30,
            time: "Yesterday",
        },
        {
            id: 3,
            title: "Professional Python Developer",
            lesson: "Introduction to FastAPI",
            progress: 85,
            time: "3 days ago",
        },
    ];

    const upcomingEvents = [
        { id: 1, title: "LMS System Training", time: "Tomorrow, 10:00 AM", type: "Live Session" },
        { id: 2, title: "Quiz: Marketing Basics", time: "Thursday, 4:00 PM", type: "Exam" },
    ];

    return (
        <StudentLayout>
            <Box
                component={motion.div}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                sx={{
                    width: "100%",
                    pb: 10,
                    overflowX: 'hidden' // Double protection
                }}
            >
                <Box
                    sx={{
                        mb: { xs: 4, md: 6 },
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: 'flex-start', sm: "flex-end" },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2
                    }}
                >
                    <Box sx={{ maxWidth: '100%' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} mb={1}>
                            <Typography
                                variant={isMobile ? "h4" : "h3"}
                                fontWeight="900"
                                sx={{
                                    letterSpacing: "-0.04em",
                                    color: 'primary.main',
                                    wordBreak: 'break-word',
                                    lineHeight: 1.1
                                }}
                            >
                                Elite Performance, Nick
                            </Typography>
                            <Chip
                                label="Premium Tier"
                                size="small"
                                sx={{
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    color: 'secondary.main',
                                    fontWeight: 900,
                                    fontSize: '0.65rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    borderRadius: '6px'
                                }}
                            />
                        </Stack>
                        <Typography
                            variant="body1"
                            sx={{
                                color: "text.secondary",
                                fontWeight: 600,
                                letterSpacing: -0.5,
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}
                        >
                            Your learning journey is progressing at an exponential rate.
                        </Typography>
                    </Box>
                </Box>

                {/* Metrics Grid */}
                <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 6 }}>
                    {stats.map((stat, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                            <motion.div variants={itemVariants} style={{ height: '100%' }}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: "100%",
                                        position: "relative",
                                        overflow: "hidden",
                                        bgcolor: "rgba(255, 255, 255, 0.5) !important",
                                        backdropFilter: "blur(15px)",
                                        border: "1px solid rgba(0, 0, 0, 0.05)",
                                        borderLeft: { xs: `4px solid ${stat.color} !important`, sm: `5px solid ${stat.color} !important` },
                                        borderRadius: '24px',
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: `0 20px 40px -15px ${alpha(stat.color, 0.15)} !important`,
                                            borderColor: alpha(stat.color, 0.2),
                                        },
                                    }}
                                >
                                    <NeuralPanel
                                        particleCount={15}
                                        opacity={0.15}
                                        color={stat.color}
                                    />
                                    <CardContent sx={{ p: { xs: 3, sm: 4 }, position: "relative", zIndex: 1 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                                mb: 3,
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    color: "text.secondary",
                                                    fontWeight: 800,
                                                    textTransform: "uppercase",
                                                    letterSpacing: 1.5,
                                                    fontSize: '0.7rem'
                                                }}
                                            >
                                                {stat.title}
                                            </Typography>
                                            <Avatar
                                                sx={{
                                                    backgroundColor: alpha(stat.color, 0.1),
                                                    color: stat.color,
                                                    width: { xs: 40, sm: 48 },
                                                    height: { xs: 40, sm: 48 },
                                                    borderRadius: "14px",
                                                    border: `1px solid ${alpha(stat.color, 0.2)}`,
                                                }}
                                            >
                                                {stat.icon}
                                            </Avatar>
                                        </Box>
                                        <Typography
                                            variant={isMobile ? "h4" : "h3"}
                                            fontWeight="900"
                                            sx={{ mb: 1, color: "primary.main", letterSpacing: -1 }}
                                        >
                                            {stat.value}
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <TrendingUp sx={{ fontSize: 16, color: 'secondary.main' }} />
                                            <Typography
                                                variant="caption"
                                                sx={{ color: "text.secondary", fontWeight: 700 }}
                                            >
                                                {stat.change}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {/* Content Grids */}
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    {/* Main Visualized Data */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <motion.div variants={itemVariants}>
                            <Card
                                elevation={0}
                                sx={{
                                    height: "100%",
                                    minHeight: { xs: 400, md: 480 },
                                    position: "relative",
                                    overflow: "hidden",
                                    bgcolor: "rgba(255, 255, 255, 0.5) !important",
                                    backdropFilter: "blur(15px)",
                                    borderRadius: '32px',
                                    border: "1px solid rgba(0, 0, 0, 0.05)",
                                }}
                            >
                                <NeuralPanel particleCount={30} opacity={0.1} />
                                <CardContent sx={{ p: { xs: 3, sm: 5 }, position: "relative", zIndex: 1 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: { xs: 'flex-start', sm: 'center' },
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            gap: 2,
                                            mb: { xs: 4, sm: 6 },
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                variant="h5"
                                                fontWeight="900"
                                                sx={{ color: "primary.main", mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                                            >
                                                Learning Consistency
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{ color: "text.secondary", fontWeight: 700 }}
                                            >
                                                Module completion rate across all courses
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1}>
                                            <Chip
                                                label="Daily View"
                                                size="small"
                                                sx={{
                                                    backgroundColor: "secondary.main",
                                                    color: "#fff",
                                                    fontWeight: 800,
                                                }}
                                            />
                                            <Chip
                                                label="Monthly"
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    color: "text.disabled",
                                                    borderColor: "rgba(0,0,0,0.1)",
                                                }}
                                            />
                                        </Stack>
                                    </Box>

                                    {/* Refined Mock Chart UI */}
                                    <Box sx={{ width: '100%', overflowX: 'auto', pb: 2 }}>
                                        <Box
                                            sx={{
                                                height: { xs: 200, sm: 280 },
                                                minWidth: { xs: 500, sm: '100%' }, // Force scroll context on mobile
                                                display: "flex",
                                                alignItems: "flex-end",
                                                gap: { xs: 1.5, sm: 2.5 },
                                                px: 1,
                                                position: "relative",
                                            }}
                                        >
                                            {[0, 1, 2, 3].map((line) => (
                                                <Box
                                                    key={line}
                                                    sx={{
                                                        position: "absolute",
                                                        bottom: `${line * 33.3}%`,
                                                        left: 0,
                                                        right: 0,
                                                        height: "1px",
                                                        borderBottom: "1px dashed rgba(0,0,0,0.05)",
                                                        zIndex: 0,
                                                    }}
                                                />
                                            ))}

                                            {[45, 65, 40, 85, 50, 95, 70, 100, 55, 90, 65, 80].map(
                                                (height, i) => (
                                                    <Box
                                                        key={i}
                                                        sx={{
                                                            flex: 1,
                                                            height: `${height}%`,
                                                            background:
                                                                i === 7
                                                                    ? (theme) => `linear-gradient(to top, ${alpha(theme.palette.secondary.main, 0.4)}, ${theme.palette.secondary.main})`
                                                                    : "linear-gradient(to top, rgba(46, 184, 46, 0.05), rgba(46, 184, 46, 0.15))",
                                                            borderRadius: "12px 12px 6px 6px",
                                                            position: "relative",
                                                            zIndex: 1,
                                                            cursor: "pointer",
                                                            border:
                                                                i === 7
                                                                    ? (theme) => `1px solid ${theme.palette.secondary.main}`
                                                                    : "1px solid rgba(0,0,0,0.05)",
                                                            transition:
                                                                "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                                            "&:hover": {
                                                                height: `${height + 5}%`,
                                                                background:
                                                                    (theme) => `linear-gradient(to top, ${alpha(theme.palette.secondary.main, 0.6)}, ${theme.palette.secondary.main})`,
                                                                boxShadow: (theme) => `0 0 30px ${alpha(theme.palette.secondary.main, 0.2)}`,
                                                            },
                                                        }}
                                                    >
                                                        {i === 7 && !isMobile && (
                                                            <Box
                                                                sx={{
                                                                    position: "absolute",
                                                                    top: -40,
                                                                    left: "50%",
                                                                    transform: "translateX(-50%)",
                                                                    backgroundColor: "primary.main",
                                                                    color: "#fff",
                                                                    px: 1.5,
                                                                    py: 0.5,
                                                                    borderRadius: "6px",
                                                                    fontSize: "0.7rem",
                                                                    fontWeight: 900,
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                100% DONE
                                                            </Box>
                                                        )}
                                                    </Box>
                                                ),
                                            )}
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                mt: 2,
                                                px: 1,
                                                minWidth: { xs: 500, sm: '100%' }
                                            }}
                                        >
                                            {[
                                                "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                                                "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
                                            ].map((month, i) => (
                                                <Typography
                                                    key={i}
                                                    variant="caption"
                                                    sx={{
                                                        color: "text.disabled",
                                                        flex: 1,
                                                        textAlign: "center",
                                                        fontWeight: 800,
                                                        fontSize: "0.65rem",
                                                    }}
                                                >
                                                    {month}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Activity Feed */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <motion.div variants={itemVariants}>
                            <Card
                                elevation={0}
                                sx={{
                                    height: "100%",
                                    position: "relative",
                                    overflow: "hidden",
                                    bgcolor: "rgba(255, 255, 255, 0.5) !important",
                                    backdropFilter: "blur(15px)",
                                    borderRadius: '32px',
                                    border: "1px solid rgba(0, 0, 0, 0.05)",
                                }}
                            >
                                <NeuralPanel particleCount={20} opacity={0.1} />
                                <CardContent
                                    sx={{
                                        p: { xs: 3, sm: 4 },
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "100%",
                                        position: "relative",
                                        zIndex: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 4,
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            fontWeight="900"
                                            sx={{ color: "primary.main" }}
                                        >
                                            Active Pursuits
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            sx={{
                                                color: "secondary.main",
                                                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                                borderRadius: "10px",
                                            }}
                                        >
                                            <ArrowForward fontSize="small" />
                                        </IconButton>
                                    </Box>

                                    <List disablePadding sx={{ flexGrow: 1 }}>
                                        {recentLessons.map((course, index) => (
                                            <Box key={course.id}>
                                                <ListItem alignItems="flex-start" sx={{ px: 0, py: 2.5 }}>
                                                    <ListItemAvatar sx={{ minWidth: { xs: 50, sm: 60 } }}>
                                                        <Avatar
                                                            sx={{
                                                                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                                                color: "secondary.main",
                                                                fontSize: "1.2rem",
                                                                fontWeight: 800,
                                                                border: "1px solid rgba(0,0,0,0.05)",
                                                                width: 44,
                                                                height: 44,
                                                            }}
                                                        >
                                                            {course.title.charAt(0)}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primaryTypographyProps={{ component: 'div' }}
                                                        secondaryTypographyProps={{ component: 'div' }}
                                                        primary={
                                                            <Typography variant="body2" sx={{ fontWeight: 900, mb: 0.5, fontSize: '0.85rem' }}>
                                                                {course.title}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Box>
                                                                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, display: 'block', lineHeight: 1.2 }}>
                                                                    {course.lesson}
                                                                </Typography>
                                                                <Box sx={{ mt: 1.5 }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                        <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.6rem' }}>PROGRESS</Typography>
                                                                        <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.6rem' }}>{course.progress}%</Typography>
                                                                    </Box>
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        value={course.progress}
                                                                        sx={{
                                                                            height: 4,
                                                                            borderRadius: 2,
                                                                            bgcolor: alpha(theme.palette.secondary.main, 0.05),
                                                                            "& .MuiLinearProgress-bar": {
                                                                                borderRadius: 2,
                                                                                bgcolor: 'secondary.main'
                                                                            }
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                                {index < recentLessons.length - 1 && (
                                                    <Divider sx={{ opacity: 0.5, my: 1 }} />
                                                )}
                                            </Box>
                                        ))}
                                    </List>

                                    <Box
                                        sx={{
                                            mt: 4,
                                            pt: 4,
                                            borderTop: "1px solid rgba(0,0,0,0.05)",
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PlayCircleOutline sx={{ color: 'secondary.main' }} fontSize="small" />
                                            Upcoming Sessions
                                        </Typography>
                                        <Stack spacing={2}>
                                            {upcomingEvents.map(event => (
                                                <Box key={event.id} sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.03)' }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'secondary.main', textTransform: 'uppercase' }}>{event.type}</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{event.title}</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{event.time}</Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>

                {/* Dynamic Learning Paths Grid (Zigzag Pattern) */}
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mt: 8, mb: 4, letterSpacing: -1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                    Engineered Learning Paths
                </Typography>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    {/* Row 1: 8 + 4 */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <motion.div variants={itemVariants}>
                            <Card sx={{
                                borderRadius: { xs: '24px', md: '32px' },
                                minHeight: { xs: 200, md: 240 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                p: { xs: 3, md: 4 },
                                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #1e1e1e 100%)`,
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <NeuralPanel particleCount={20} opacity={0.2} color="ffffff" />
                                <Typography variant={isMobile ? "h5" : "h4"} fontWeight={900}>Financial Engineering</Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.brand.green[300], mt: 1, maxWidth: 400, fontWeight: 700, fontSize: '0.85rem' }}>Master the mathematics of modern finance with our advanced derivatives and risk management track.</Typography>
                                <Box sx={{ mt: 3 }}>
                                    <Chip label="Masterclass" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 800 }} />
                                </Box>
                            </Card>
                        </motion.div>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <motion.div variants={itemVariants}>
                            <Card sx={{
                                borderRadius: { xs: '24px', md: '32px' },
                                minHeight: { xs: 180, md: 240 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                p: { xs: 3, md: 4 },
                                background: 'white',
                                border: '1px solid rgba(0,0,0,0.05)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Typography variant="h5" fontWeight={900} color="primary.main">Python for FinTech</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>Build high-performance trading systems.</Typography>
                                <IconButton sx={{ mt: 2, alignSelf: 'flex-start', bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                                    <ArrowForward />
                                </IconButton>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Row 2: 4 + 8 */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <motion.div variants={itemVariants}>
                            <Card sx={{
                                borderRadius: { xs: '24px', md: '32px' },
                                minHeight: { xs: 180, md: 240 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                p: { xs: 3, md: 4 },
                                background: 'white',
                                border: '1px solid rgba(0,0,0,0.05)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Typography variant="h5" fontWeight={900} color="primary.main">AI in Ethics</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>Navigating the future of automation.</Typography>
                                <IconButton sx={{ mt: 2, alignSelf: 'flex-start', bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                                    <ArrowForward />
                                </IconButton>
                            </Card>
                        </motion.div>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <motion.div variants={itemVariants}>
                            <Card sx={{
                                borderRadius: { xs: '24px', md: '32px' },
                                minHeight: { xs: 200, md: 240 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                p: { xs: 3, md: 4 },
                                background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, #1e1e1e 100%)`,
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <NeuralPanel particleCount={20} opacity={0.2} color="ffffff" />
                                <Typography variant={isMobile ? "h5" : "h4"} fontWeight={900}>Digital Economies</Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.brand.navy[100], mt: 1, maxWidth: 400, fontWeight: 700, fontSize: '0.85rem' }}>Analyze the shift towards decentralized finance and the impact of blockchain on global markets.</Typography>
                                <Box sx={{ mt: 3 }}>
                                    <Chip label="New Track" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 800 }} />
                                </Box>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>
            </Box>
        </StudentLayout>
    );
}
