import type { SimpleLibro } from "./libro.model";

export interface Alumno {
  uuid: string;
  firstName: string;
  lastName: string;
  birthday: string;
  document: string;
  librosPrestados: SimpleLibro[];
}

export interface SimpleAlumno {
  uuid: string;
  document: string;
  firstName: string;
  lastName: string;
}
