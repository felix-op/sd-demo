"use client";

import { useState } from "react";
import { App, DatePicker, Modal, Typography } from "antd";
import type { Dayjs } from "dayjs";
import { usePostDevolucion } from "@/api/prestamos.api";
import { useErrorMessage } from "@/lib/use-error-message";
import type { Prestamo } from "@/models/prestamo.model";

const { Text } = Typography;

interface PrestamoDevolucionModalProps {
  open: boolean;
  prestamo?: Prestamo;
  onClose: () => void;
}

export function PrestamoDevolucionModal({ open, prestamo, onClose }: PrestamoDevolucionModalProps) {
  const { message } = App.useApp();
  const showError = useErrorMessage();
  const mutation = usePostDevolucion();
  const [fecha, setFecha] = useState<Dayjs | null>(null);

  async function handleConfirm() {
    if (!prestamo) return;
    try {
      await mutation.mutateAsync({ uuid: prestamo.uuid, fecha: fecha?.format("YYYY-MM-DD") });
      message.success("Devolución registrada correctamente.");
      onClose();
    } catch (error) {
      showError(error);
    }
  }

  return (
    <Modal
      title="Registrar devolución"
      open={open}
      onCancel={onClose}
      afterClose={() => setFecha(null)}
      onOk={handleConfirm}
      confirmLoading={mutation.isPending}
      okText="Registrar devolución"
      cancelText="Cancelar"
      centered
      destroyOnHidden
    >
      {prestamo && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Text>
            Devolución de <Text strong>&quot;{prestamo.libro?.title}&quot;</Text> por{" "}
            {prestamo.alumno?.firstName} {prestamo.alumno?.lastName}.
          </Text>
          <div>
            <div style={{ marginBottom: 4 }}>Fecha de devolución (opcional, por defecto hoy)</div>
            <DatePicker value={fecha} onChange={setFecha} style={{ width: "100%" }} format="DD/MM/YYYY" />
          </div>
        </div>
      )}
    </Modal>
  );
}
