import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestFn } from "@/lib/request";
import type { Libro, LibroInput } from "@/models/libro.model";

const BASE_PATH = "/libros";

const librosKeys = {
  all: ["libros"] as const,
  list: () => [...librosKeys.all, "list"] as const,
  details: () => [...librosKeys.all, "detail"] as const,
  detail: (uuid: string) => [...librosKeys.details(), uuid] as const,
};

export function useGetLibros() {
  return useQuery({
    queryKey: librosKeys.list(),
    queryFn: () => requestFn<Libro[]>(BASE_PATH),
  });
}

export function useGetLibro(uuid: string) {
  return useQuery({
    queryKey: librosKeys.detail(uuid),
    queryFn: () => requestFn<Libro>(`${BASE_PATH}/${uuid}`),
    enabled: Boolean(uuid),
  });
}

export function usePostLibro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (libro: LibroInput) => requestFn<Libro>(BASE_PATH, { method: "POST", body: libro }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: librosKeys.list() });
    },
  });
}

export function usePutLibro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, libro }: { uuid: string; libro: LibroInput }) =>
      requestFn<Libro>(`${BASE_PATH}/${uuid}`, { method: "PUT", body: libro }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: librosKeys.list() });
      queryClient.invalidateQueries({ queryKey: librosKeys.detail(variables.uuid) });
    },
  });
}

export function useDeleteLibro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => requestFn<void>(`${BASE_PATH}/${uuid}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: librosKeys.list() });
    },
  });
}
