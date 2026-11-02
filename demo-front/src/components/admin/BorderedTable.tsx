"use client";

import { Table, theme, type TableProps } from "antd";
import type { AnyObject } from "antd/es/_util/type";

/** Table con borde exterior + separadores entre filas, consistente en todas las pantallas del admin. */
export function BorderedTable<RecordType extends AnyObject = AnyObject>(props: TableProps<RecordType>) {
  const { token } = theme.useToken();

  return (
    <div
      className="bordered-table"
      style={{
        border: `2px solid ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
        overflow: "hidden",
      }}
    >
      <style>{`
        .bordered-table .ant-table-pagination.ant-pagination {
          padding-inline-end: 16px;
        }
        .bordered-table .ant-pagination-options .ant-select,
        .bordered-table .ant-pagination-options .ant-select * {
          cursor: pointer !important;
        }
        .bordered-table .ant-pagination-options .ant-select input {
          caret-color: transparent;
        }
      `}</style>
      <Table<RecordType> {...props} />
    </div>
  );
}
