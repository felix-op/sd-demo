"use client";

import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Alert, Button, Pagination, Spin, type TableColumnsType } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useGetAlumnos } from "@/api/alumnos.api";
import { getErrorInfo } from "@/lib/request";
import { getAvatarColor } from "@/lib/avatar-color";
import type { Alumno } from "@/models/alumno.model";
import { useAdminHeader, useAdminSearch } from "@/components/admin/admin-header-context";
import { EntityActionsMenu } from "@/components/admin/EntityActionsMenu";
import { EntityCard } from "@/components/admin/EntityCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { BorderedTable } from "@/components/admin/BorderedTable";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { CardListSkeleton } from "@/components/admin/CardListSkeleton";
import { AlumnoDeleteModal } from "./components/AlumnoDeleteModal";
import { AlumnoFormModal } from "./components/AlumnoFormModal";
import { AlumnoViewModal } from "./components/AlumnoViewModal";

type ModalState =
  | { type: "create" }
  | { type: "edit"; alumno: Alumno }
  | { type: "view"; alumno: Alumno }
  | { type: "delete"; alumno: Alumno }
  | null;

const PAGE_SIZE_OPTIONS = ["10", "20", "50"];

const SKELETON_COLUMNS = [
  { title: "Apellido" },
  { title: "Nombre" },
  { title: "Documento", width: 140 },
  { title: "Nacimiento", width: 130 },
  { title: "UUID", width: 220 },
  { title: "Acciones", width: 72, variant: "avatar" as const },
];

function showTotal(total: number, range: [number, number]) {
  return `Mostrando ${range[0]}-${range[1]} de ${total} alumnos`;
}

export default function AlumnosPage() {
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetAlumnos();
  const [search, setSearch] = useAdminSearch();
  const [modal, setModal] = useState<ModalState>(null);

  const openCreate = useCallback(() => setModal({ type: "create" }), []);

  useAdminHeader({
    title: "Gestión de Alumnos",
    searchPlaceholder: "Buscar por nombre, apellido o documento...",
    createLabel: "Crear alumno",
    onCreate: openCreate,
    loading: isLoading,
  });

  const items = useMemo(() => data ?? [], [data]);
  const hasActiveFilters = search.trim().length > 0;

  const filteredAlumnos = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (alumno) =>
        `${alumno.firstName} ${alumno.lastName}`.toLowerCase().includes(query) ||
        alumno.document.toLowerCase().includes(query),
    );
  }, [items, search]);

  // Paginado 100% client-side: el backend devuelve el array completo.
  // Se deriva (no se guarda en estado) para que nunca quede "pagina" apuntando
  // a una página que dejó de existir al filtrar o cambiar el tamaño de página.
  const totalPaginas = Math.max(1, Math.ceil(filteredAlumnos.length / porPagina));
  const currentPagina = Math.min(pagina, totalPaginas);
  const paginatedAlumnos = useMemo(
    () => filteredAlumnos.slice((currentPagina - 1) * porPagina, currentPagina * porPagina),
    [filteredAlumnos, currentPagina, porPagina],
  );

  function openView(alumno: Alumno) {
    setModal({ type: "view", alumno });
  }
  function openEdit(alumno: Alumno) {
    setModal({ type: "edit", alumno });
  }
  function openDelete(alumno: Alumno) {
    setModal({ type: "delete", alumno });
  }

  function renderActions(alumno: Alumno) {
    return (
      <EntityActionsMenu
        onView={() => openView(alumno)}
        onEdit={() => openEdit(alumno)}
        onDelete={() => openDelete(alumno)}
      />
    );
  }

  function handlePageChange(page: number, pageSize: number) {
    setPagina(page);
    setPorPagina(pageSize);
  }

  const columns: TableColumnsType<Alumno> = [
    { title: "Apellido", dataIndex: "lastName", key: "lastName" },
    { title: "Nombre", dataIndex: "firstName", key: "firstName" },
    { title: "Documento", dataIndex: "document", key: "document", width: 140 },
    {
      title: "Nacimiento",
      dataIndex: "birthday",
      key: "birthday",
      width: 130,
      render: (birthday: string) => (birthday ? dayjs(birthday).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "UUID",
      dataIndex: "uuid",
      key: "uuid",
      width: 220,
      ellipsis: true,
      render: (uuid: string) => <span style={{ fontFamily: "monospace", fontSize: 12 }}>{uuid}</span>,
    },
    {
      title: "Acciones",
      key: "actions",
      width: 72,
      fixed: "right",
      render: (_, alumno) => renderActions(alumno),
    },
  ];

  const errorInfo = isError ? getErrorInfo(error) : null;

  const emptyText = isError
    ? "No se pudieron cargar los alumnos."
    : hasActiveFilters
      ? "No hay alumnos que coincidan con la búsqueda."
      : "Todavía no hay alumnos cargados.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {hasActiveFilters && (
        <Alert
          type="info"
          showIcon
          title={`Filtrando por "${search}" — ${filteredAlumnos.length} de ${items.length} alumnos`}
          action={
            <Button size="small" onClick={() => setSearch("")}>
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

      {/* Desktop: decidido por CSS (md:), no por JS, para que no dependa de que el
          navegador ya haya resuelto matchMedia (evita el flash mobile-en-desktop). */}
      <div className="hidden md:block">
        {isLoading ? (
          <TableSkeleton columns={SKELETON_COLUMNS} rows={porPagina} />
        ) : (
          <Spin spinning={isFetching}>
            <BorderedTable<Alumno>
              rowKey="uuid"
              columns={columns}
              dataSource={filteredAlumnos}
              size="small"
              scroll={{ x: "max-content" }}
              locale={{ emptyText: <EmptyState description={emptyText} /> }}
              pagination={{
                current: currentPagina,
                pageSize: porPagina,
                total: filteredAlumnos.length,
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
            {filteredAlumnos.length === 0 ? (
              <EmptyState description={emptyText} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {paginatedAlumnos.map((alumno) => (
                  <EntityCard
                    key={alumno.uuid}
                    avatarIcon={<UserOutlined />}
                    avatarColor={getAvatarColor(alumno.uuid)}
                    title={`${alumno.lastName}, ${alumno.firstName}`}
                    actions={renderActions(alumno)}
                    fields={[
                      { label: "Documento", value: alumno.document },
                      {
                        label: "Nacimiento",
                        value: alumno.birthday ? dayjs(alumno.birthday).format("DD/MM/YYYY") : "-",
                      },
                      { label: "UUID", value: alumno.uuid, monospace: true },
                    ]}
                  />
                ))}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <Pagination
                current={currentPagina}
                pageSize={porPagina}
                total={filteredAlumnos.length}
                showSizeChanger
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onChange={handlePageChange}
                size="small"
              />
            </div>
          </Spin>
        )}
      </div>

      <AlumnoFormModal
        open={modal?.type === "create" || modal?.type === "edit"}
        alumno={modal?.type === "edit" ? modal.alumno : undefined}
        onClose={() => setModal(null)}
      />
      <AlumnoViewModal
        open={modal?.type === "view"}
        alumno={modal?.type === "view" ? modal.alumno : undefined}
        onClose={() => setModal(null)}
      />
      <AlumnoDeleteModal
        open={modal?.type === "delete"}
        alumno={modal?.type === "delete" ? modal.alumno : undefined}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
