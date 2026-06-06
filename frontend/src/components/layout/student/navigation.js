import { ROUTES } from "@/lib/constants/routes";
import { LocalHospital, MedicalServices } from "@mui/icons-material";

export const menuItems = [
  {
    title: ROUTES.admin.consultationCategories.label,
    path: "/admin/consultation-categories",
    icon: <MedicalServices />,
  },
  {
    title: ROUTES.admin.doctors.label,
    path: "/admin/doctors",
    icon: <LocalHospital />,
  },
];
