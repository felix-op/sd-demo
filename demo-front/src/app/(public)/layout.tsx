"use client";

import Link from "next/link";
import { Layout, Menu } from "antd";

const { Header, Content } = Layout;

const NAV_ITEMS = [
  { key: "/catalogo", label: <Link href="/catalogo">Catálogo</Link> },
  { key: "/admin", label: <Link href="/admin">Backoffice</Link> },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <Link href="/" style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>
          Biblioteca
        </Link>
        <Menu theme="dark" mode="horizontal" items={NAV_ITEMS} style={{ flex: 1, minWidth: 0 }} />
      </Header>
      <Content style={{ padding: "40px 48px", maxWidth: 960, margin: "0 auto", width: "100%" }}>
        {children}
      </Content>
    </Layout>
  );
}
