"use client";

import { App, Modal, Typography } from "antd";
import { useDeleteLibro } from "@/api/libros.api";
import { useErrorMessage } from "@/lib/use-error-message";
import type { Libro } from "@/models/libro.model";

const { Text } = Typography;

interface LibroDeleteModalProps {
  open: boolean;
  libro?: Libro;
  onClose: () => void;
}

export function LibroDeleteModal({ open, libro, onClose }: LibroDeleteModalProps) {
  const { message } = App.useApp();
  const showError = useErrorMessage();
  const deleteMutation = useDeleteLibro();

  async function handleConfirm() {
    if (!libro) return;
    try {
      await deleteMutation.mutateAsync(libro.uuid);
      message.success("Libro eliminado correctamente.");
      onClose();
    } catch (error) {
      showError(error);
    }
  }

  return (
    <Modal
      title="Eliminar libro"
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
      {libro && (
        <Text>
          ¿Seguro que querés eliminar el libro <Text strong>&quot;{libro.title}&quot;</Text> de{" "}
          {libro.author}? Esta acción no se puede deshacer.
        </Text>
      )}
    </Modal>
  );
}
