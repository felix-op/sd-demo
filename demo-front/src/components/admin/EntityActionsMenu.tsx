"use client";

import { Button, Dropdown, theme, type MenuProps } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined } from "@ant-design/icons";

interface EntityActionsMenuProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EntityActionsMenu({ onView, onEdit, onDelete }: EntityActionsMenuProps) {
  const { token } = theme.useToken();

  const iconStyle = { fontSize: 16 };

  const items: MenuProps["items"] = [
    onView
      ? {
          key: "view",
          label: "Visualizar",
          icon: <EyeOutlined style={{ ...iconStyle, color: token.colorInfo }} />,
        }
      : null,
    onEdit
      ? {
          key: "edit",
          label: "Editar",
          icon: <EditOutlined style={{ ...iconStyle, color: token.colorSuccess }} />,
        }
      : null,
    onDelete
      ? {
          key: "delete",
          label: "Eliminar",
          icon: <DeleteOutlined style={{ ...iconStyle, color: token.colorError }} />,
          danger: true,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  function handleMenuClick({ key }: { key: string }) {
    if (key === "view") onView?.();
    else if (key === "edit") onEdit?.();
    else if (key === "delete") onDelete?.();
  }

  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={["click"]}>
      <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} onClick={(event) => event.stopPropagation()} />
    </Dropdown>
  );
}
