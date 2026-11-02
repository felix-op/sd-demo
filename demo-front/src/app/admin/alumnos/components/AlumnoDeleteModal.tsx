"use client";

import { App, Modal, Typography } from "antd";
import { useDeleteAlumno } from "@/api/alumnos.api";
import { useErrorMessage } from "@/lib/use-error-message";
import type { Alumno } from "@/models/alumno.model";

const { Text } = Typography;

interface AlumnoDeleteModalProps {
  open: boolean;
  alumno?: Alumno;
  onClose: () => void;
}

export function AlumnoDeleteModal({ open, alumno, onClose }: AlumnoDeleteModalProps) {
  const { message } = App.useApp();
  const showError = useErrorMessage();
  const deleteMutation = useDeleteAlumno();

  async function handleConfirm() {
    if (!alumno) return;
    try {
      await deleteMutation.mutateAsync(alumno.uuid);
      message.success("Alumno eliminado correctamente.");
      onClose();
    } catch (error) {
      showError(error);
    }
  }

  return (
    <Modal
      title="Eliminar alumno"
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
      {alumno && (
        <Text>
          ¿Seguro que querés eliminar al alumno{" "}
          <Text strong>
            {alumno.firstName} {alumno.lastName}
          </Text>{" "}
          (DNI {alumno.document})? Esta acción no se puede deshacer.
        </Text>
      )}
    </Modal>
  );
}
