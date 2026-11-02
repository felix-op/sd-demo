"use client";

import { App, Modal, Typography } from "antd";
import { useDeleteUsuario } from "@/api/usuarios.api";
import { useErrorMessage } from "@/lib/use-error-message";
import type { Usuario } from "@/models/usuario.model";

const { Text } = Typography;

interface UsuarioDeleteModalProps {
  open: boolean;
  usuario?: Usuario;
  onClose: () => void;
}

export function UsuarioDeleteModal({ open, usuario, onClose }: UsuarioDeleteModalProps) {
  const { message } = App.useApp();
  const showError = useErrorMessage();
  const deleteMutation = useDeleteUsuario();

  async function handleConfirm() {
    if (!usuario) return;
    try {
      await deleteMutation.mutateAsync(usuario.uuid);
      message.success("Usuario eliminado correctamente.");
      onClose();
    } catch (error) {
      showError(error);
    }
  }

  return (
    <Modal
      title="Eliminar usuario"
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      confirmLoading={deleteMutation.isPending}
      okText="Eliminar"
      okButtonProps={{ danger: true }}
      cancelText="Cancelar"
      centered
      destroyOnHidden
    >
      {usuario && (
        <Text>
          ¿Seguro que querés eliminar al usuario <Text strong>{usuario.nombre}</Text> (documento{" "}
          {usuario.documento})? Esta acción no se puede deshacer.
        </Text>
      )}
    </Modal>
  );
}
