"use client";

import { useEffect } from "react";
import { App, Form, Input, Modal } from "antd";
import { usePostUsuario, usePutUsuario } from "@/api/usuarios.api";
import { useErrorMessage } from "@/lib/use-error-message";
import type { Usuario, UsuarioInput } from "@/models/usuario.model";

interface UsuarioFormModalProps {
  open: boolean;
  usuario?: Usuario;
  onClose: () => void;
}

interface FormValues {
  nombre: string;
  documento: string;
}

export function UsuarioFormModal({ open, usuario, onClose }: UsuarioFormModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const showError = useErrorMessage();
  const createMutation = usePostUsuario();
  const updateMutation = usePutUsuario();
  const isEdit = Boolean(usuario);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    if (usuario) {
      form.setFieldsValue({
        nombre: usuario.nombre,
        documento: usuario.documento,
      });
    } else {
      form.resetFields();
    }
  }, [open, usuario, form]);

  async function handleSubmit() {
    const values = await form.validateFields();
    const payload: UsuarioInput = {
      nombre: values.nombre,
      documento: values.documento,
    };

    try {
      if (isEdit && usuario) {
        await updateMutation.mutateAsync({ uuid: usuario.uuid, usuario: payload });
        message.success("Usuario actualizado correctamente.");
      } else {
        await createMutation.mutateAsync(payload);
        message.success("Usuario creado correctamente.");
      }
      onClose();
    } catch (error) {
      showError(error);
    }
  }

  return (
    <Modal
      title={isEdit ? "Editar usuario" : "Crear usuario"}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting}
      okText={isEdit ? "Guardar cambios" : "Crear"}
      cancelText="Cancelar"
      centered
      destroyOnHidden
    >
      <Form form={form} layout="vertical" validateTrigger={["onChange", "onBlur"]}>
        <Form.Item label="Nombre" name="nombre">
          <Input placeholder="Ej: María González" />
        </Form.Item>
        <Form.Item label="Documento" name="documento">
          <Input placeholder="Ej: 40123456" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
