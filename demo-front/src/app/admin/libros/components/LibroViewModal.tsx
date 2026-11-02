"use client";

import { Descriptions, Modal, Tag } from "antd";
import dayjs from "dayjs";
import type { Libro } from "@/models/libro.model";

interface LibroViewModalProps {
  open: boolean;
  libro?: Libro;
  onClose: () => void;
}

export function LibroViewModal({ open, libro, onClose }: LibroViewModalProps) {
  return (
    <Modal title="Detalle del libro" open={open} onCancel={onClose} footer={null} centered destroyOnHidden>
      {libro && (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Título">{libro.title}</Descriptions.Item>
          <Descriptions.Item label="Autor">{libro.author}</Descriptions.Item>
          <Descriptions.Item label="UUID">
            <span style={{ fontFamily: "monospace" }}>{libro.uuid}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Número de páginas">{libro.numPages ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="Fecha de publicación">
            {libro.pubDate ? dayjs(libro.pubDate).format("DD/MM/YYYY") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Descripción">{libro.description || "-"}</Descriptions.Item>
          <Descriptions.Item label="Prestado">
            <Tag color={libro.rented ? "red" : "green"}>{libro.rented ? "Sí" : "No"}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Alumnos con préstamo">
            {libro.alumnosConPrestamo && libro.alumnosConPrestamo.length > 0
              ? libro.alumnosConPrestamo
                  .map((alumno) => `${alumno.firstName} ${alumno.lastName} (${alumno.document})`)
                  .join(", ")
              : "Ninguno"}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
}
