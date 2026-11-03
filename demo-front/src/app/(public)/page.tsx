"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Card, Col, Input, Modal, Row, Spin, Tag, Typography } from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ReadOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetCatalogo } from "@/api/catalogo.api";
import { PALETTE } from "@/components/app-theme-provider";
import { EmptyState } from "@/components/admin/EmptyState";
import { getErrorInfo } from "@/lib/request";
import type { CatalogoLibro } from "@/models/catalogo.model";

const { Title, Text, Paragraph } = Typography;

type AvailabilityFilter = "todos" | "disponibles";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "-";
  return dayjs(date).format("DD/MM/YYYY");
}

export default function CatalogoPublicoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("todos");
  const [includeDescription, setIncludeDescription] = useState(false);
  const [selectedBook, setSelectedBook] = useState<CatalogoLibro | null>(null);

  const { data = [], isLoading, isError, error, refetch } = useGetCatalogo();

  // Filtrado reactivo en tiempo real al escribir o cambiar chips
  const filteredBooks = useMemo(() => {
    const term = normalizeText(searchQuery);

    return data.filter((libro) => {
      // Filtro de disponibilidad
      if (availabilityFilter === "disponibles" && !libro.available) {
        return false;
      }

      // Sin texto de búsqueda -> pasa el filtro de disponibilidad
      if (!term) return true;

      const titleMatches = normalizeText(libro.title || "").includes(term);
      const authorMatches = normalizeText(libro.author || "").includes(term);
      const descriptionMatches =
        includeDescription && libro.description ? normalizeText(libro.description).includes(term) : false;

      return titleMatches || authorMatches || descriptionMatches;
    });
  }, [data, searchQuery, availabilityFilter, includeDescription]);

  const errorInfo = isError ? getErrorInfo(error) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Encabezado y buscador central */}
      <div
        style={{
          textAlign: "center",
          maxWidth: 680,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Title
            level={2}
            style={{
              color: PALETTE.forest,
              margin: 0,
              fontSize: "clamp(24px, 4vw, 32px)",
              letterSpacing: "-0.02em",
            }}
          >
            Catálogo de Libros
          </Title>
          <Text style={{ color: PALETTE.text, fontSize: 15, opacity: 0.85 }}>
            Explorá los títulos de nuestra colección bibliográfica en tiempo real
          </Text>
        </div>

        {/* Buscador central */}
        <Input
          size="large"
          allowClear
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          prefix={<SearchOutlined style={{ color: PALETTE.olive, fontSize: 18, marginRight: 6 }} />}
          placeholder={
            includeDescription
              ? "Buscar por título, autor o contenido de descripción..."
              : "Buscar por título o autor..."
          }
          style={{
            borderRadius: 16,
            padding: "10px 16px",
            borderColor: PALETTE.border,
            background: PALETTE.card,
            boxShadow: "0 2px 8px rgba(47, 82, 51, 0.06)",
            fontSize: 16,
          }}
        />

        {/* Chips de filtro */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Chip Todos */}
          <Tag.CheckableTag
            checked={availabilityFilter === "todos"}
            onChange={() => setAvailabilityFilter("todos")}
            style={{
              borderRadius: 20,
              padding: "5px 16px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              background: availabilityFilter === "todos" ? PALETTE.forest : PALETTE.card,
              color: availabilityFilter === "todos" ? PALETTE.cream : PALETTE.text,
              border: `1px solid ${availabilityFilter === "todos" ? PALETTE.forest : PALETTE.border}`,
              transition: "all 0.2s ease",
            }}
          >
            Todos
          </Tag.CheckableTag>

          {/* Chip Disponibles */}
          <Tag.CheckableTag
            checked={availabilityFilter === "disponibles"}
            onChange={() =>
              setAvailabilityFilter((prev) => (prev === "disponibles" ? "todos" : "disponibles"))
            }
            style={{
              borderRadius: 20,
              padding: "5px 16px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              background: availabilityFilter === "disponibles" ? PALETTE.forest : PALETTE.card,
              color: availabilityFilter === "disponibles" ? PALETTE.cream : PALETTE.text,
              border: `1px solid ${availabilityFilter === "disponibles" ? PALETTE.forest : PALETTE.border}`,
              transition: "all 0.2s ease",
            }}
          >
            <CheckCircleOutlined style={{ marginRight: 6 }} />
            Solo disponibles
          </Tag.CheckableTag>

          {/* Chip Buscar en descripción */}
          <Tag.CheckableTag
            checked={includeDescription}
            onChange={(checked) => setIncludeDescription(checked)}
            style={{
              borderRadius: 20,
              padding: "5px 16px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              background: includeDescription ? PALETTE.olive : PALETTE.card,
              color: includeDescription ? "#ffffff" : PALETTE.text,
              border: `1px solid ${includeDescription ? PALETTE.olive : PALETTE.border}`,
              transition: "all 0.2s ease",
            }}
          >
            <FileTextOutlined style={{ marginRight: 6 }} />
            Buscar en descripción
          </Tag.CheckableTag>
        </div>
      </div>

      {/* Manejo de errores */}
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

      {/* Indicador de estado y total */}
      {!isLoading && !isError && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 4px",
          }}
        >
          <Text type="secondary" style={{ fontSize: 14 }}>
            {filteredBooks.length === 1
              ? "1 libro encontrado"
              : `${filteredBooks.length} libros encontrados`}
            {searchQuery && <span> para &ldquo;{searchQuery}&rdquo;</span>}
          </Text>
          {(searchQuery || availabilityFilter !== "todos" || includeDescription) && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                setSearchQuery("");
                setAvailabilityFilter("todos");
                setIncludeDescription(false);
              }}
              style={{ color: PALETTE.olive, padding: 0 }}
            >
              Restablecer filtros
            </Button>
          )}
        </div>
      )}

      {/* Listado de libros */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 12, color: PALETTE.text }}>Cargando catálogo...</div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div
          style={{
            background: PALETTE.card,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: 16,
            padding: "48px 16px",
          }}
        >
          <EmptyState
            description={
              searchQuery || availabilityFilter !== "todos"
                ? "No se encontraron libros que coincidan con la búsqueda."
                : "Aún no hay libros en el catálogo."
            }
          />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredBooks.map((libro) => (
            <Col xs={24} sm={12} lg={8} key={libro.uuid}>
              <Card
                hoverable
                onClick={() => setSelectedBook(libro)}
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  background: PALETTE.card,
                  borderColor: PALETTE.border,
                  borderRadius: 14,
                  overflow: "hidden",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                styles={{
                  body: {
                    padding: 18,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    gap: 12,
                  },
                }}
              >
                {/* Cabecera del libro: Título y Chip de disponibilidad */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      color: PALETTE.forest,
                      fontSize: 17,
                      lineHeight: 1.3,
                      flex: 1,
                    }}
                  >
                    {libro.title}
                  </Title>
                  {libro.available ? (
                    <Tag
                      color="success"
                      style={{
                        margin: 0,
                        borderRadius: 12,
                        padding: "2px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircleOutlined style={{ marginRight: 4 }} />
                      Disponible
                    </Tag>
                  ) : (
                    <Tag
                      color="default"
                      style={{
                        margin: 0,
                        borderRadius: 12,
                        padding: "2px 10px",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#8c8266",
                        flexShrink: 0,
                      }}
                    >
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      Prestado
                    </Tag>
                  )}
                </div>

                {/* Autor */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: PALETTE.text }}>
                  <UserOutlined style={{ color: PALETTE.olive, fontSize: 14 }} />
                  <Text strong style={{ color: PALETTE.text, fontSize: 14 }}>
                    {libro.author}
                  </Text>
                </div>

                {/* Descripción (si existe) */}
                {libro.description ? (
                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{
                      color: PALETTE.text,
                      fontSize: 13,
                      margin: 0,
                      opacity: 0.85,
                      flex: 1,
                    }}
                  >
                    {libro.description}
                  </Paragraph>
                ) : (
                  <div style={{ flex: 1 }} />
                )}

                {/* Metadatos al pie: páginas y publicación */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 14,
                    paddingTop: 10,
                    borderTop: `1px solid ${PALETTE.border}`,
                    fontSize: 12,
                    color: PALETTE.text,
                    opacity: 0.8,
                  }}
                >
                  {libro.numPages != null && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <BookOutlined style={{ color: PALETTE.olive }} />
                      {libro.numPages} págs.
                    </span>
                  )}
                  {libro.pubDate && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <CalendarOutlined style={{ color: PALETTE.olive }} />
                      {formatDate(libro.pubDate)}
                    </span>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal de detalle */}
      <Modal
        open={Boolean(selectedBook)}
        onCancel={() => setSelectedBook(null)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setSelectedBook(null)}
            style={{ background: PALETTE.forest, borderColor: PALETTE.forest }}
          >
            Cerrar
          </Button>,
        ]}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ReadOutlined style={{ color: PALETTE.forest, fontSize: 20 }} />
            <span style={{ color: PALETTE.forest }}>Detalle del libro</span>
          </div>
        }
      >
        {selectedBook && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 12 }}>
            <div>
              <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase" }}>
                Título
              </Text>
              <Title level={3} style={{ margin: "2px 0 0", color: PALETTE.forest }}>
                {selectedBook.title}
              </Title>
            </div>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase" }}>
                  Autor
                </Text>
                <div style={{ fontWeight: 600, color: PALETTE.text, fontSize: 15 }}>
                  {selectedBook.author}
                </div>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase" }}>
                  Estado
                </Text>
                <div style={{ marginTop: 2 }}>
                  {selectedBook.available ? (
                    <Tag color="success">
                      <CheckCircleOutlined style={{ marginRight: 4 }} />
                      Disponible para préstamo
                    </Tag>
                  ) : (
                    <Tag color="default">
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      Actualmente prestado
                    </Tag>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {selectedBook.numPages != null && (
                <div>
                  <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase" }}>
                    Páginas
                  </Text>
                  <div style={{ color: PALETTE.text }}>{selectedBook.numPages} páginas</div>
                </div>
              )}
              {selectedBook.pubDate && (
                <div>
                  <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase" }}>
                    Fecha de publicación
                  </Text>
                  <div style={{ color: PALETTE.text }}>{formatDate(selectedBook.pubDate)}</div>
                </div>
              )}
            </div>

            {selectedBook.description && (
              <div>
                <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase" }}>
                  Descripción
                </Text>
                <Paragraph
                  style={{
                    marginTop: 4,
                    color: PALETTE.text,
                    background: PALETTE.cream,
                    padding: 12,
                    borderRadius: 8,
                    border: `1px solid ${PALETTE.border}`,
                    whiteSpace: "pre-line",
                  }}
                >
                  {selectedBook.description}
                </Paragraph>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
