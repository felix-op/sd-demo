import { useQuery } from "@tanstack/react-query";
import { requestFn, toQueryString } from "@/lib/request";
import type { InformeAtencion, InformeNoDevuelto } from "@/models/informe.model";

const BASE_PATH = "/informes";

export interface InformesAtencionesParams {
  atendidoPor?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface InformesNoDevueltosParams {
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

const informesKeys = {
  all: ["informes"] as const,
  atenciones: (params: InformesAtencionesParams) => [...informesKeys.all, "atenciones", params] as const,
  noDevueltos: (params: InformesNoDevueltosParams) => [...informesKeys.all, "no-devueltos", params] as const,
};

export function useGetInformeAtenciones(params: InformesAtencionesParams = {}) {
  return useQuery({
    queryKey: informesKeys.atenciones(params),
    queryFn: () => requestFn<InformeAtencion[]>(`${BASE_PATH}/atenciones${toQueryString(params)}`),
  });
}

export function useGetInformeNoDevueltos(params: InformesNoDevueltosParams = {}) {
  return useQuery({
    queryKey: informesKeys.noDevueltos(params),
    queryFn: () => requestFn<InformeNoDevuelto[]>(`${BASE_PATH}/no-devueltos${toQueryString(params)}`),
  });
}
