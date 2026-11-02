"use client";

import { ConfigProvider, theme } from "antd";

/**
 * El header de las tablas usa los mismos tokens que el ítem activo del Menu
 * (colorPrimaryBg / colorPrimary) para que ambos queden visualmente consistentes.
 */
export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { token } = theme.useToken();

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: token.colorPrimaryBg,
            headerColor: token.colorPrimary,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
