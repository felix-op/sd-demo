package dtos;

import java.time.LocalDate;

// Vista pública de un libro: sin datos de los alumnos que lo tienen prestado
public record CatalogoDTO(
        String uuid,
        String title,
        String author,
        boolean available,
        int numPages,
        LocalDate pubDate,
        String description
) {
}
