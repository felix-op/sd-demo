"use client";

import { Card, Skeleton } from "antd";

/** Skeleton con forma de cards, para la vista mobile mientras carga la primera página. */
export function CardListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: rows }, (_, index) => (
        <Card key={`skeleton-${index}`} size="small">
          <div style={{ display: "flex", gap: 12 }}>
            <Skeleton.Avatar active />
            <div style={{ flex: 1 }}>
              <Skeleton active title={false} paragraph={{ rows: 3 }} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
