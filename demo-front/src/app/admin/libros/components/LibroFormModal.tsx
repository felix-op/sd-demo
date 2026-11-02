"use client";

import { useEffect } from "react";
import { App, DatePicker, Form, Input, InputNumber, Modal } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { usePostLibro, usePutLibro } from "@/api/libros.api";
import { getErrorInfo } from "@/lib/request";
import type { Libro, LibroInput } from "@/models/libro.model";

interface LibroFormModalProps {
  open: boolean;
  libro?: Libro;
  onClose: () => void;
}

interface FormValues {
  title: string;
  author: string;
  numPages?: number;
  pubDate?: Dayjs;
  description?: string;
}

export function LibroFormModal({ open, libro, onClose }: LibroFormModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const createMutation = usePostLibro();
  const updateMutation = usePutLibro();
  const isEdit = Boolean(libro);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    if (libro) {
      form.setFieldsValue({
        title: libro.title,
        author: libro.author,
        numPages: libro.numPages ?? undefined,
        pubDate: libro.pubDate ? dayjs(libro.pubDate) : undefined,
        description: libro.description ?? undefined,
      });
    } else {
      form.resetFields();
    }
  }, [open, libro, form]);

  async function handleSubmit() {
    const values = await form.validateFields();
    const payload: LibroInput = {
      title: values.title,
      author: values.author,
      numPages: values.numPages,
      pubDate: values.pubDate ? values.pubDate.format("YYYY-MM-DD") : undefined,
      description: values.description,
    };

    try {
      if (isEdit && libro) {
        await updateMutation.mutateAsync({ uuid: libro.uuid, libro: payload });
        message.success("Libro actualizado correctamente.");
      } else {
        await createMutation.mutateAsync(payload);
        message.success("Libro creado correctamente.");
      }
      onClose();
    } catch (error) {
      const { title, detail } = getErrorInfo(error);
      message.error(detail ? `${title}: ${detail}` : title);
    }
  }

  return (
    <Modal
      title={isEdit ? "Editar libro" : "Crear libro"}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting}
      okText={isEdit ? "Guardar cambios" : "Crear"}
      cancelText="Cancelar"
      centered
      destroyOnHidden
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          label="Título"
          name="title"
          rules={[{ required: true, message: "El título es obligatorio." }]}
        >
          <Input placeholder="Ej: Cien años de soledad" />
        </Form.Item>
        <Form.Item
          label="Autor"
          name="author"
          rules={[{ required: true, message: "El autor es obligatorio." }]}
        >
          <Input placeholder="Ej: Gabriel García Márquez" />
        </Form.Item>
        <Form.Item label="Número de páginas" name="numPages">
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Fecha de publicación" name="pubDate">
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item label="Descripción" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
