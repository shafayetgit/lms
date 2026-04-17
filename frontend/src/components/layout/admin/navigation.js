import { PAGES } from "@/lib/constants";
import { DashboardOutlined, Category } from "@mui/icons-material";

export const menuItems = [
  { title:  PAGES.ADMIN.DASHBOARD.label, path:  PAGES.ADMIN.CATEGORY.path, icon: <DashboardOutlined /> },
  { title: PAGES.ADMIN.CATEGORY.label, path:  PAGES.ADMIN.CATEGORY.path, icon: <Category /> },
];