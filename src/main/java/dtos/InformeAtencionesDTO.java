package dtos;

import java.time.LocalDate;

public record InformeAtencionesDTO(
        String libro,
        String autor,
        LocalDate fechaAtencion,
        SimpleStudentDTO alumno
) {
}
