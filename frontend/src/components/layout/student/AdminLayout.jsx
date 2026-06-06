import React from "react"
import BaseLayout from "../BaseLayout"
import Sidebar from "./parts/Sidebar"
import Topbar from "./parts/Topbar"

function AdminLayout({ children }) {
  return (
    <BaseLayout sidebar={Sidebar} topbar={Topbar}>
      {children}
    </BaseLayout>
  )
}
export default AdminLayout
