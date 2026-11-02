package dtos;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.time.LocalDate;

public record PrestamoCreateDTO(
        @Schema(required = true) String alumno,
        @Schema(required = true) String atendidoPor,
        @Schema(required = true) String libro,
        LocalDate fechaInicio
) {
}
