"use client";

import { useCallback, useMemo, useState } from "react";
import { Alert, Button, Pagination, Spin, Tag, type TableColumnsType } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { useGetLibros } from "@/api/libros.api";
import { getErrorInfo } from "@/lib/request";
import { getAvatarColor } from "@/lib/avatar-color";
import type { Libro } from "@/models/libro.model";
import { useAdminHeader, useAdminSearch } from "@/components/admin/admin-header-context";
import { EntityActionsMenu } from "@/components/admin/EntityActionsMenu";
import { EntityCard } from "@/components/admin/EntityCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { BorderedTable } from "@/components/admin/BorderedTable";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { CardListSkeleton } from "@/components/admin/CardListSkeleton";
import { LibroDeleteModal } from "./components/LibroDeleteModal";
import { LibroFormModal } from "./components/LibroFormModal";
import { LibroViewModal } from "./components/LibroViewModal";

type ModalState =
  | { type: "create" }
  | { type: "edit"; libro: Libro }
  | { type: "view"; libro: Libro }
  | { type: "delete"; libro: Libro }
  | null;

const PAGE_SIZE_OPTIONS = ["10", "20", "50"];

const SKELETON_COLUMNS = [
  { title: "Título" },
  { title: "Autor" },
  { title: "UUID", width: 220 },
  { title: "Prestado", width: 120 },
  { title: "Acciones", width: 72, variant: "avatar" as const },
];

function showTotal(total: number, range: [number, number]) {
  return `Mostrando ${range[0]}-${range[1]} de ${total} libros`;
}

export default function LibrosPage() {
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetLibros();
  const [search, setSearch] = useAdminSearch();
  const [modal, setModal] = useState<ModalState>(null);

  const openCreate = useCallback(() => setModal({ type: "create" }), []);

  useAdminHeader({
    title: "Gestión de Libros",
    searchPlaceholder: "Buscar por título o autor...",
    createLabel: "Crear libro",
    onCreate: openCreate,
    loading: isLoading,
  });

  const items = useMemo(() => data ?? [], [data]);
  const hasActiveFilters = search.trim().length > 0;

  const filteredLibros = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (libro) =>
        libro.title.toLowerCase().includes(query) || libro.author.toLowerCase().includes(query),
    );
  }, [items, search]);

  // Paginado 100% client-side: el backend devuelve el array completo.
  // Se deriva (no se guarda en estado) para que nunca quede "pagina" apuntando
  // a una página que dejó de existir al filtrar o cambiar el tamaño de página.
  const totalPaginas = Math.max(1, Math.ceil(filteredLibros.length / porPagina));
  const currentPagina = Math.min(pagina, totalPaginas);
  const paginatedLibros = useMemo(
    () => filteredLibros.slice((currentPagina - 1) * porPagina, currentPagina * porPagina),
    [filteredLibros, currentPagina, porPagina],
  );

  function openView(libro: Libro) {
    setModal({ type: "view", libro });
  }
  function openEdit(libro: Libro) {
    setModal({ type: "edit", libro });
  }
  function openDelete(libro: Libro) {
    setModal({ type: "delete", libro });
  }

  function renderActions(libro: Libro) {
    return (
      <EntityActionsMenu
        onView={() => openView(libro)}
        onEdit={() => openEdit(libro)}
        onDelete={() => openDelete(libro)}
      />
    );
  }

  function handlePageChange(page: number, pageSize: number) {
    setPagina(page);
    setPorPagina(pageSize);
  }

  const columns: TableColumnsType<Libro> = [
    { title: "Título", dataIndex: "title", key: "title" },
    { title: "Autor", dataIndex: "author", key: "author" },
    {
      title: "UUID",
      dataIndex: "uuid",
      key: "uuid",
      width: 220,
      ellipsis: true,
      render: (uuid: string) => <span style={{ fontFamily: "monospace", fontSize: 12 }}>{uuid}</span>,
    },
    {
      title: "Prestado",
      dataIndex: "rented",
      key: "rented",
      width: 120,
      render: (rented: boolean) => (
        <Tag color={rented ? "red" : "green"}>{rented ? "Prestado" : "Disponible"}</Tag>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 72,
      fixed: "right",
      render: (_, libro) => renderActions(libro),
    },
  ];

  const errorInfo = isError ? getErrorInfo(error) : null;

  const emptyText = isError
    ? "No se pudieron cargar los libros."
    : hasActiveFilters
      ? "No hay libros que coincidan con la búsqueda."
      : "Todavía no hay libros cargados.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {hasActiveFilters && (
        <Alert
          type="info"
          showIcon
          title={`Filtrando por "${search}" — ${filteredLibros.length} de ${items.length} libros`}
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
            <BorderedTable<Libro>
              rowKey="uuid"
              columns={columns}
              dataSource={filteredLibros}
              size="small"
              scroll={{ x: "max-content" }}
              locale={{ emptyText: <EmptyState description={emptyText} /> }}
              pagination={{
                current: currentPagina,
                pageSize: porPagina,
                total: filteredLibros.length,
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
            {filteredLibros.length === 0 ? (
              <EmptyState description={emptyText} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {paginatedLibros.map((libro) => (
                  <EntityCard
                    key={libro.uuid}
                    avatarIcon={<BookOutlined />}
                    avatarColor={getAvatarColor(libro.uuid)}
                    title={libro.title}
                    tag={{ label: libro.rented ? "Prestado" : "Disponible", color: libro.rented ? "red" : "green" }}
                    actions={renderActions(libro)}
                    fields={[
                      { label: "Autor", value: libro.author },
                      { label: "UUID", value: libro.uuid, monospace: true },
                    ]}
                  />
                ))}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <Pagination
                current={currentPagina}
                pageSize={porPagina}
                total={filteredLibros.length}
                showSizeChanger
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onChange={handlePageChange}
                size="small"
              />
            </div>
          </Spin>
        )}
      </div>

      <LibroFormModal
        open={modal?.type === "create" || modal?.type === "edit"}
        libro={modal?.type === "edit" ? modal.libro : undefined}
        onClose={() => setModal(null)}
      />
      <LibroViewModal
        open={modal?.type === "view"}
        libro={modal?.type === "view" ? modal.libro : undefined}
        onClose={() => setModal(null)}
      />
      <LibroDeleteModal
        open={modal?.type === "delete"}
        libro={modal?.type === "delete" ? modal.libro : undefined}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
