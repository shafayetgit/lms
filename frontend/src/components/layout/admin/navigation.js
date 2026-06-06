import { ROUTES } from "@/lib/constants/routes";
import { LocalHospital, MedicalServices, People, School, Assignment, AssignmentTurnedIn, Star } from "@mui/icons-material";

export const menuItems = [
  {
    title: ROUTES.admin.dashboard.label,
    path: ROUTES.admin.dashboard.path,
    icon: <MedicalServices />,
  },
    {
      title: ROUTES.admin.category.label,
      path: ROUTES.admin.category.path,
      icon: <LocalHospital />,
    },
    {
      title: ROUTES.admin.student.label,
      path: ROUTES.admin.student.path,
      icon: <People />,
    },
    {
      title: ROUTES.admin.enrollment.label,
      path: ROUTES.admin.enrollment.path,
      icon: <AssignmentTurnedIn />,
    },
    {
      title: ROUTES.admin.instructor.label,
      path: ROUTES.admin.instructor.path,
      icon: <People />,
    },
    {
      title: ROUTES.admin.course.label,
      path: ROUTES.admin.course.path,
      icon: <School />,
    },
    {
      title: ROUTES.admin.quiz.label,
      path: ROUTES.admin.quiz.path,
      icon: <Assignment />,
    },
];
