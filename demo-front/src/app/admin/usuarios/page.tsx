"use client";

import { useCallback, useMemo, useState } from "react";
import { Alert, Button, Pagination, Spin, type TableColumnsType } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useGetUsuarios } from "@/api/usuarios.api";
import { getErrorInfo } from "@/lib/request";
import { getAvatarColor } from "@/lib/avatar-color";
import type { Usuario } from "@/models/usuario.model";
import { useAdminHeader, useAdminSearch } from "@/components/admin/admin-header-context";
import { EntityActionsMenu } from "@/components/admin/EntityActionsMenu";
import { EntityCard } from "@/components/admin/EntityCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { BorderedTable } from "@/components/admin/BorderedTable";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { CardListSkeleton } from "@/components/admin/CardListSkeleton";
import { UsuarioDeleteModal } from "./components/UsuarioDeleteModal";
import { UsuarioFormModal } from "./components/UsuarioFormModal";
import { UsuarioViewModal } from "./components/UsuarioViewModal";

type ModalState =
  | { type: "create" }
  | { type: "edit"; usuario: Usuario }
  | { type: "view"; usuario: Usuario }
  | { type: "delete"; usuario: Usuario }
  | null;

const PAGE_SIZE_OPTIONS = ["10", "20", "50"];

const SKELETON_COLUMNS = [
  { title: "Nombre" },
  { title: "Documento", width: 160 },
  { title: "UUID", width: 220 },
  { title: "Acciones", width: 72, variant: "avatar" as const },
];

function showTotal(total: number, range: [number, number]) {
  return `Mostrando ${range[0]}-${range[1]} de ${total} usuarios`;
}

export default function UsuariosPage() {
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetUsuarios();
  const [search, setSearch] = useAdminSearch();
  const [modal, setModal] = useState<ModalState>(null);

  const openCreate = useCallback(() => setModal({ type: "create" }), []);

  useAdminHeader({
    title: "Gestión de Usuarios",
    searchPlaceholder: "Buscar por nombre o documento...",
    createLabel: "Crear usuario",
    onCreate: openCreate,
    loading: isLoading,
  });

  const items = useMemo(() => data ?? [], [data]);
  const hasActiveFilters = search.trim().length > 0;

  const filteredUsuarios = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (usuario) =>
        usuario.nombre?.toLowerCase().includes(query) ||
        usuario.documento?.toLowerCase().includes(query),
    );
  }, [items, search]);

  // Paginado 100% client-side: el backend devuelve el array completo.
  // Se deriva (no se guarda en estado) para que nunca quede "pagina" apuntando
  // a una página que dejó de existir al filtrar o cambiar el tamaño de página.
  const totalPaginas = Math.max(1, Math.ceil(filteredUsuarios.length / porPagina));
  const currentPagina = Math.min(pagina, totalPaginas);
  const paginatedUsuarios = useMemo(
    () => filteredUsuarios.slice((currentPagina - 1) * porPagina, currentPagina * porPagina),
    [filteredUsuarios, currentPagina, porPagina],
  );

  function openView(usuario: Usuario) {
    setModal({ type: "view", usuario });
  }
  function openEdit(usuario: Usuario) {
    setModal({ type: "edit", usuario });
  }
  function openDelete(usuario: Usuario) {
    setModal({ type: "delete", usuario });
  }

  function renderActions(usuario: Usuario) {
    return (
      <EntityActionsMenu
        onView={() => openView(usuario)}
        onEdit={() => openEdit(usuario)}
        onDelete={() => openDelete(usuario)}
      />
    );
  }

  function handlePageChange(page: number, pageSize: number) {
    setPagina(page);
    setPorPagina(pageSize);
  }

  const columns: TableColumnsType<Usuario> = [
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Documento", dataIndex: "documento", key: "documento", width: 160 },
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
      render: (_, usuario) => renderActions(usuario),
    },
  ];

  const errorInfo = isError ? getErrorInfo(error) : null;

  const emptyText = isError
    ? "No se pudieron cargar los usuarios."
    : hasActiveFilters
      ? "No hay usuarios que coincidan con la búsqueda."
      : "Todavía no hay usuarios cargados.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {hasActiveFilters && (
        <Alert
          type="info"
          showIcon
          title={`Filtrando por "${search}" — ${filteredUsuarios.length} de ${items.length} usuarios`}
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
            <BorderedTable<Usuario>
              rowKey="uuid"
              columns={columns}
              dataSource={filteredUsuarios}
              size="small"
              scroll={{ x: "max-content" }}
              locale={{ emptyText: <EmptyState description={emptyText} /> }}
              pagination={{
                current: currentPagina,
                pageSize: porPagina,
                total: filteredUsuarios.length,
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
            {filteredUsuarios.length === 0 ? (
              <EmptyState description={emptyText} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {paginatedUsuarios.map((usuario) => (
                  <EntityCard
                    key={usuario.uuid}
                    avatarIcon={<UserOutlined />}
                    avatarColor={getAvatarColor(usuario.uuid)}
                    title={usuario.nombre}
                    actions={renderActions(usuario)}
                    fields={[
                      { label: "Documento", value: usuario.documento },
                      { label: "UUID", value: usuario.uuid, monospace: true },
                    ]}
                  />
                ))}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <Pagination
                current={currentPagina}
                pageSize={porPagina}
                total={filteredUsuarios.length}
                showSizeChanger
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onChange={handlePageChange}
                size="small"
              />
            </div>
          </Spin>
        )}
      </div>

      <UsuarioFormModal
        open={modal?.type === "create" || modal?.type === "edit"}
        usuario={modal?.type === "edit" ? modal.usuario : undefined}
        onClose={() => setModal(null)}
      />
      <UsuarioViewModal
        open={modal?.type === "view"}
        usuario={modal?.type === "view" ? modal.usuario : undefined}
        onClose={() => setModal(null)}
      />
      <UsuarioDeleteModal
        open={modal?.type === "delete"}
        usuario={modal?.type === "delete" ? modal.usuario : undefined}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
