import Sidebar from "@/components/layout/lms/parts/Sidebar"
import Topbar from "@/components/layout/lms/parts/Topbar"
import BaseLayout from "@/components/layout/BaseLayout"

export default function SettingsLayout({ children }) {
  return (
    <BaseLayout sidebar={Sidebar} topbar={Topbar}>
      {children}
    </BaseLayout>
  )
}
