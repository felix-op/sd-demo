"use client";

import { useEffect } from "react";
import { App, DatePicker, Form, Input, Modal } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { usePostAlumno, usePutAlumno } from "@/api/alumnos.api";
import { useErrorMessage } from "@/lib/use-error-message";
import type { Alumno, AlumnoInput } from "@/models/alumno.model";

interface AlumnoFormModalProps {
  open: boolean;
  alumno?: Alumno;
  onClose: () => void;
}

interface FormValues {
  firstName: string;
  lastName: string;
  document: string;
  birthday?: Dayjs;
}

export function AlumnoFormModal({ open, alumno, onClose }: AlumnoFormModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const showError = useErrorMessage();
  const createMutation = usePostAlumno();
  const updateMutation = usePutAlumno();
  const isEdit = Boolean(alumno);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    if (alumno) {
      form.setFieldsValue({
        firstName: alumno.firstName,
        lastName: alumno.lastName,
        document: alumno.document,
        birthday: alumno.birthday ? dayjs(alumno.birthday) : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [open, alumno, form]);

  async function handleSubmit() {
    const values = await form.validateFields();
    const payload: AlumnoInput = {
      firstName: values.firstName,
      lastName: values.lastName,
      document: values.document,
      birthday: values.birthday?.format("YYYY-MM-DD") as string,
    };

    try {
      if (isEdit && alumno) {
        await updateMutation.mutateAsync({ uuid: alumno.uuid, alumno: payload });
        message.success("Alumno actualizado correctamente.");
      } else {
        await createMutation.mutateAsync(payload);
        message.success("Alumno creado correctamente.");
      }
      onClose();
    } catch (error) {
      showError(error);
    }
  }

  return (
    <Modal
      title={isEdit ? "Editar alumno" : "Crear alumno"}
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
        <Form.Item
          label="Nombre"
          name="firstName"
        >
          <Input placeholder="Ej: María" />
        </Form.Item>
        <Form.Item
          label="Apellido"
          name="lastName"
        >
          <Input placeholder="Ej: González" />
        </Form.Item>
        <Form.Item
          label="Documento"
          name="document"
        >
          <Input placeholder="Ej: 40123456" />
        </Form.Item>
        <Form.Item
          label="Fecha de nacimiento"
          name="birthday"
        >
          <DatePicker
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            disabledDate={(current) => current.isAfter(dayjs())}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
