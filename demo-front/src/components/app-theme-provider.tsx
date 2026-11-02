"use client";

import { ConfigProvider } from "antd";

export const PALETTE = {
  forest: "#2f5233",
  forestDark: "#264229",
  olive: "#6b8f4e",
  cream: "#f3ecd9",
  card: "#faf6e8",
  border: "#e2d9bf",
  text: "#3d3a2e",
};

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: PALETTE.olive,
          colorInfo: "#4a7fa7",
          colorSuccess: "#2a9d8f",
          colorBgLayout: PALETTE.cream,
          colorBgContainer: PALETTE.card,
          colorBorder: PALETTE.border,
          colorBorderSecondary: PALETTE.border,
          colorText: PALETTE.text,
          colorTextHeading: PALETTE.forest,
          borderRadius: 12,
        },
        components: {
          Layout: {
            siderBg: PALETTE.forest,
            bodyBg: PALETTE.cream,
            headerBg: PALETTE.card,
          },
          Menu: {
            darkItemBg: PALETTE.forest,
            darkSubMenuItemBg: PALETTE.forestDark,
            darkItemColor: "#e9efdc",
            darkItemHoverBg: "rgba(243,236,217,0.12)",
            darkItemHoverColor: "#ffffff",
            darkItemSelectedBg: PALETTE.cream,
            darkItemSelectedColor: PALETTE.forest,
            itemHeight: 48,
            itemBorderRadius: 14,
            fontSize: 17,
            iconSize: 22,
            itemMarginInline: 12,
          },
          Dropdown: {
            controlItemBgHover: "#ebe3c8",
            controlItemBgActive: "#e3dabb",
          },
          Table: {
            headerBg: "#e8e2c8",
            headerColor: PALETTE.forest,
            rowHoverBg: "#f1ebd3",
          },
          Card: { colorBgContainer: PALETTE.card },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
