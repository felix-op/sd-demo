package dtos;

import java.time.LocalDate;
import java.util.List;

public record BookDTO(
        String uuid,
        String title,
        String author,
        boolean rented,
        int numPages,
        LocalDate pubDate,
        String description,
        List<SimpleStudentDTO> alumnosConPrestamo
) {
}
