package dtos;

import java.time.LocalDate;

public record PrestamoCreateDTO(
        String alumno,
        String atendidoPor,
        String libro,
        LocalDate fechaInicio
) {
}
