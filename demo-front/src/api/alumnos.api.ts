import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestFn, toQueryString } from "@/lib/request";
import type { Alumno } from "@/models/alumno.model";

const BASE_PATH = "/alumnos";

interface AlumnosListParams {
  first?: number;
  total?: number;
}

const alumnosKeys = {
  all: ["alumnos"] as const,
  lists: () => [...alumnosKeys.all, "list"] as const,
  list: (params: AlumnosListParams) => [...alumnosKeys.lists(), params] as const,
  details: () => [...alumnosKeys.all, "detail"] as const,
  detail: (uuid: string) => [...alumnosKeys.details(), uuid] as const,
};

export function useGetAlumnos(params: AlumnosListParams = {}) {
  return useQuery({
    queryKey: alumnosKeys.list(params),
    queryFn: () => requestFn<Alumno[]>(`${BASE_PATH}${toQueryString(params)}`),
  });
}

export function useGetAlumno(uuid: string) {
  return useQuery({
    queryKey: alumnosKeys.detail(uuid),
    queryFn: () => requestFn<Alumno>(`${BASE_PATH}/${uuid}`),
    enabled: Boolean(uuid),
  });
}

export function usePostAlumno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alumno: Alumno) => requestFn<Alumno>(BASE_PATH, { method: "POST", body: alumno }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumnosKeys.lists() });
    },
  });
}

export function usePutAlumno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, alumno }: { uuid: string; alumno: Alumno }) =>
      requestFn<Alumno>(`${BASE_PATH}/${uuid}`, { method: "PUT", body: alumno }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: alumnosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alumnosKeys.detail(variables.uuid) });
    },
  });
}

export function useDeleteAlumno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => requestFn<void>(`${BASE_PATH}/${uuid}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumnosKeys.lists() });
    },
  });
}
