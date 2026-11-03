package dtos;

import java.util.List;

public record PaginaDTO<T>(
        List<T> items,
        int pagina,
        int porPagina,
        long totalItems,
        int totalPaginas
) {
}
