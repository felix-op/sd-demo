package dtos;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

public record BookDTO(
        String uuid,
        @Schema(required = true) String title,
        @Schema(required = true) String author,
        boolean rented,
        int numPages,
        LocalDate pubDate,
        String description,
        List<SimpleStudentDTO> alumnosConPrestamo
) {
}
