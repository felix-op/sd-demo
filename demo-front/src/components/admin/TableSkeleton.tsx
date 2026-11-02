"use client";

import { Skeleton, type TableColumnsType } from "antd";
import { BorderedTable } from "./BorderedTable";

export interface TableSkeletonColumn {
  title: string;
  width?: number;
  variant?: "text" | "avatar";
}

interface TableSkeletonProps {
  columns: TableSkeletonColumn[];
  rows?: number;
}

/** Skeleton con la misma forma (headers + columnas) que la tabla real, para el primer load. */
export function TableSkeleton({ columns, rows = 6 }: TableSkeletonProps) {
  const dataSource = Array.from({ length: rows }, (_, index) => ({ key: `skeleton-${index}` }));

  const tableColumns: TableColumnsType<{ key: string }> = columns.map((column) => ({
    title: column.title,
    key: column.title,
    width: column.width,
    render: () =>
      column.variant === "avatar" ? (
        <Skeleton.Avatar active size="small" shape="circle" />
      ) : (
        <Skeleton.Input active size="small" style={{ width: "80%" }} />
      ),
  }));

  return (
    <BorderedTable<{ key: string }>
      rowKey="key"
      columns={tableColumns}
      dataSource={dataSource}
      pagination={false}
      size="small"
    />
  );
}
