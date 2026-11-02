"use client";

import { Table, theme, type TableProps } from "antd";
import type { AnyObject } from "antd/es/_util/type";

/** Table con borde exterior + separadores entre filas, consistente en todas las pantallas del admin. */
export function BorderedTable<RecordType extends AnyObject = AnyObject>(props: TableProps<RecordType>) {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        border: `2px solid ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
        overflow: "hidden",
      }}
    >
      <Table<RecordType> {...props} />
    </div>
  );
}
