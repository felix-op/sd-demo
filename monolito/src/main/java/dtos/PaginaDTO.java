package dtos;

import java.util.List;

public record PaginaDTO<T>(
        List<T> items,
        int pagina, // Página actual, empieza en 1
        int porPagina, // Cantidad máxima de elementos por página
        long totalItems,
        int totalPaginas
) {
}
