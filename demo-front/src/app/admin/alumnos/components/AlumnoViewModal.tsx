"use client";

import { Descriptions, Modal } from "antd";
import dayjs from "dayjs";
import type { Alumno } from "@/models/alumno.model";

interface AlumnoViewModalProps {
  open: boolean;
  alumno?: Alumno;
  onClose: () => void;
}

export function AlumnoViewModal({ open, alumno, onClose }: AlumnoViewModalProps) {
  return (
    <Modal title="Detalle del alumno" open={open} onCancel={onClose} footer={null} centered destroyOnHidden>
      {alumno && (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Nombre">{alumno.firstName}</Descriptions.Item>
          <Descriptions.Item label="Apellido">{alumno.lastName}</Descriptions.Item>
          <Descriptions.Item label="Documento">{alumno.document}</Descriptions.Item>
          <Descriptions.Item label="Fecha de nacimiento">
            {alumno.birthday ? dayjs(alumno.birthday).format("DD/MM/YYYY") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="UUID">
            <span style={{ fontFamily: "monospace" }}>{alumno.uuid}</span>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
}
