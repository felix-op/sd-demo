export interface Alumno {
  uuid: string;
  firstName: string;
  lastName: string;
  birthday: string;
  document: string;
}

export interface AlumnoInput {
  firstName: string;
  lastName: string;
  birthday: string;
  document: string;
}

export interface SimpleAlumno {
  uuid: string;
  document: string;
  firstName: string;
  lastName: string;
}
