"use client";

import { Tag } from "antd";
import dayjs from "dayjs";
import type { Prestamo } from "@/models/prestamo.model";

export function getPrestamoEstado(prestamo: Prestamo): { label: string; color: string } {
  if (prestamo.fechaDevolucion) return { label: "Devuelto", color: "green" };
  if (prestamo.fechaVencimiento && dayjs(prestamo.fechaVencimiento).isBefore(dayjs(), "day")) {
    return { label: "Vencido", color: "red" };
  }
  return { label: "En curso", color: "gold" };
}

export function PrestamoEstadoTag({ prestamo }: { prestamo: Prestamo }) {
  const { label, color } = getPrestamoEstado(prestamo);
  return <Tag color={color}>{label}</Tag>;
}
