import { ROUTES } from "@/lib/constants";
import { DashboardOutlined, Category } from "@mui/icons-material";

export const menuItems = [
  { title:  ROUTES.admin.dashboard.label, path:  ROUTES.admin.dashboard.path, icon: <DashboardOutlined /> },
  { title: ROUTES.admin.category.label, path:  ROUTES.admin.category.path, icon: <Category /> },
];