"use client";

import { useCallback, useState } from "react";
import { Alert, Button, DatePicker, Pagination, Select, Spin, type TableColumnsType } from "antd";
import { CheckCircleOutlined, SwapOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { useGetAlumnos } from "@/api/alumnos.api";
import { useGetPrestamos } from "@/api/prestamos.api";
import { useGetUsuarios } from "@/api/usuarios.api";
import { getErrorInfo } from "@/lib/request";
import { getAvatarColor } from "@/lib/avatar-color";
import type { Prestamo } from "@/models/prestamo.model";
import { useAdminHeader } from "@/components/admin/admin-header-context";
import { EntityActionsMenu } from "@/components/admin/EntityActionsMenu";
import { EntityCard } from "@/components/admin/EntityCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { BorderedTable } from "@/components/admin/BorderedTable";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { CardListSkeleton } from "@/components/admin/CardListSkeleton";
import { PrestamoDevolucionModal } from "./components/PrestamoDevolucionModal";
import { getPrestamoEstado, PrestamoEstadoTag } from "./components/PrestamoEstadoTag";
import { PrestamoFormModal } from "./components/PrestamoFormModal";
import { PrestamoViewModal } from "./components/PrestamoViewModal";

type ModalState =
  | { type: "create" }
  | { type: "view"; prestamo: Prestamo }
  | { type: "return"; prestamo: Prestamo }
  | null;

interface Filters {
  alumno?: string;
  atendidoPor?: string;
  rango?: [Dayjs | null, Dayjs | null] | null;
}

const PAGE_SIZE_OPTIONS = ["10", "20", "50"];

const SKELETON_COLUMNS = [
  { title: "Libro" },
  { title: "Alumno" },
  { title: "Atendido por" },
  { title: "Inicio", width: 110 },
  { title: "Vencimiento", width: 120 },
  { title: "Estado", width: 110 },
  { title: "Acciones", width: 72, variant: "avatar" as const },
];

const fmt = (date: string | null | undefined) => (date ? dayjs(date).format("DD/MM/YYYY") : "-");
const alumnoName = (p: Prestamo) => (p.alumno ? `${p.alumno.lastName}, ${p.alumno.firstName}` : "-");

function showTotal(total: number, range: [number, number]) {
  return `Mostrando ${range[0]}-${range[1]} de ${total} préstamos`;
}

export default function PrestamosPage() {
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [filters, setFilters] = useState<Filters>({});
  const [modal, setModal] = useState<ModalState>(null);

  const alumnos = useGetAlumnos();
  const usuarios = useGetUsuarios();

  // Paginado y filtros server-side: el backend devuelve { items, totalItems, ... }.
  const { data, isLoading, isFetching, isError, error, refetch } = useGetPrestamos({
    pagina,
    porPagina,
    alumno: filters.alumno,
    atendidoPor: filters.atendidoPor,
    fechaInicio: filters.rango?.[0]?.format("YYYY-MM-DD"),
    fechaFin: filters.rango?.[1]?.format("YYYY-MM-DD"),
  });

  const openCreate = useCallback(() => setModal({ type: "create" }), []);

  useAdminHeader({
    title: "Gestión de Préstamos",
    createLabel: "Registrar préstamo",
    onCreate: openCreate,
    loading: isLoading,
  });

  const items = data?.items ?? [];
  const totalItems = data?.totalItems ?? 0;
  const hasActiveFilters = Boolean(filters.alumno || filters.atendidoPor || filters.rango);

  function updateFilters(next: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...next }));
    setPagina(1);
  }

  function handlePageChange(page: number, pageSize: number) {
    setPagina(pageSize !== porPagina ? 1 : page);
    setPorPagina(pageSize);
  }

  function renderActions(prestamo: Prestamo) {
    return (
      <EntityActionsMenu
        onView={() => setModal({ type: "view", prestamo })}
        extraActions={
          prestamo.fechaDevolucion
            ? []
            : [
                {
                  key: "return",
                  label: "Registrar devolución",
                  icon: <CheckCircleOutlined style={{ fontSize: 16, color: "#2a9d8f" }} />,
                  onClick: () => setModal({ type: "return", prestamo }),
                },
              ]
        }
      />
    );
  }

  const columns: TableColumnsType<Prestamo> = [
    { title: "Libro", key: "libro", render: (_, p) => p.libro?.title ?? "-" },
    { title: "Alumno", key: "alumno", render: (_, p) => alumnoName(p) },
    { title: "Atendido por", key: "atendidoPor", render: (_, p) => p.atendidoPor?.nombre ?? "-" },
    { title: "Inicio", dataIndex: "fechaInicio", key: "fechaInicio", width: 110, render: fmt },
    { title: "Vencimiento", dataIndex: "fechaVencimiento", key: "fechaVencimiento", width: 120, render: fmt },
    { title: "Devolución", dataIndex: "fechaDevolucion", key: "fechaDevolucion", width: 110, render: fmt },
    { title: "Estado", key: "estado", width: 110, render: (_, p) => <PrestamoEstadoTag prestamo={p} /> },
    { title: "Acciones", key: "actions", width: 72, fixed: "right", render: (_, p) => renderActions(p) },
  ];

  const errorInfo = isError ? getErrorInfo(error) : null;

  const emptyText = isError
    ? "No se pudieron cargar los préstamos."
    : hasActiveFilters
      ? "No hay préstamos que coincidan con los filtros."
      : "Todavía no hay préstamos registrados.";

  const filtersBar = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Select
        allowClear
        showSearch={{ optionFilterProp: "label" }}
        placeholder="Filtrar por alumno"
        loading={alumnos.isLoading}
        value={filters.alumno}
        onChange={(value) => updateFilters({ alumno: value })}
        options={(alumnos.data ?? []).map((a) => ({
          value: a.uuid,
          label: `${a.lastName}, ${a.firstName} (${a.document})`,
        }))}
        style={{ minWidth: 220, flex: "1 1 220px" }}
      />
      <Select
        allowClear
        showSearch={{ optionFilterProp: "label" }}
        placeholder="Filtrar por atendido por"
        loading={usuarios.isLoading}
        value={filters.atendidoPor}
        onChange={(value) => updateFilters({ atendidoPor: value })}
        options={(usuarios.data ?? []).map((u) => ({ value: u.uuid, label: u.nombre }))}
        style={{ minWidth: 200, flex: "1 1 200px" }}
      />
      <DatePicker.RangePicker
        format="DD/MM/YYYY"
        placeholder={["Desde", "Hasta"]}
        value={filters.rango ?? null}
        onChange={(rango) => updateFilters({ rango })}
        style={{ flex: "1 1 260px" }}
      />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {filtersBar}

      {hasActiveFilters && (
        <Alert
          type="info"
          showIcon
          title={`Filtrando — ${totalItems} préstamos encontrados`}
          action={
            <Button
              size="small"
              onClick={() => {
                setFilters({});
                setPagina(1);
              }}
            >
              Limpiar filtros
            </Button>
          }
        />
      )}

      {errorInfo && (
        <Alert
          type="error"
          showIcon
          title={errorInfo.title}
          description={errorInfo.detail}
          action={
            <Button size="small" onClick={() => refetch()}>
              Reintentar
            </Button>
          }
        />
      )}

      <div className="hidden md:block">
        {isLoading ? (
          <TableSkeleton columns={SKELETON_COLUMNS} rows={porPagina} />
        ) : (
          <Spin spinning={isFetching}>
            <BorderedTable<Prestamo>
              rowKey="uuid"
              columns={columns}
              dataSource={items}
              size="small"
              scroll={{ x: "max-content" }}
              locale={{ emptyText: <EmptyState description={emptyText} /> }}
              pagination={{
                current: data?.pagina ?? pagina,
                pageSize: porPagina,
                total: totalItems,
                showSizeChanger: true,
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                showTotal,
                onChange: handlePageChange,
              }}
            />
          </Spin>
        )}
      </div>

      <div className="md:hidden">
        {isLoading ? (
          <CardListSkeleton rows={porPagina} />
        ) : (
          <Spin spinning={isFetching}>
            {items.length === 0 ? (
              <EmptyState description={emptyText} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((prestamo) => {
                  const estado = getPrestamoEstado(prestamo);
                  return (
                    <EntityCard
                      key={prestamo.uuid}
                      avatarIcon={<SwapOutlined />}
                      avatarColor={getAvatarColor(prestamo.uuid)}
                      title={prestamo.libro?.title ?? "Préstamo"}
                      tag={estado}
                      actions={renderActions(prestamo)}
                      fields={[
                        { label: "Alumno", value: alumnoName(prestamo) },
                        { label: "Atendido por", value: prestamo.atendidoPor?.nombre ?? "-" },
                        { label: "Inicio", value: fmt(prestamo.fechaInicio) },
                        { label: "Vencimiento", value: fmt(prestamo.fechaVencimiento) },
                        { label: "Devolución", value: fmt(prestamo.fechaDevolucion) },
                      ]}
                    />
                  );
                })}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <Pagination
                current={data?.pagina ?? pagina}
                pageSize={porPagina}
                total={totalItems}
                showSizeChanger
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onChange={handlePageChange}
                size="small"
              />
            </div>
          </Spin>
        )}
      </div>

      <PrestamoFormModal open={modal?.type === "create"} onClose={() => setModal(null)} />
      <PrestamoViewModal
        open={modal?.type === "view"}
        prestamo={modal?.type === "view" ? modal.prestamo : undefined}
        onClose={() => setModal(null)}
      />
      <PrestamoDevolucionModal
        open={modal?.type === "return"}
        prestamo={modal?.type === "return" ? modal.prestamo : undefined}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
