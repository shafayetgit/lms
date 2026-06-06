import Sidebar from "@/components/layout/admin/parts/Sidebar";
import Topbar from "@/components/layout/admin/parts/Topbar";
import BaseLayout from "@/components/layout/BaseLayout";

export default function layout({ children }) {
  return <BaseLayout sidebar={Sidebar} topbar={Topbar}>{children}</BaseLayout>;
}
