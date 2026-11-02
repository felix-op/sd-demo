"use client";

import { Descriptions, Modal } from "antd";
import dayjs from "dayjs";
import type { Prestamo } from "@/models/prestamo.model";
import { PrestamoEstadoTag } from "./PrestamoEstadoTag";

interface PrestamoViewModalProps {
  open: boolean;
  prestamo?: Prestamo;
  onClose: () => void;
}

const fmt = (date: string | null | undefined) => (date ? dayjs(date).format("DD/MM/YYYY") : "-");

export function PrestamoViewModal({ open, prestamo, onClose }: PrestamoViewModalProps) {
  return (
    <Modal title="Detalle del préstamo" open={open} onCancel={onClose} footer={null} centered destroyOnHidden>
      {prestamo && (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Libro">{prestamo.libro?.title ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="Alumno">
            {prestamo.alumno
              ? `${prestamo.alumno.firstName} ${prestamo.alumno.lastName} (${prestamo.alumno.document})`
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Atendido por">{prestamo.atendidoPor?.nombre ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="Fecha de inicio">{fmt(prestamo.fechaInicio)}</Descriptions.Item>
          <Descriptions.Item label="Fecha de vencimiento">{fmt(prestamo.fechaVencimiento)}</Descriptions.Item>
          <Descriptions.Item label="Fecha de devolución">{fmt(prestamo.fechaDevolucion)}</Descriptions.Item>
          <Descriptions.Item label="Estado">
            <PrestamoEstadoTag prestamo={prestamo} />
          </Descriptions.Item>
          <Descriptions.Item label="UUID">
            <span style={{ fontFamily: "monospace" }}>{prestamo.uuid}</span>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
}
