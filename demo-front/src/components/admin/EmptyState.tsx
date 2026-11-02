"use client";

import { Empty, theme } from "antd";

/** Empty con texto más legible que el color tertiary tenue que usa antd por defecto. */
export function EmptyState({ description }: { description: string }) {
  const { token } = theme.useToken();

  return <Empty description={<span style={{ color: token.colorTextSecondary }}>{description}</span>} />;
}
