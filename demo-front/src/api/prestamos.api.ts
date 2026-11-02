import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestFn, toQueryString } from "@/lib/request";
import type { Page } from "@/models/pagination.model";
import type { Prestamo, PrestamoCreate } from "@/models/prestamo.model";

const BASE_PATH = "/prestamos";

export interface PrestamosListParams {
  pagina?: number;
  porPagina?: number;
  alumno?: string;
  atendidoPor?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

const prestamosKeys = {
  all: ["prestamos"] as const,
  lists: () => [...prestamosKeys.all, "list"] as const,
  list: (params: PrestamosListParams) => [...prestamosKeys.lists(), params] as const,
  details: () => [...prestamosKeys.all, "detail"] as const,
  detail: (uuid: string) => [...prestamosKeys.details(), uuid] as const,
};

export function useGetPrestamos(params: PrestamosListParams = {}) {
  return useQuery({
    queryKey: prestamosKeys.list(params),
    queryFn: () => requestFn<Page<Prestamo>>(`${BASE_PATH}${toQueryString(params)}`),
    // Mantiene la página anterior visible mientras llega la siguiente (evita parpadeos al paginar/filtrar).
    placeholderData: keepPreviousData,
  });
}

export function useGetPrestamo(uuid: string) {
  return useQuery({
    queryKey: prestamosKeys.detail(uuid),
    queryFn: () => requestFn<Prestamo>(`${BASE_PATH}/${uuid}`),
    enabled: Boolean(uuid),
  });
}

export function usePostPrestamo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prestamo: PrestamoCreate) =>
      requestFn<Prestamo>(BASE_PATH, { method: "POST", body: prestamo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prestamosKeys.lists() });
    },
  });
}

export function usePostDevolucion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, fecha }: { uuid: string; fecha?: string }) =>
      requestFn<void>(`${BASE_PATH}/${uuid}/devolucion${toQueryString({ fecha })}`, {
        method: "POST",
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: prestamosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: prestamosKeys.detail(variables.uuid) });
    },
  });
}
