import { APP_NAME } from "@/lib/constants";
import ModuleContainer from "@/components/ui/ModuleContainer";
import CreateDialog from "./_parts/CreateDialog";

export const metadata = {
  title: `Category | ${APP_NAME}`,
};

const breadcrumbs = [
  { label: "Dashboard", path: "/" },
  { label: "Categories", path: "/admin/categories" },
];

export default function layout({ children }) {
  return (
    <ModuleContainer breadcrumbs={breadcrumbs} action={<CreateDialog />}>
      {children}
    </ModuleContainer>
  );
}
