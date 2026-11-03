import { useQuery } from "@tanstack/react-query";
import { requestFn } from "@/lib/request";
import type { CatalogoLibro } from "@/models/catalogo.model";

const BASE_PATH = "/catalogo";

export const catalogoKeys = {
  all: ["catalogo"] as const,
  list: () => [...catalogoKeys.all, "list"] as const,
  detail: (uuid: string) => [...catalogoKeys.all, "detail", uuid] as const,
};

export function useGetCatalogo() {
  return useQuery({
    queryKey: catalogoKeys.list(),
    queryFn: () => requestFn<CatalogoLibro[]>(BASE_PATH),
  });
}

export function useGetCatalogoItem(uuid: string) {
  return useQuery({
    queryKey: catalogoKeys.detail(uuid),
    queryFn: () => requestFn<CatalogoLibro>(`${BASE_PATH}/${uuid}`),
    enabled: Boolean(uuid),
  });
}
