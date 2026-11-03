package dtos;

import java.time.LocalDate;

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
