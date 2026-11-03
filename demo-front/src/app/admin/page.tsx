"use client";

import Link from "next/link";
import { Card, Col, Row, Typography } from "antd";
import {
  ArrowRightOutlined,
  BarChartOutlined,
  BookOutlined,
  ReadOutlined,
  SwapOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAdminHeader } from "@/components/admin/admin-header-context";
import { PALETTE } from "@/components/app-theme-provider";

const { Title, Text, Paragraph } = Typography;

interface ModuleCard {
  title: string;
  href: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  badge?: string;
}

const MODULES: ModuleCard[] = [
  {
    title: "Libros",
    href: "/admin/libros",
    description: "Administración del catálogo, alta de nuevos ejemplares, edición y control de estado.",
    icon: <BookOutlined style={{ fontSize: 26, color: PALETTE.forest }} />,
    iconBg: PALETTE.cream,
  },
  {
    title: "Préstamos",
    href: "/admin/prestamos",
    description: "Registro de préstamos a alumnos, control de fechas de vencimiento y recepción de devoluciones.",
    icon: <SwapOutlined style={{ fontSize: 26, color: "#2a9d8f" }} />,
    iconBg: "rgba(42, 157, 143, 0.12)",
  },
  {
    title: "Alumnos",
    href: "/admin/alumnos",
    description: "Gestión de alumnos registrados en el sistema, datos personales y documentos.",
    icon: <TeamOutlined style={{ fontSize: 26, color: "#4a7fa7" }} />,
    iconBg: "rgba(74, 127, 167, 0.12)",
  },
  {
    title: "Usuarios",
    href: "/admin/usuarios",
    description: "Gestión de usuarios operadores y personal habilitado para registrar atenciones y préstamos.",
    icon: <UserOutlined style={{ fontSize: 26, color: "#b5838d" }} />,
    iconBg: "rgba(181, 131, 141, 0.14)",
  },
  {
    title: "Informes",
    href: "/admin/informes",
    description: "Reportes de atenciones realizadas por operador y libros vencidos o no devueltos con descarga PDF.",
    icon: <BarChartOutlined style={{ fontSize: 26, color: PALETTE.olive }} />,
    iconBg: "rgba(107, 143, 78, 0.14)",
  },
  {
    title: "Catálogo Público",
    href: "/",
    description: "Visualizar el catálogo público de la biblioteca tal como lo ven los lectores y estudiantes.",
    icon: <ReadOutlined style={{ fontSize: 26, color: PALETTE.forest }} />,
    iconBg: PALETTE.cream,
    badge: "Público",
  },
];

export default function AdminHome() {
  useAdminHeader({ title: "Inicio" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1100 }}>
      {/* Bienvenida */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Title level={2} style={{ color: PALETTE.forest, margin: 0, letterSpacing: "-0.02em" }}>
          Panel de Administración
        </Title>
        <Paragraph type="secondary" style={{ margin: 0, fontSize: 15 }}>
          Seleccioná un módulo para gestionar la biblioteca, registrar operaciones o consultar reportes.
        </Paragraph>
      </div>

      {/* Grid de módulos */}
      <Row gutter={[18, 18]}>
        {MODULES.map((item) => (
          <Col xs={24} sm={12} lg={8} key={item.href}>
            <Link href={item.href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
              <Card
                hoverable
                style={{
                  height: "100%",
                  background: PALETTE.card,
                  borderColor: PALETTE.border,
                  borderRadius: 14,
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                }}
                styles={{
                  body: {
                    padding: 20,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  },
                }}
              >
                {/* Cabecera con ícono y título */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: item.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </div>
                  {item.badge ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 10,
                        background: PALETTE.cream,
                        color: PALETTE.forest,
                        border: `1px solid ${PALETTE.border}`,
                      }}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    <ArrowRightOutlined style={{ color: PALETTE.olive, fontSize: 16 }} />
                  )}
                </div>

                {/* Título y descripción */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <Text strong style={{ fontSize: 18, color: PALETTE.forest }}>
                    {item.title}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.45 }}>
                    {item.description}
                  </Text>
                </div>

                {/* Pie de acción */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: PALETTE.olive,
                    fontSize: 13,
                    fontWeight: 600,
                    paddingTop: 8,
                    borderTop: `1px solid ${PALETTE.border}`,
                  }}
                >
                  <span>Ir a {item.title}</span>
                  <ArrowRightOutlined style={{ fontSize: 12 }} />
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
