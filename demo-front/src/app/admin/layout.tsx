"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Button, Drawer, Grid, Input, Layout, Menu } from "antd";
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  SwapOutlined,
  BarChartOutlined,
  HomeOutlined,
  MenuOutlined,
  SearchOutlined,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { PALETTE } from "@/components/app-theme-provider";
import { AdminHeaderProvider, useAdminHeaderContext } from "@/components/admin/admin-header-context";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const NAV_ITEMS = [
  { key: "/admin", icon: <HomeOutlined style={{ fontSize: 22 }} />, label: <Link href="/admin">Inicio</Link> },
  { key: "/admin/usuarios", icon: <UserOutlined style={{ fontSize: 22 }} />, label: <Link href="/admin/usuarios">Usuarios</Link> },
  { key: "/admin/libros", icon: <BookOutlined style={{ fontSize: 22 }} />, label: <Link href="/admin/libros">Libros</Link> },
  { key: "/admin/alumnos", icon: <TeamOutlined style={{ fontSize: 22 }} />, label: <Link href="/admin/alumnos">Alumnos</Link> },
  { key: "/admin/prestamos", icon: <SwapOutlined style={{ fontSize: 22 }} />, label: <Link href="/admin/prestamos">Préstamos</Link> },
  { key: "/admin/informes", icon: <BarChartOutlined style={{ fontSize: 22 }} />, label: <Link href="/admin/informes">Informes</Link> },
];

function AdminTopBar({ onToggleMenu }: { onToggleMenu: () => void }) {
  const { options, search, setSearch } = useAdminHeaderContext();
  const [searchOpen, setSearchOpen] = useState(false);

  const hasSearch = Boolean(options.searchPlaceholder);
  const hasCreate = Boolean(options.onCreate);

  return (
    <div style={{ background: PALETTE.card, borderBottom: `1px solid ${PALETTE.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
        <Avatar
          shape="circle"
          icon={<MenuOutlined style={{ fontSize: 16 }} />}
          onClick={onToggleMenu}
          style={{ cursor: "pointer", background: PALETTE.cream, color: PALETTE.forest, flexShrink: 0 }}
        />
        <span
          style={{
            fontWeight: 600,
            fontSize: 16,
            flex: "1 1 auto",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {options.title}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {hasSearch && (
            <div className="hidden md:block">
              <Input
                allowClear
                disabled={options.loading}
                prefix={<SearchOutlined />}
                placeholder={options.searchPlaceholder}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ width: 260 }}
              />
            </div>
          )}
          {hasSearch && (
            <div className="md:hidden">
              <Button
                shape="circle"
                disabled={options.loading}
                icon={
                  searchOpen ? (
                    <CloseOutlined style={{ fontSize: 16 }} />
                  ) : (
                    <SearchOutlined style={{ fontSize: 16 }} />
                  )
                }
                onClick={() => setSearchOpen((prev) => !prev)}
              />
            </div>
          )}
          {hasCreate && (
            <Button
              type="primary"
              disabled={options.loading}
              icon={<PlusOutlined style={{ fontSize: 16 }} />}
              onClick={options.onCreate}
            >
              <span className="hidden md:inline">{options.createLabel}</span>
            </Button>
          )}
        </div>
      </div>
      {hasSearch && searchOpen && (
        <div className="md:hidden" style={{ padding: "0 16px 12px" }}>
          <Input
            allowClear
            autoFocus
            disabled={options.loading}
            prefix={<SearchOutlined />}
            placeholder={options.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      )}
    </div>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { options } = useAdminHeaderContext();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleToggleMenu() {
    if (isMobile) {
      setDrawerOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  }

  const menu = (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={[pathname]}
      items={NAV_ITEMS}
      style={{ borderInlineEnd: "none", padding: "12px 0" }}
      onClick={() => setDrawerOpen(false)}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminTopBar key={options.title} onToggleMenu={handleToggleMenu} />
      <Layout>
        <Sider className="!hidden md:!block" width={240} collapsed={collapsed} collapsedWidth={72} theme="dark">
          {menu}
        </Sider>
        <Content className="p-4 md:p-8">{children}</Content>
      </Layout>
      <Drawer
        title="Backoffice"
        placement="left"
        open={isMobile && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size={240}
        styles={{ body: { padding: 0, background: PALETTE.forest }, header: { background: PALETTE.forest, color: PALETTE.cream } }}
      >
        {menu}
      </Drawer>
    </Layout>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminHeaderProvider>
      <AdminShell>{children}</AdminShell>
    </AdminHeaderProvider>
  );
}
