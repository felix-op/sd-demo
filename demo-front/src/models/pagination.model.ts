export interface PageParams {
  pagina: number;
  porPagina: number;
}

export interface Page<T> {
  items: T[];
  pagina: number;
  porPagina: number;
  totalItems: number;
  totalPaginas: number;
}
