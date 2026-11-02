import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestFn, toQueryString } from "@/lib/request";
import type { Usuario, UsuarioInput } from "@/models/usuario.model";

const BASE_PATH = "/usuarios";

interface UsuariosListParams {
  first?: number;
  total?: number;
}

const usuariosKeys = {
  all: ["usuarios"] as const,
  lists: () => [...usuariosKeys.all, "list"] as const,
  list: (params: UsuariosListParams) => [...usuariosKeys.lists(), params] as const,
  details: () => [...usuariosKeys.all, "detail"] as const,
  detail: (uuid: string) => [...usuariosKeys.details(), uuid] as const,
};

export function useGetUsuarios(params: UsuariosListParams = {}) {
  return useQuery({
    queryKey: usuariosKeys.list(params),
    queryFn: () => requestFn<Usuario[]>(`${BASE_PATH}${toQueryString(params)}`),
  });
}

export function useGetUsuario(uuid: string) {
  return useQuery({
    queryKey: usuariosKeys.detail(uuid),
    queryFn: () => requestFn<Usuario>(`${BASE_PATH}/${uuid}`),
    enabled: Boolean(uuid),
  });
}

export function usePostUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usuario: UsuarioInput) => requestFn<Usuario>(BASE_PATH, { method: "POST", body: usuario }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
}

export function usePutUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, usuario }: { uuid: string; usuario: UsuarioInput }) =>
      requestFn<Usuario>(`${BASE_PATH}/${uuid}`, { method: "PUT", body: usuario }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(variables.uuid) });
    },
  });
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => requestFn<void>(`${BASE_PATH}/${uuid}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
}
