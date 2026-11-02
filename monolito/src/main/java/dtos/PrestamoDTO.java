package dtos;

import java.time.LocalDate;

public record PrestamoDTO(
        String uuid,
        SimpleStudentDTO alumno,
        SimpleUserDTO atendidoPor,
        SimpleBookDTO libro,
        LocalDate fechaInicio,
        LocalDate fechaVencimiento,
        LocalDate fechaDevolucion
) {
}
