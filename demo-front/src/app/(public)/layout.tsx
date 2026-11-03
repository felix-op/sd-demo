"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu } from "antd";
import { BookOutlined, SettingOutlined } from "@ant-design/icons";
import { PALETTE } from "@/components/app-theme-provider";

const { Header, Content } = Layout;

const NAV_ITEMS = [
  {
    key: "/",
    icon: <BookOutlined />,
    label: <Link href="/">Catálogo</Link>,
  },
  {
    key: "/admin",
    icon: <SettingOutlined />,
    label: <Link href="/admin">Backoffice</Link>,
  },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const selectedKey = pathname.startsWith("/admin") ? "/admin" : "/";

  return (
    <Layout style={{ minHeight: "100vh", background: PALETTE.cream }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "0 24px",
          background: PALETTE.forest,
          borderBottom: `1px solid ${PALETTE.forestDark}`,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: PALETTE.cream,
            fontWeight: 700,
            fontSize: 18,
            textDecoration: "none",
            letterSpacing: "-0.01em",
          }}
        >
          <BookOutlined style={{ fontSize: 20 }} />
          <span>Biblioteca</span>
        </Link>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={NAV_ITEMS}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            borderBottom: "none",
          }}
        />
      </Header>
      <Content
        style={{
          padding: "32px 16px 64px",
          maxWidth: 1040,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {children}
      </Content>
    </Layout>
  );
}
