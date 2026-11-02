import type { SimpleAlumno } from "./alumno.model";
import type { SimpleLibro } from "./libro.model";

export interface InformeAtencion {
  libro: string;
  autor: string;
  fechaAtencion: string;
  alumno: SimpleAlumno;
}

export interface InformeNoDevuelto {
  alumno: SimpleAlumno;
  libro: SimpleLibro;
  fechaVencimiento: string;
  diasRetraso: number;
}
