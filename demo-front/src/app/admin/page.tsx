"use client";

import { Typography } from "antd";
import { useAdminHeader } from "@/components/admin/admin-header-context";

const { Paragraph } = Typography;

export default function AdminHome() {
  useAdminHeader({ title: "Resumen" });

  return (
    <Paragraph type="secondary">
      Panel de administración: usuarios, libros, alumnos, préstamos e informes.
    </Paragraph>
  );
}
