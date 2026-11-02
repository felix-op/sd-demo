import type { SimpleAlumno } from "./alumno.model";

export interface Libro {
  uuid: string;
  title: string;
  author: string;
  rented: boolean;
  numPages: number | null;
  pubDate: string | null;
  description: string | null;
  alumnosConPrestamo: SimpleAlumno[];
}

export interface SimpleLibro {
  uuid: string;
  title: string;
}

export interface LibroInput {
  title: string;
  author: string;
  numPages?: number;
  pubDate?: string;
  description?: string;
}
