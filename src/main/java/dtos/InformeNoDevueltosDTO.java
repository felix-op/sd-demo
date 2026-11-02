package dtos;

import java.time.LocalDate;

public record InformeNoDevueltosDTO(
        SimpleStudentDTO alumno,
        SimpleBookDTO libro,
        String autor,
        LocalDate fechaPrestamo,
        LocalDate fechaVencimiento,
        long diasRetraso
) {
}
