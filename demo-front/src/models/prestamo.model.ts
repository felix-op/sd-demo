import type { SimpleAlumno } from "./alumno.model";
import type { SimpleLibro } from "./libro.model";
import type { SimpleUsuario } from "./usuario.model";

export interface Prestamo {
  uuid: string;
  alumno: SimpleAlumno;
  atendidoPor: SimpleUsuario;
  libro: SimpleLibro;
  fechaInicio: string;
  fechaVencimiento: string;
  fechaDevolucion: string | null;
}

export interface PrestamoCreate {
  alumno: string;
  atendidoPor: string;
  libro: string;
  fechaInicio: string;
}
