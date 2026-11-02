"use client";

import { useEffect } from "react";
import { App, DatePicker, Form, Modal, Select } from "antd";
import type { Dayjs } from "dayjs";
import { useGetAlumnos } from "@/api/alumnos.api";
import { useGetLibros } from "@/api/libros.api";
import { usePostPrestamo } from "@/api/prestamos.api";
import { useGetUsuarios } from "@/api/usuarios.api";
import { useErrorMessage } from "@/lib/use-error-message";
import type { PrestamoCreate } from "@/models/prestamo.model";

interface PrestamoFormModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  alumno?: string;
  libro?: string;
  atendidoPor?: string;
  fechaInicio?: Dayjs;
}

export function PrestamoFormModal({ open, onClose }: PrestamoFormModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const showError = useErrorMessage();
  const createMutation = usePostPrestamo();
  const alumnos = useGetAlumnos();
  const libros = useGetLibros();
  const usuarios = useGetUsuarios();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  async function handleSubmit() {
    const values = form.getFieldsValue();
    // Sin validación en el front a propósito: el backend responde qué falta.
    const payload = {
      alumno: values.alumno,
      libro: values.libro,
      atendidoPor: values.atendidoPor,
      fechaInicio: values.fechaInicio?.format("YYYY-MM-DD"),
    } as PrestamoCreate;

    try {
      await createMutation.mutateAsync(payload);
      message.success("Préstamo registrado correctamente.");
      onClose();
    } catch (error) {
      showError(error);
    }
  }

  return (
    <Modal
      title="Registrar préstamo"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending}
      okText="Registrar"
      cancelText="Cancelar"
      centered
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Alumno" name="alumno">
          <Select
            showSearch={{ optionFilterProp: "label" }}
            allowClear
            placeholder="Seleccionar alumno"
            loading={alumnos.isLoading}
            options={(alumnos.data ?? []).map((a) => ({
              value: a.uuid,
              label: `${a.lastName}, ${a.firstName} (${a.document})`,
            }))}
          />
        </Form.Item>
        <Form.Item label="Libro" name="libro">
          <Select
            showSearch={{ optionFilterProp: "label" }}
            allowClear
            placeholder="Seleccionar libro"
            loading={libros.isLoading}
            options={(libros.data ?? []).map((l) => ({
              value: l.uuid,
              label: `${l.title} — ${l.author}${l.rented ? " (prestado)" : ""}`,
            }))}
          />
        </Form.Item>
        <Form.Item label="Atendido por" name="atendidoPor">
          <Select
            showSearch={{ optionFilterProp: "label" }}
            allowClear
            placeholder="Seleccionar usuario"
            loading={usuarios.isLoading}
            options={(usuarios.data ?? []).map((u) => ({ value: u.uuid, label: u.nombre }))}
          />
        </Form.Item>
        <Form.Item label="Fecha de inicio" name="fechaInicio">
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
