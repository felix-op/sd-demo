"use client";

import { Descriptions, Modal } from "antd";
import type { Usuario } from "@/models/usuario.model";

interface UsuarioViewModalProps {
  open: boolean;
  usuario?: Usuario;
  onClose: () => void;
}

export function UsuarioViewModal({ open, usuario, onClose }: UsuarioViewModalProps) {
  return (
    <Modal title="Detalle del usuario" open={open} onCancel={onClose} footer={null} centered destroyOnHidden>
      {usuario && (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Nombre">{usuario.nombre}</Descriptions.Item>
          <Descriptions.Item label="Documento">{usuario.documento}</Descriptions.Item>
          <Descriptions.Item label="UUID">
            <span style={{ fontFamily: "monospace" }}>{usuario.uuid}</span>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
}
