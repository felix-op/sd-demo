"use client";

import { Avatar, Card, Tag, Typography, type TagProps } from "antd";
import type { ReactNode } from "react";

const { Text } = Typography;

export interface EntityCardField {
  label: string;
  value: ReactNode;
  monospace?: boolean;
}

interface EntityCardProps {
  avatarIcon: ReactNode;
  avatarColor: string;
  title: ReactNode;
  tag?: { label: string; color: TagProps["color"] };
  fields: EntityCardField[];
  actions?: ReactNode;
}

/** Card usada como "fila" en la vista mobile de las pantallas de listado del admin. */
export function EntityCard({ avatarIcon, avatarColor, title, tag, fields, actions }: EntityCardProps) {
  return (
    <Card size="small">
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar icon={avatarIcon} style={{ backgroundColor: avatarColor }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Text strong style={{ fontSize: 16, lineHeight: 1.2 }}>
              {title}
            </Text>
            {tag && (
              <Tag color={tag.color} style={{ width: "fit-content" }}>
                {tag.label}
              </Tag>
            )}
          </div>
        </div>
        {actions}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {fields.map((field) => (
          <div key={field.label} style={field.monospace ? { fontFamily: "monospace", fontSize: 12 } : undefined}>
            <Text type="secondary" style={field.monospace ? { fontFamily: "inherit" } : undefined}>
              {field.label}:{" "}
            </Text>
            {field.value}
          </div>
        ))}
      </div>
    </Card>
  );
}
