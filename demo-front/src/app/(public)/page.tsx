"use client";

import { Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <>
      <Title level={2}>Catálogo de libros</Title>
      <Paragraph type="secondary">
        Página pública de la biblioteca. Acá va a vivir la búsqueda y el listado de libros disponibles.
      </Paragraph>
    </>
  );
}
