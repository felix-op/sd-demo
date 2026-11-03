"use client";

import { useState } from "react";
import { Alert, Button, DatePicker, Radio, Select, Spin, type TableColumnsType, Tag } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { useGetInformeAtenciones, useGetInformeNoDevueltos } from "@/api/informes.api";
import { useGetUsuarios } from "@/api/usuarios.api";
import { getErrorInfo } from "@/lib/request";
import { useAdminHeader } from "@/components/admin/admin-header-context";
import { BorderedTable } from "@/components/admin/BorderedTable";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import type { InformeAtencion, InformeNoDevuelto } from "@/models/informe.model";

type TipoInforme = "atenciones" | "no-devueltos";

interface Filters {
  rango?: [Dayjs | null, Dayjs | null] | null;
  atendidoPor?: string;
  estado?: string;
}

const fmt = (date: string | null | undefined) => (date ? dayjs(date).format("DD/MM/YYYY") : "-");
const alumnoName = (a: { firstName: string; lastName: string } | null | undefined) =>
  a ? `${a.lastName}, ${a.firstName}` : "-";

/* ---------- Columnas ---------- */

const columnsAtenciones: TableColumnsType<InformeAtencion> = [
  { title: "Libro", dataIndex: "libro", key: "libro" },
  { title: "Autor", dataIndex: "autor", key: "autor" },
  { title: "Alumno", key: "alumno", render: (_, r) => alumnoName(r.alumno) },
  { title: "Doc. Alumno", key: "doc", render: (_, r) => r.alumno?.document ?? "-" },
  { title: "Fecha atención", dataIndex: "fechaAtencion", key: "fechaAtencion", width: 130, render: fmt },
];

const columnsNoDevueltos: TableColumnsType<InformeNoDevuelto> = [
  { title: "Alumno", key: "alumno", render: (_, r) => alumnoName(r.alumno) },
  { title: "Doc. Alumno", key: "doc", render: (_, r) => r.alumno?.document ?? "-" },
  { title: "Libro", key: "libro", render: (_, r) => r.libro?.title ?? "-" },
  { title: "Autor", dataIndex: "autor", key: "autor" },
  { title: "Préstamo", dataIndex: "fechaPrestamo", key: "fechaPrestamo", width: 110, render: fmt },
  { title: "Vencimiento", dataIndex: "fechaVencimiento", key: "fechaVencimiento", width: 120, render: fmt },
  {
    title: "Retraso",
    dataIndex: "diasRetraso",
    key: "diasRetraso",
    width: 100,
    render: (dias: number) => (
      <Tag color={dias > 30 ? "red" : dias > 7 ? "orange" : "gold"}>{dias} días</Tag>
    ),
  },
];

/* ---------- PDF via print ---------- */

function buildPrintableHtml(title: string, subtitle: string, headers: string[], rows: string[][]) {
  const ths = headers.map((h) => `<th style="border:1px solid #999;padding:6px 10px;background:#e8e2c8;text-align:left;font-size:12px">${h}</th>`).join("");
  const trs = rows
    .map(
      (cells) =>
        `<tr>${cells.map((c) => `<td style="border:1px solid #ccc;padding:5px 10px;font-size:11px">${c}</td>`).join("")}</tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  @page { size: landscape; margin: 15mm; }
  body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
  h1 { font-size: 18px; color: #2f5233; margin-bottom: 4px; }
  p.subtitle { font-size: 12px; color: #666; margin: 0 0 14px; }
  table { border-collapse: collapse; width: 100%; }
</style>
</head><body>
<h1>${title}</h1>
<p class="subtitle">${subtitle} — Generado el ${dayjs().format("DD/MM/YYYY HH:mm")}</p>
<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>
</body></html>`;
}

function printPdf(html: string) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();

  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
}

/* ---------- Componente ---------- */

export default function InformesPage() {
  const [tipo, setTipo] = useState<TipoInforme>("atenciones");
  const [filters, setFilters] = useState<Filters>({});

  const usuarios = useGetUsuarios();

  const fechaInicio = filters.rango?.[0]?.format("YYYY-MM-DD");
  const fechaFin = filters.rango?.[1]?.format("YYYY-MM-DD");

  const atenciones = useGetInformeAtenciones({
    atendidoPor: tipo === "atenciones" ? filters.atendidoPor : undefined,
    fechaInicio: tipo === "atenciones" ? fechaInicio : undefined,
    fechaFin: tipo === "atenciones" ? fechaFin : undefined,
  });

  const noDevueltos = useGetInformeNoDevueltos({
    estado: tipo === "no-devueltos" ? filters.estado : undefined,
    fechaInicio: tipo === "no-devueltos" ? fechaInicio : undefined,
    fechaFin: tipo === "no-devueltos" ? fechaFin : undefined,
  });

  const current = tipo === "atenciones" ? atenciones : noDevueltos;
  const isLoading = current.isLoading;
  const isError = current.isError;
  const errorInfo = isError ? getErrorInfo(current.error) : null;

  useAdminHeader({ title: "Informes", loading: isLoading });

  function updateFilters(next: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  function handleExportPdf() {
    if (tipo === "atenciones") {
      const data = atenciones.data ?? [];
      if (data.length === 0) return;
      const headers = ["Libro", "Autor", "Alumno", "Doc. Alumno", "Fecha atención"];
      const rows = data.map((r) => [
        r.libro ?? "-",
        r.autor ?? "-",
        alumnoName(r.alumno),
        r.alumno?.document ?? "-",
        fmt(r.fechaAtencion),
      ]);
      const subtitle = filters.atendidoPor
        ? `Filtrado por atendido por: ${usuarios.data?.find((u) => u.uuid === filters.atendidoPor)?.nombre ?? filters.atendidoPor}`
        : "Sin filtros de usuario";
      printPdf(buildPrintableHtml("Informe de Atenciones", subtitle, headers, rows));
    } else {
      const data = noDevueltos.data ?? [];
      if (data.length === 0) return;
      const headers = ["Alumno", "Doc. Alumno", "Libro", "Autor", "Préstamo", "Vencimiento", "Días de retraso"];
      const rows = data.map((r) => [
        alumnoName(r.alumno),
        r.alumno?.document ?? "-",
        r.libro?.title ?? "-",
        r.autor ?? "-",
        fmt(r.fechaPrestamo),
        fmt(r.fechaVencimiento),
        String(r.diasRetraso),
      ]);
      const estadoLabel =
        filters.estado === "vencidos" ? "Solo vencidos" : filters.estado === "vigentes" ? "Solo vigentes" : "Todos";
      printPdf(buildPrintableHtml("Informe de Libros No Devueltos", `Estado: ${estadoLabel}`, headers, rows));
    }
  }

  const dataAtenciones = atenciones.data ?? [];
  const dataNoDevueltos = noDevueltos.data ?? [];

  const skeletonColumnsAtenciones = [
    { title: "Libro" },
    { title: "Autor" },
    { title: "Alumno" },
    { title: "Doc. Alumno" },
    { title: "Fecha atención", width: 130 },
  ];

  const skeletonColumnsNoDevueltos = [
    { title: "Alumno" },
    { title: "Doc. Alumno" },
    { title: "Libro" },
    { title: "Autor" },
    { title: "Préstamo", width: 110 },
    { title: "Vencimiento", width: 120 },
    { title: "Retraso", width: 100 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Selector de tipo */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <Radio.Group
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value);
            setFilters({});
          }}
          buttonStyle="solid"
        >
          <Radio.Button value="atenciones">Atenciones</Radio.Button>
          <Radio.Button value="no-devueltos">No devueltos</Radio.Button>
        </Radio.Group>
        <div style={{ flex: 1 }} />
        <Button
          icon={<FilePdfOutlined />}
          onClick={handleExportPdf}
          disabled={isLoading || (tipo === "atenciones" ? dataAtenciones.length === 0 : dataNoDevueltos.length === 0)}
        >
          Exportar PDF
        </Button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {tipo === "atenciones" && (
          <Select
            allowClear
            showSearch={{ optionFilterProp: "label" }}
            placeholder="Filtrar por atendido por"
            loading={usuarios.isLoading}
            value={filters.atendidoPor}
            onChange={(value) => updateFilters({ atendidoPor: value })}
            options={(usuarios.data ?? []).map((u) => ({ value: u.uuid, label: u.nombre }))}
            style={{ minWidth: 220, flex: "1 1 220px" }}
          />
        )}
        {tipo === "no-devueltos" && (
          <Select
            allowClear
            placeholder="Estado"
            value={filters.estado}
            onChange={(value) => updateFilters({ estado: value })}
            options={[
              { value: "ambos", label: "Todos" },
              { value: "vencidos", label: "Solo vencidos" },
              { value: "vigentes", label: "Solo vigentes" },
            ]}
            style={{ minWidth: 160, flex: "1 1 160px" }}
          />
        )}
        <DatePicker.RangePicker
          format="DD/MM/YYYY"
          placeholder={["Desde", "Hasta"]}
          value={filters.rango ?? null}
          onChange={(rango) => updateFilters({ rango })}
          style={{ flex: "1 1 260px" }}
        />
      </div>

      {/* Errores */}
      {errorInfo && (
        <Alert
          type="error"
          showIcon
          title={errorInfo.title}
          description={errorInfo.detail}
          action={
            <Button size="small" onClick={() => current.refetch()}>
              Reintentar
            </Button>
          }
        />
      )}

      {/* Tabla de atenciones */}
      {tipo === "atenciones" && (
        <Spin spinning={atenciones.isFetching && !atenciones.isLoading}>
          {isLoading ? (
            <TableSkeleton columns={skeletonColumnsAtenciones} rows={8} />
          ) : dataAtenciones.length === 0 ? (
            <EmptyState description="No hay atenciones para los filtros seleccionados." />
          ) : (
            <BorderedTable<InformeAtencion>
              rowKey={(r, i) => `${r.libro}-${r.fechaAtencion}-${i}`}
              columns={columnsAtenciones}
              dataSource={dataAtenciones}
              size="small"
              scroll={{ x: "max-content" }}
              pagination={{ pageSize: 50, showSizeChanger: true, pageSizeOptions: ["20", "50", "100"] }}
            />
          )}
        </Spin>
      )}

      {/* Tabla de no devueltos */}
      {tipo === "no-devueltos" && (
        <Spin spinning={noDevueltos.isFetching && !noDevueltos.isLoading}>
          {isLoading ? (
            <TableSkeleton columns={skeletonColumnsNoDevueltos} rows={8} />
          ) : dataNoDevueltos.length === 0 ? (
            <EmptyState description="No hay libros no devueltos para los filtros seleccionados." />
          ) : (
            <BorderedTable<InformeNoDevuelto>
              rowKey={(r, i) => `${r.alumno?.uuid}-${r.libro?.uuid}-${i}`}
              columns={columnsNoDevueltos}
              dataSource={dataNoDevueltos}
              size="small"
              scroll={{ x: "max-content" }}
              pagination={{ pageSize: 50, showSizeChanger: true, pageSizeOptions: ["20", "50", "100"] }}
            />
          )}
        </Spin>
      )}
    </div>
  );
}
