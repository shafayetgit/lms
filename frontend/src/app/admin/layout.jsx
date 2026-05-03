import Layout from "@/components/layout/admin/Layout";
import React from "react";
import Create from "./categories/_parts/Create";

export default function layout({ children }) {
  return <Layout actionButton={<Create />}>{children}</Layout>;
}
